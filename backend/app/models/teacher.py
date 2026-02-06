"""
Модель преподавателя (Teacher).

Преподаватель ведёт занятия по одному или нескольким направлениям.
Связь M2M с Direction реализована через промежуточную таблицу teacher_directions.
"""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# Промежуточная таблица для связи многие-ко-многим между преподавателями и направлениями
teacher_direction = Table(
    "teacher_directions",
    Base.metadata,
    Column("teacher_id", ForeignKey("teachers.id"), primary_key=True),
    Column("direction_id", ForeignKey("directions.id"), primary_key=True),
)


class Teacher(Base):
    __tablename__ = "teachers"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Полное имя преподавателя
    name: Mapped[str] = mapped_column(String(150))

    # URL-slug для маршрутизации (например, "anna-ivanova")
    slug: Mapped[str] = mapped_column(String(150), unique=True, index=True)

    # Биография / описание преподавателя
    bio: Mapped[str] = mapped_column(Text)

    # URL фотографии преподавателя
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Стаж преподавания в годах
    experience_years: Mapped[int] = mapped_column(Integer, default=0)

    # Флаг активности — неактивные преподаватели скрыты от пользователей
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Направления, которые ведёт преподаватель (M2M)
    directions: Mapped[list["Direction"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        secondary=teacher_direction,
        lazy="selectin",
    )

    # Занятия, которые проводит преподаватель
    lessons: Mapped[list["Lesson"]] = relationship(back_populates="teacher")  # type: ignore[name-defined]  # noqa: F821
