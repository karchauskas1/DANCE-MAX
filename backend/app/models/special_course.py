"""
Модель специального курса (SpecialCourse).

Специальные курсы — это отдельные программы с фиксированной ценой,
количеством занятий и датой старта. Например: "Интенсив по хип-хопу",
"Постановка свадебного танца", "Детский курс contemporary".
"""

from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SpecialCourse(Base):
    __tablename__ = "special_courses"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Название курса
    name: Mapped[str] = mapped_column(String(200))

    # Полное описание курса с программой
    description: Mapped[str] = mapped_column(Text)

    # Направление, к которому относится курс (может быть NULL для общих курсов)
    direction_id: Mapped[int | None] = mapped_column(
        ForeignKey("directions.id"), nullable=True
    )

    # Преподаватель курса (может быть NULL, если ещё не назначен)
    teacher_id: Mapped[int | None] = mapped_column(
        ForeignKey("teachers.id"), nullable=True
    )

    # Стоимость курса в копейках
    price: Mapped[int] = mapped_column(Integer)

    # Количество занятий в курсе
    lessons_count: Mapped[int] = mapped_column(Integer)

    # Дата старта курса
    start_date: Mapped[date] = mapped_column(Date)

    # URL изображения/баннера курса
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Максимальное количество участников
    max_participants: Mapped[int] = mapped_column(Integer)

    # Текущее количество записавшихся участников
    current_participants: Mapped[int] = mapped_column(Integer, default=0)

    # Флаг активности — неактивные курсы скрыты от пользователей
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Связь с направлением
    direction: Mapped["Direction | None"] = relationship()  # type: ignore[name-defined]  # noqa: F821

    # Связь с преподавателем
    teacher: Mapped["Teacher | None"] = relationship()  # type: ignore[name-defined]  # noqa: F821
