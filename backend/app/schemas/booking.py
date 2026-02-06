"""
Pydantic-схемы для записей (бронирований) на занятия.
"""

from datetime import datetime

from pydantic import BaseModel

from app.schemas.lesson import LessonResponse


class BookingCreateRequest(BaseModel):
    """Запрос на создание записи на занятие."""
    lesson_id: int


class BookingResponse(BaseModel):
    """Ответ с данными о бронировании."""
    id: int
    lesson: LessonResponse
    status: str
    booked_at: datetime
    cancelled_at: datetime | None

    model_config = {"from_attributes": True}
