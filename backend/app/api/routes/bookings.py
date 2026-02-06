"""
Роутер бронирований.

Эндпоинты для записи и отмены записи на занятия:
- Создание бронирования (запись на занятие)
- Отмена бронирования
- Получение списка бронирований пользователя
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.booking import Booking
from app.models.lesson import Lesson
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.booking import BookingCreateRequest, BookingResponse
from app.schemas.direction import DirectionListResponse
from app.schemas.lesson import LessonResponse
from app.schemas.teacher import TeacherListResponse

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _build_booking_response(booking: Booking, user_id: int) -> BookingResponse:
    """Сформировать ответ бронирования с вложенным занятием."""
    lesson = booking.lesson
    active_bookings = [b for b in lesson.bookings if b.status == "active"]
    current_spots = len(active_bookings)
    is_booked = any(b.user_id == user_id and b.status == "active" for b in lesson.bookings)

    lesson_response = LessonResponse(
        id=lesson.id,
        direction=DirectionListResponse.model_validate(lesson.direction),
        teacher=TeacherListResponse(
            id=lesson.teacher.id,
            name=lesson.teacher.name,
            slug=lesson.teacher.slug,
            photo_url=lesson.teacher.photo_url,
            experience_years=lesson.teacher.experience_years,
            specializations=[d.name for d in lesson.teacher.directions],
        ),
        date=lesson.date.isoformat(),
        start_time=lesson.start_time.strftime("%H:%M"),
        end_time=lesson.end_time.strftime("%H:%M"),
        room=lesson.room,
        max_spots=lesson.max_spots,
        current_spots=current_spots,
        level=lesson.level,
        is_cancelled=lesson.is_cancelled,
        cancel_reason=lesson.cancel_reason,
        is_booked=is_booked,
    )

    return BookingResponse(
        id=booking.id,
        lesson=lesson_response,
        status=booking.status,
        booked_at=booking.booked_at,
        cancelled_at=booking.cancelled_at,
    )


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    body: BookingCreateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> BookingResponse:
    """
    Записаться на занятие.

    Бизнес-логика:
    1. Проверяем что баланс пользователя > 0 (есть оплаченные занятия)
    2. Проверяем что занятие существует и не отменено
    3. Проверяем что на занятии есть свободные места
    4. Проверяем что пользователь ещё не записан на это занятие
    5. Создаём бронирование со статусом active
    6. Списываем 1 занятие с баланса пользователя
    7. Создаём транзакцию списания (deduction)
    """
    # Шаг 1: Проверяем баланс
    if user.balance <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно занятий на балансе. Приобретите абонемент.",
        )

    # Шаг 2: Проверяем занятие
    result = await db.execute(
        select(Lesson)
        .where(Lesson.id == body.lesson_id)
        .options(
            selectinload(Lesson.direction),
            selectinload(Lesson.teacher),
            selectinload(Lesson.bookings),
        )
    )
    lesson = result.scalar_one_or_none()

    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Занятие не найдено",
        )

    if lesson.is_cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Занятие отменено",
        )

    # Шаг 3: Проверяем свободные места
    active_bookings = [b for b in lesson.bookings if b.status == "active"]
    if len(active_bookings) >= lesson.max_spots:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нет свободных мест на занятие",
        )

    # Шаг 4: Проверяем что пользователь ещё не записан
    already_booked = any(
        b.user_id == user.id and b.status == "active" for b in lesson.bookings
    )
    if already_booked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вы уже записаны на это занятие",
        )

    # Шаг 5: Создаём бронирование
    booking = Booking(
        user_id=user.id,
        lesson_id=lesson.id,
        status="active",
    )
    db.add(booking)

    # Шаг 6: Списываем 1 занятие с баланса
    user.balance -= 1

    # Шаг 7: Создаём транзакцию списания
    transaction = Transaction(
        user_id=user.id,
        type="deduction",
        amount=-1,
        description=f"Запись на занятие: {lesson.direction.name}, {lesson.date.isoformat()} {lesson.start_time.strftime('%H:%M')}",
        booking_id=booking.id,
    )
    db.add(transaction)

    await db.flush()

    return _build_booking_response(booking, user.id)


@router.delete("/{booking_id}", response_model=BookingResponse)
async def cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> BookingResponse:
    """
    Отменить запись на занятие.

    Бизнес-логика:
    1. Находим бронирование и проверяем что оно принадлежит пользователю
    2. Проверяем что бронирование в статусе active
    3. Меняем статус на cancelled, фиксируем время отмены
    4. Возвращаем 1 занятие на баланс пользователя
    5. Создаём транзакцию возврата (refund)
    """
    # Шаг 1: Находим бронирование
    result = await db.execute(
        select(Booking)
        .where(Booking.id == booking_id, Booking.user_id == user.id)
        .options(
            selectinload(Booking.lesson).selectinload(Lesson.direction),
            selectinload(Booking.lesson).selectinload(Lesson.teacher),
            selectinload(Booking.lesson).selectinload(Lesson.bookings),
        )
    )
    booking = result.scalar_one_or_none()

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Запись не найдена",
        )

    # Шаг 2: Проверяем статус
    if booking.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Запись уже отменена или завершена",
        )

    # Шаг 3: Отменяем бронирование
    booking.status = "cancelled"
    booking.cancelled_at = datetime.now(timezone.utc)

    # Шаг 4: Возвращаем занятие на баланс
    user.balance += 1

    # Шаг 5: Создаём транзакцию возврата
    lesson = booking.lesson
    transaction = Transaction(
        user_id=user.id,
        type="refund",
        amount=1,
        description=f"Отмена записи: {lesson.direction.name}, {lesson.date.isoformat()} {lesson.start_time.strftime('%H:%M')}",
        booking_id=booking.id,
    )
    db.add(transaction)

    await db.flush()

    return _build_booking_response(booking, user.id)


@router.get("/my", response_model=list[BookingResponse])
async def get_my_bookings(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    status_filter: str | None = Query(None, alias="status", description="Фильтр по статусу: active, cancelled, attended"),
) -> list[BookingResponse]:
    """
    Получить список бронирований текущего пользователя.
    Можно фильтровать по статусу. По умолчанию возвращает все.
    Сортировка: сначала ближайшие по дате занятия.
    """
    query = (
        select(Booking)
        .where(Booking.user_id == user.id)
        .options(
            selectinload(Booking.lesson).selectinload(Lesson.direction),
            selectinload(Booking.lesson).selectinload(Lesson.teacher),
            selectinload(Booking.lesson).selectinload(Lesson.bookings),
        )
    )

    if status_filter is not None:
        query = query.where(Booking.status == status_filter)

    # Сортируем по дате занятия (ближайшие сверху)
    query = query.order_by(Booking.booked_at.desc())

    result = await db.execute(query)
    bookings = result.scalars().all()

    return [_build_booking_response(b, user.id) for b in bookings]
