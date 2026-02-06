"""
Pydantic-схемы для занятий (уроков) в расписании.
"""

from pydantic import BaseModel

from app.schemas.direction import DirectionListResponse, DirectionResponse
from app.schemas.teacher import TeacherListResponse, TeacherResponse


class LessonResponse(BaseModel):
    """Информация о занятии для списка расписания."""
    id: int
    direction: DirectionListResponse
    teacher: TeacherListResponse
    date: str  # ISO date (YYYY-MM-DD)
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    room: str
    max_spots: int
    current_spots: int  # вычисляемое: количество активных записей
    level: str
    is_cancelled: bool
    cancel_reason: str | None
    is_booked: bool = False  # записан ли текущий пользователь

    model_config = {"from_attributes": True}


class LessonDetailResponse(LessonResponse):
    """Детальная информация о занятии с полными данными направления и преподавателя."""
    direction: DirectionResponse
    teacher: TeacherResponse
