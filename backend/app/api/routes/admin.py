"""
Роутер администрирования.

Эндпоинты для админ-панели (требуют права администратора):
- Дашборд со статистикой
- CRUD занятий
- Управление учениками
- Отметка посещений
- Рассылка (заглушка)
"""

from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_admin
from app.database import get_db
from app.models.booking import Booking
from app.models.lesson import Lesson
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/admin", tags=["admin"])


# ---------- Схемы запросов для админки ----------

class DashboardResponse(BaseModel):
    """Статистика для дашборда админки."""
    bookings_today: int
    active_students: int
    revenue_week: int  # выручка за неделю в копейках (количество купленных занятий)
    total_lessons_today: int
    cancelled_lessons_today: int


class LessonCreateRequest(BaseModel):
    """Запрос на создание занятия."""
    direction_id: int
    teacher_id: int
    date: str  # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    room: str = "Зал 1"
    max_spots: int = 15
    level: str = "all"


class LessonUpdateRequest(BaseModel):
    """Запрос на обновление занятия (все поля опциональны)."""
    direction_id: int | None = None
    teacher_id: int | None = None
    date: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    room: str | None = None
    max_spots: int | None = None
    level: str | None = None


class LessonCancelRequest(BaseModel):
    """Запрос на отмену занятия."""
    reason: str = "Занятие отменено администратором"


class BalanceAdjustRequest(BaseModel):
    """Запрос на ручную корректировку баланса ученика."""
    amount: int  # положительное — начисление, отрицательное — списание
    reason: str


class BroadcastRequest(BaseModel):
    """Запрос на рассылку сообщения."""
    message: str
    target: str = "all"  # all / active / booked_today


class StudentDetailResponse(BaseModel):
    """Детальная информация об ученике для админки."""
    id: int
    telegram_id: int
    first_name: str
    last_name: str | None
    username: str | None
    phone: str | None
    balance: int
    is_admin: bool
    created_at: datetime
    total_bookings: int
    attended_bookings: int

    model_config = {"from_attributes": True}


# ---------- Эндпоинты ----------

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> DashboardResponse:
    """
    Получить статистику для дашборда админки.
    - Количество записей на сегодня
    - Количество активных учеников (с балансом > 0)
    - Выручка за неделю (количество купленных занятий)
    - Общее количество занятий сегодня и отменённых
    """
    today = date.today()
    week_ago = today - timedelta(days=7)

    # Записи на сегодня (active bookings для сегодняшних занятий)
    bookings_today_result = await db.execute(
        select(func.count(Booking.id))
        .join(Lesson, Booking.lesson_id == Lesson.id)
        .where(
            Lesson.date == today,
            Booking.status == "active",
        )
    )
    bookings_today = bookings_today_result.scalar() or 0

    # Активные ученики (с балансом > 0)
    active_students_result = await db.execute(
        select(func.count(User.id)).where(
            User.balance > 0,
            User.is_admin == False,  # noqa: E712
        )
    )
    active_students = active_students_result.scalar() or 0

    # Выручка за неделю: сумма amount по транзакциям типа purchase за последние 7 дней
    revenue_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.type == "purchase",
            Transaction.created_at >= datetime.combine(week_ago, time.min).replace(tzinfo=timezone.utc),
        )
    )
    revenue_week = revenue_result.scalar() or 0

    # Занятия сегодня
    lessons_today_result = await db.execute(
        select(func.count(Lesson.id)).where(Lesson.date == today)
    )
    total_lessons_today = lessons_today_result.scalar() or 0

    # Отменённые занятия сегодня
    cancelled_today_result = await db.execute(
        select(func.count(Lesson.id)).where(
            Lesson.date == today,
            Lesson.is_cancelled == True,  # noqa: E712
        )
    )
    cancelled_lessons_today = cancelled_today_result.scalar() or 0

    return DashboardResponse(
        bookings_today=bookings_today,
        active_students=active_students,
        revenue_week=revenue_week,
        total_lessons_today=total_lessons_today,
        cancelled_lessons_today=cancelled_lessons_today,
    )


@router.post("/lessons", status_code=status.HTTP_201_CREATED)
async def create_lesson(
    body: LessonCreateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Создать новое занятие в расписании.
    Администратор указывает направление, преподавателя, дату, время, зал и вместимость.
    """
    # Парсим дату и время из строк
    try:
        lesson_date = date.fromisoformat(body.date)
        start = time.fromisoformat(body.start_time)
        end = time.fromisoformat(body.end_time)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный формат даты или времени. Ожидается: дата YYYY-MM-DD, время HH:MM",
        )

    lesson = Lesson(
        direction_id=body.direction_id,
        teacher_id=body.teacher_id,
        date=lesson_date,
        start_time=start,
        end_time=end,
        room=body.room,
        max_spots=body.max_spots,
        level=body.level,
    )
    db.add(lesson)
    await db.flush()

    return {
        "id": lesson.id,
        "message": "Занятие создано",
        "date": lesson.date.isoformat(),
        "start_time": lesson.start_time.strftime("%H:%M"),
        "end_time": lesson.end_time.strftime("%H:%M"),
    }


@router.put("/lessons/{lesson_id}")
async def update_lesson(
    lesson_id: int,
    body: LessonUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Обновить данные занятия.
    Обновляются только переданные поля (partial update).
    """
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()

    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Занятие не найдено",
        )

    # Обновляем только переданные поля
    if body.direction_id is not None:
        lesson.direction_id = body.direction_id
    if body.teacher_id is not None:
        lesson.teacher_id = body.teacher_id
    if body.date is not None:
        try:
            lesson.date = date.fromisoformat(body.date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Неверный формат даты")
    if body.start_time is not None:
        try:
            lesson.start_time = time.fromisoformat(body.start_time)
        except ValueError:
            raise HTTPException(status_code=400, detail="Неверный формат времени начала")
    if body.end_time is not None:
        try:
            lesson.end_time = time.fromisoformat(body.end_time)
        except ValueError:
            raise HTTPException(status_code=400, detail="Неверный формат времени окончания")
    if body.room is not None:
        lesson.room = body.room
    if body.max_spots is not None:
        lesson.max_spots = body.max_spots
    if body.level is not None:
        lesson.level = body.level

    await db.flush()

    return {"id": lesson.id, "message": "Занятие обновлено"}


@router.delete("/lessons/{lesson_id}")
async def cancel_lesson(
    lesson_id: int,
    body: LessonCancelRequest | None = None,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Отменить занятие.
    При отмене все активные бронирования отменяются,
    а занятия возвращаются на баланс учеников.
    """
    result = await db.execute(
        select(Lesson)
        .where(Lesson.id == lesson_id)
        .options(selectinload(Lesson.bookings))
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
            detail="Занятие уже отменено",
        )

    # Отменяем занятие
    reason = body.reason if body else "Занятие отменено администратором"
    lesson.is_cancelled = True
    lesson.cancel_reason = reason

    # Отменяем все активные бронирования и возвращаем занятия на баланс
    refunded_count = 0
    for booking in lesson.bookings:
        if booking.status == "active":
            booking.status = "cancelled"
            booking.cancelled_at = datetime.now(timezone.utc)

            # Возвращаем занятие на баланс пользователя
            user_result = await db.execute(
                select(User).where(User.id == booking.user_id)
            )
            booked_user = user_result.scalar_one_or_none()
            if booked_user:
                booked_user.balance += 1

                # Создаём транзакцию возврата
                transaction = Transaction(
                    user_id=booked_user.id,
                    type="refund",
                    amount=1,
                    description=f"Возврат за отменённое занятие: {reason}",
                    booking_id=booking.id,
                )
                db.add(transaction)
                refunded_count += 1

    await db.flush()

    return {
        "id": lesson.id,
        "message": "Занятие отменено",
        "refunded_bookings": refunded_count,
    }


@router.get("/students", response_model=list[UserResponse])
async def get_students(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
    search: str | None = Query(None, description="Поиск по имени, фамилии или username"),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> list[UserResponse]:
    """
    Получить список учеников с поиском и пагинацией.
    Поиск работает по имени, фамилии и username (регистронезависимый).
    """
    query = select(User).where(User.is_admin == False)  # noqa: E712

    # Фильтр поиска
    if search:
        search_pattern = f"%{search.lower()}%"
        query = query.where(
            (func.lower(User.first_name).like(search_pattern))
            | (func.lower(User.last_name).like(search_pattern))
            | (func.lower(User.username).like(search_pattern))
        )

    query = query.order_by(User.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]


@router.get("/students/{student_id}", response_model=StudentDetailResponse)
async def get_student_detail(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> StudentDetailResponse:
    """
    Получить детальную информацию об ученике.
    Включает статистику по бронированиям и посещениям.
    """
    result = await db.execute(select(User).where(User.id == student_id))
    student = result.scalar_one_or_none()

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ученик не найден",
        )

    # Считаем общее количество бронирований
    total_result = await db.execute(
        select(func.count(Booking.id)).where(Booking.user_id == student_id)
    )
    total_bookings = total_result.scalar() or 0

    # Считаем количество посещений (статус attended)
    attended_result = await db.execute(
        select(func.count(Booking.id)).where(
            Booking.user_id == student_id,
            Booking.status == "attended",
        )
    )
    attended_bookings = attended_result.scalar() or 0

    return StudentDetailResponse(
        id=student.id,
        telegram_id=student.telegram_id,
        first_name=student.first_name,
        last_name=student.last_name,
        username=student.username,
        phone=student.phone,
        balance=student.balance,
        is_admin=student.is_admin,
        created_at=student.created_at,
        total_bookings=total_bookings,
        attended_bookings=attended_bookings,
    )


@router.post("/students/{student_id}/balance")
async def adjust_balance(
    student_id: int,
    body: BalanceAdjustRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> dict:
    """
    Ручная корректировка баланса ученика администратором.
    Положительное amount — начисление, отрицательное — списание.
    """
    result = await db.execute(select(User).where(User.id == student_id))
    student = result.scalar_one_or_none()

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ученик не найден",
        )

    # Корректируем баланс
    student.balance += body.amount

    # Не допускаем отрицательный баланс
    if student.balance < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Баланс не может быть отрицательным",
        )

    # Создаём транзакцию корректировки
    transaction = Transaction(
        user_id=student.id,
        type="manual",
        amount=body.amount,
        description=f"Корректировка администратором ({admin.first_name}): {body.reason}",
    )
    db.add(transaction)

    await db.flush()

    return {
        "student_id": student.id,
        "new_balance": student.balance,
        "adjustment": body.amount,
        "message": "Баланс скорректирован",
    }


@router.post("/bookings/{booking_id}/attend")
async def mark_attendance(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Отметить посещение: перевести бронирование в статус attended.
    Используется администратором для учёта посещений.
    """
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Запись не найдена",
        )

    if booking.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Невозможно отметить посещение: статус записи — {booking.status}",
        )

    booking.status = "attended"

    await db.flush()

    return {
        "booking_id": booking.id,
        "status": "attended",
        "message": "Посещение отмечено",
    }


@router.post("/broadcast")
async def send_broadcast(
    body: BroadcastRequest,
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Отправить рассылку (заглушка для MVP).
    В продакшене здесь будет интеграция с Telegram Bot API для массовой отправки сообщений.
    """
    return {
        "status": "queued",
        "target": body.target,
        "message_preview": body.message[:100],
        "note": "MVP: рассылка поставлена в очередь (заглушка)",
    }
