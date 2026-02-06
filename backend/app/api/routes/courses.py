"""
Роутер специальных курсов.

Эндпоинты для работы со специальными курсами:
- Список активных курсов
- Детали курса
"""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.special_course import SpecialCourse
from app.schemas.course import SpecialCourseResponse
from app.schemas.direction import DirectionListResponse
from app.schemas.teacher import TeacherListResponse

router = APIRouter(prefix="/courses", tags=["courses"])


def _build_course_response(course: SpecialCourse) -> SpecialCourseResponse:
    """Сформировать ответ специального курса с вычисляемым полем spots_left."""
    direction = None
    if course.direction is not None:
        direction = DirectionListResponse.model_validate(course.direction)

    teacher = None
    if course.teacher is not None:
        teacher = TeacherListResponse(
            id=course.teacher.id,
            name=course.teacher.name,
            slug=course.teacher.slug,
            photo_url=course.teacher.photo_url,
            experience_years=course.teacher.experience_years,
            specializations=[d.name for d in course.teacher.directions] if hasattr(course.teacher, "directions") and course.teacher.directions else [],
        )

    return SpecialCourseResponse(
        id=course.id,
        name=course.name,
        description=course.description,
        direction=direction,
        teacher=teacher,
        price=course.price,
        lessons_count=course.lessons_count,
        start_date=course.start_date.isoformat(),
        image_url=course.image_url,
        max_participants=course.max_participants,
        current_participants=course.current_participants,
        # Вычисляем оставшиеся места
        spots_left=max(0, course.max_participants - course.current_participants),
    )


@router.get("", response_model=list[SpecialCourseResponse])
async def get_courses(
    db: AsyncSession = Depends(get_db),
) -> list[SpecialCourseResponse]:
    """
    Получить список активных специальных курсов.
    Возвращает только курсы с датой старта >= сегодня или текущие активные.
    """
    result = await db.execute(
        select(SpecialCourse)
        .where(
            SpecialCourse.is_active == True,  # noqa: E712
        )
        .options(
            selectinload(SpecialCourse.direction),
            selectinload(SpecialCourse.teacher),
        )
        .order_by(SpecialCourse.start_date)
    )
    courses = result.scalars().all()
    return [_build_course_response(c) for c in courses]


@router.get("/{course_id}", response_model=SpecialCourseResponse)
async def get_course_detail(
    course_id: int,
    db: AsyncSession = Depends(get_db),
) -> SpecialCourseResponse:
    """Получить детальную информацию о специальном курсе."""
    result = await db.execute(
        select(SpecialCourse)
        .where(SpecialCourse.id == course_id)
        .options(
            selectinload(SpecialCourse.direction),
            selectinload(SpecialCourse.teacher),
        )
    )
    course = result.scalar_one_or_none()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден",
        )

    return _build_course_response(course)
