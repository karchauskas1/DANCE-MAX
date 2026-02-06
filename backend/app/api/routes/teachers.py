"""
Роутер преподавателей.

Эндпоинты для получения информации о преподавателях:
- Список активных преподавателей
- Детали преподавателя по slug
- Расписание преподавателя
"""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_optional_user
from app.database import get_db
from app.models.lesson import Lesson
from app.models.teacher import Teacher
from app.models.user import User
from app.schemas.direction import DirectionListResponse
from app.schemas.lesson import LessonResponse
from app.schemas.teacher import TeacherListResponse, TeacherResponse

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("", response_model=list[TeacherListResponse])
async def get_teachers(
    db: AsyncSession = Depends(get_db),
) -> list[TeacherListResponse]:
    """
    Получить список активных преподавателей.
    Для каждого преподавателя возвращается список его специализаций (названия направлений).
    """
    result = await db.execute(
        select(Teacher)
        .where(Teacher.is_active == True)  # noqa: E712
        .options(selectinload(Teacher.directions))
        .order_by(Teacher.name)
    )
    teachers = result.scalars().all()

    return [
        TeacherListResponse(
            id=t.id,
            name=t.name,
            slug=t.slug,
            photo_url=t.photo_url,
            experience_years=t.experience_years,
            specializations=[d.name for d in t.directions],
        )
        for t in teachers
    ]


@router.get("/{slug}", response_model=dict)
async def get_teacher_detail(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    """
    Получить детали преподавателя по slug.
    В ответе включено ближайшее расписание преподавателя.
    """
    result = await db.execute(
        select(Teacher)
        .where(Teacher.slug == slug, Teacher.is_active == True)  # noqa: E712
        .options(selectinload(Teacher.directions))
    )
    teacher = result.scalar_one_or_none()

    if teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Преподаватель не найден",
        )

    # Получаем ближайшие занятия преподавателя
    lessons_result = await db.execute(
        select(Lesson)
        .where(
            Lesson.teacher_id == teacher.id,
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

    # Формируем расписание
    schedule = []
    for lesson in lessons:
        active_bookings = [b for b in lesson.bookings if b.status == "active"]
        current_spots = len(active_bookings)
        is_booked = False
        if user_id is not None:
            is_booked = any(b.user_id == user_id and b.status == "active" for b in lesson.bookings)

        schedule.append(
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
        "teacher": TeacherResponse(
            id=teacher.id,
            name=teacher.name,
            slug=teacher.slug,
            bio=teacher.bio,
            photo_url=teacher.photo_url,
            experience_years=teacher.experience_years,
            directions=[DirectionListResponse.model_validate(d) for d in teacher.directions],
        ),
        "schedule": schedule,
    }
