"""
Pydantic-схемы для преподавателей.
"""

from pydantic import BaseModel

from app.schemas.direction import DirectionListResponse


class TeacherListResponse(BaseModel):
    """Краткая информация о преподавателе для списков и вложенных объектов."""
    id: int
    name: str
    slug: str
    photo_url: str | None
    experience_years: int
    specializations: list[str]  # названия направлений

    model_config = {"from_attributes": True}


class TeacherResponse(BaseModel):
    """Полная информация о преподавателе для страницы деталей."""
    id: int
    name: str
    slug: str
    bio: str
    photo_url: str | None
    experience_years: int
    directions: list[DirectionListResponse]

    model_config = {"from_attributes": True}
