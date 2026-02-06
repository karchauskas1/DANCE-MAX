"""
Pydantic-схемы для танцевальных направлений.
"""

from pydantic import BaseModel


class DirectionListResponse(BaseModel):
    """Краткая информация о направлении для списков и вложенных объектов."""
    id: int
    name: str
    slug: str
    short_description: str
    color: str
    icon: str

    model_config = {"from_attributes": True}


class DirectionResponse(BaseModel):
    """Полная информация о направлении для страницы деталей."""
    id: int
    name: str
    slug: str
    description: str
    short_description: str
    image_url: str | None
    color: str
    icon: str

    model_config = {"from_attributes": True}
