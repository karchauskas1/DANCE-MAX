"""
Роутер направлений.

Эндпоинты для получения информации о танцевальных направлениях:
- Список активных направлений
- Детали направления по slug
"""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_optional_user
from app.database import get_db
from app.models.direction import Direction
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas.direction import DirectionListResponse, DirectionResponse
from app.schemas.lesson import LessonResponse
from app.schemas.teacher import TeacherListResponse

router = APIRouter(prefix="/directions", tags=["directions"])


@router.get("", response_model=list[DirectionListResponse])
async def get_directions(
    db: AsyncSession = Depends(get_db),
) -> list[DirectionListResponse]:
    """
    Получить список активных танцевальных направлений.
    Сортировка по полю sort_order.
    """
    result = await db.execute(
        select(Direction)
        .where(Direction.is_active == True)  # noqa: E712
        .order_by(Direction.sort_order)
    )
    directions = result.scalars().all()
    return [DirectionListResponse.model_validate(d) for d in directions]


@router.get("/{slug}", response_model=dict)
async def get_direction_detail(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    """
    Получить детали направления по slug.
    В ответе включены ближайшие занятия по этому направлению.
    """
    result = await db.execute(
        select(Direction).where(Direction.slug == slug, Direction.is_active == True)  # noqa: E712
    )
    direction = result.scalar_one_or_none()

    if direction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Направление не найдено",
        )

    # Получаем ближайшие занятия по этому направлению (от сегодня)
    lessons_result = await db.execute(
        select(Lesson)
        .where(
            Lesson.direction_id == direction.id,
            Lesson.date >= date.today(),
            Lesson.is_cancelled == False,  # noqa: E712
        )
        .options(
            selectinload(Lesson.direction),
            selectinload(Lesson.teacher),
            selectinload(Lesson.bookings),
        )
        .order_by(Lesson.date, Lesson.start_time)
        .limit(10)
    )
    lessons = lessons_result.scalars().all()

    user_id = user.id if user else None

    # Формируем ответ с занятиями
    upcoming_lessons = []
    for lesson in lessons:
        active_bookings = [b for b in lesson.bookings if b.status == "active"]
        current_spots = len(active_bookings)
        is_booked = False
        if user_id is not None:
            is_booked = any(b.user_id == user_id and b.status == "active" for b in lesson.bookings)

        upcoming_lessons.append(
            LessonResponse(
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
        )

    return {
        "direction": DirectionResponse.model_validate(direction),
        "upcoming_lessons": upcoming_lessons,
    }
