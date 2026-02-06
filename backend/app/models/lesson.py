"""
Модель занятия (Lesson).

Представляет конкретное занятие в расписании: дата, время, зал,
преподаватель, направление, уровень и количество мест.
"""

from datetime import date, datetime, time

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Внешний ключ на направление (хип-хоп, contemporary и т.д.)
    direction_id: Mapped[int] = mapped_column(ForeignKey("directions.id"))

    # Внешний ключ на преподавателя, ведущего занятие
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"))

    # Дата проведения занятия (индексировано для быстрого поиска по расписанию)
    date: Mapped[date] = mapped_column(Date, index=True)

    # Время начала и окончания занятия
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time)

    # Название зала (например, "Зал 1", "Малый зал")
    room: Mapped[str] = mapped_column(String(50))

    # Максимальное количество мест на занятии
    max_spots: Mapped[int] = mapped_column(Integer)

    # Уровень сложности: beginner / intermediate / advanced / all
    level: Mapped[str] = mapped_column(String(20), default="all")

    # Флаг отмены занятия
    is_cancelled: Mapped[bool] = mapped_column(Boolean, default=False)

    # Причина отмены (заполняется только при is_cancelled=True)
    cancel_reason: Mapped[str | None] = mapped_column(String(300), nullable=True)

    # Дата создания записи
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    # Связь с направлением
    direction: Mapped["Direction"] = relationship(back_populates="lessons")  # type: ignore[name-defined]  # noqa: F821

    # Связь с преподавателем
    teacher: Mapped["Teacher"] = relationship(back_populates="lessons")  # type: ignore[name-defined]  # noqa: F821

    # Записи пользователей на это занятие
    bookings: Mapped[list["Booking"]] = relationship(back_populates="lesson")  # type: ignore[name-defined]  # noqa: F821
