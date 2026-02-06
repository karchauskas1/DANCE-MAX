"""
Модель танцевального направления (Direction).

Каждое направление — это стиль танца (хип-хоп, contemporary, jazz и т.д.),
к которому привязаны занятия и преподаватели.
"""

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Direction(Base):
    __tablename__ = "directions"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Название направления (например, "Хип-хоп", "Contemporary")
    name: Mapped[str] = mapped_column(String(100))

    # URL-slug для маршрутизации на фронтенде (например, "hip-hop")
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    # Полное описание направления для страницы деталей
    description: Mapped[str] = mapped_column(Text)

    # Краткое описание для карточки в списке направлений
    short_description: Mapped[str] = mapped_column(String(200))

    # URL изображения для карточки направления
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # HEX-цвет для оформления карточки (например, "#FF5722")
    color: Mapped[str] = mapped_column(String(7))

    # Название иконки из библиотеки Lucide для отображения на фронтенде
    icon: Mapped[str] = mapped_column(String(50))

    # Флаг активности — неактивные направления скрыты от пользователей
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Порядок сортировки для отображения в списке
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    # Связь: занятия данного направления
    lessons: Mapped[list["Lesson"]] = relationship(back_populates="direction")  # type: ignore[name-defined]  # noqa: F821
