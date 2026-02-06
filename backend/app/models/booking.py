"""
Модель бронирования (Booking).

Фиксирует запись пользователя на конкретное занятие.
Статусы: active (активная запись), cancelled (отменена пользователем),
attended (пользователь посетил), missed (пользователь не пришёл).

UniqueConstraint гарантирует, что пользователь не может дважды
записаться на одно и то же занятие с активным статусом.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    # Ограничение уникальности: один пользователь — одна активная запись на занятие
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "lesson_id",
            name="uq_booking_user_lesson",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # Внешний ключ на пользователя, создавшего бронирование
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # Внешний ключ на занятие, на которое записан пользователь
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"))

    # Статус бронирования: active / cancelled / attended / missed
    status: Mapped[str] = mapped_column(String(20), default="active")

    # Дата и время создания бронирования
    booked_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    # Дата и время отмены (заполняется только при status='cancelled')
    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
    )

    # Связь с пользователем
    user: Mapped["User"] = relationship(back_populates="bookings")  # type: ignore[name-defined]  # noqa: F821

    # Связь с занятием
    lesson: Mapped["Lesson"] = relationship(back_populates="bookings")  # type: ignore[name-defined]  # noqa: F821
