"""
Роутер занятий.

Эндпоинты для работы с расписанием занятий:
- Получение расписания по дате, направлению, преподавателю
- Детали занятия с количеством свободных мест
"""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_optional_user
from app.database import get_db
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas.direction import DirectionListResponse, DirectionResponse
from app.schemas.lesson import LessonDetailResponse, LessonResponse
from app.schemas.teacher import TeacherListResponse, TeacherResponse

router = APIRouter(prefix="/lessons", tags=["lessons"])


def _build_teacher_list(teacher) -> TeacherListResponse:
    """Сформировать краткую информацию о преподавателе с названиями направлений."""
    return TeacherListResponse(
        id=teacher.id,
        name=teacher.name,
        slug=teacher.slug,
        photo_url=teacher.photo_url,
        experience_years=teacher.experience_years,
        specializations=[d.name for d in teacher.directions],
    )


def _build_lesson_response(lesson: Lesson, user_id: int | None) -> LessonResponse:
    """
    Сформировать ответ для занятия.
    Вычисляет current_spots (количество активных записей) и is_booked (записан ли текущий пользователь).
    """
    # Количество активных записей на занятие
    active_bookings = [b for b in lesson.bookings if b.status == "active"]
    current_spots = len(active_bookings)

    # Проверяем, записан ли текущий пользователь
    is_booked = False
    if user_id is not None:
        is_booked = any(b.user_id == user_id and b.status == "active" for b in lesson.bookings)

    return LessonResponse(
        id=lesson.id,
        direction=DirectionListResponse.model_validate(lesson.direction),
        teacher=_build_teacher_list(lesson.teacher),
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


@router.get("/today", response_model=list[LessonResponse])
async def get_today_lessons(
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> list[LessonResponse]:
    """
    Получить занятия на сегодня.
    Сортировка по времени начала.
    """
    today = date.today()
    result = await db.execute(
        select(Lesson)
        .where(Lesson.date == today)
        .options(
            selectinload(Lesson.direction),
            selectinload(Lesson.teacher),
            selectinload(Lesson.bookings),
        )
        .order_by(Lesson.start_time)
    )
    lessons = result.scalars().all()
    user_id = user.id if user else None
    return [_build_lesson_response(lesson, user_id) for lesson in lessons]


@router.get("", response_model=list[LessonResponse])
async def get_lessons(
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
    date_filter: date | None = Query(None, alias="date", description="Дата в формате YYYY-MM-DD"),
    direction_id: int | None = Query(None, description="ID направления"),
    teacher_id: int | None = Query(None, description="ID преподавателя"),
    level: str | None = Query(None, description="Уровень: beginner, intermediate, advanced, all"),
) -> list[LessonResponse]:
    """
    Получить список занятий с фильтрами.
    По умолчанию возвращает занятия на сегодня.
    Поддерживает фильтрацию по дате, направлению, преподавателю и уровню.
    """
    query = select(Lesson).options(
        selectinload(Lesson.direction),
        selectinload(Lesson.teacher),
        selectinload(Lesson.bookings),
    )

    # Фильтр по дате (по умолчанию — сегодня)
    if date_filter is not None:
        query = query.where(Lesson.date == date_filter)
    else:
        query = query.where(Lesson.date == date.today())

    # Фильтр по направлению
    if direction_id is not None:
        query = query.where(Lesson.direction_id == direction_id)

    # Фильтр по преподавателю
    if teacher_id is not None:
        query = query.where(Lesson.teacher_id == teacher_id)

    # Фильтр по уровню сложности
    if level is not None:
        query = query.where(Lesson.level == level)

    # Сортировка по времени начала
    query = query.order_by(Lesson.start_time)

    result = await db.execute(query)
    lessons = result.scalars().all()
    user_id = user.id if user else None
    return [_build_lesson_response(lesson, user_id) for lesson in lessons]


@router.get("/{lesson_id}", response_model=LessonDetailResponse)
async def get_lesson_detail(
    lesson_id: int,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> LessonDetailResponse:
    """
    Получить детальную информацию о занятии.
    Включает полные данные направления и преподавателя.
    """
    result = await db.execute(
        select(Lesson)
        .where(Lesson.id == lesson_id)
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

    # Вычисляем количество занятых мест
    active_bookings = [b for b in lesson.bookings if b.status == "active"]
    current_spots = len(active_bookings)

    # Проверяем запись текущего пользователя
    user_id = user.id if user else None
    is_booked = False
    if user_id is not None:
        is_booked = any(b.user_id == user_id and b.status == "active" for b in lesson.bookings)

    return LessonDetailResponse(
        id=lesson.id,
        direction=DirectionResponse.model_validate(lesson.direction),
        teacher=TeacherResponse(
            id=lesson.teacher.id,
            name=lesson.teacher.name,
            slug=lesson.teacher.slug,
            bio=lesson.teacher.bio,
            photo_url=lesson.teacher.photo_url,
            experience_years=lesson.teacher.experience_years,
            directions=[
                DirectionListResponse.model_validate(d)
                for d in lesson.teacher.directions
            ],
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
