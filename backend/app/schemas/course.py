"""
Pydantic-схемы для специальных курсов (интенсивов, мастер-классов).
"""

from pydantic import BaseModel

from app.schemas.direction import DirectionListResponse
from app.schemas.teacher import TeacherListResponse


class SpecialCourseResponse(BaseModel):
    """Информация о специальном курсе."""
    id: int
    name: str
    description: str
    direction: DirectionListResponse | None
    teacher: TeacherListResponse | None
    price: int  # цена в копейках
    lessons_count: int
    start_date: str  # ISO date
    image_url: str | None
    max_participants: int
    current_participants: int
    spots_left: int  # вычисляемое: max_participants - current_participants

    model_config = {"from_attributes": True}
