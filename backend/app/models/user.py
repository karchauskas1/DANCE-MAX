"""
Модель пользователя (User).

Хранит данные, полученные из Telegram при первой авторизации,
а также баланс занятий и флаг администратора.
"""

from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Уникальный идентификатор пользователя в Telegram
    telegram_id: Mapped[int] = mapped_column(
        BigInteger, unique=True, index=True
    )

    # Имя и фамилия из Telegram-профиля
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Username в Telegram (может отсутствовать)
    username: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Номер телефона (заполняется по желанию пользователя)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # URL аватарки из Telegram
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Баланс — количество оставшихся занятий на счету пользователя
    balance: Mapped[int] = mapped_column(Integer, default=0)

    # Флаг администратора для доступа к админ-панели
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    # Временные метки создания и обновления записи
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Связи с другими моделями
    bookings: Mapped[list["Booking"]] = relationship(back_populates="user")  # type: ignore[name-defined]  # noqa: F821
    subscriptions: Mapped[list["Subscription"]] = relationship(back_populates="user")  # type: ignore[name-defined]  # noqa: F821
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="user")  # type: ignore[name-defined]  # noqa: F821
