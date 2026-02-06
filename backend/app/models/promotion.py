"""
Модель акции/промо-кампании (Promotion).

Хранит информацию об акциях студии: промо-коды со скидками,
специальные предложения, ограниченные по времени и количеству использований.
"""

from datetime import date

from sqlalchemy import Boolean, Date, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Promotion(Base):
    __tablename__ = "promotions"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Заголовок акции (например, "Скидка 20% на первое занятие")
    title: Mapped[str] = mapped_column(String(200))

    # Полное описание акции с условиями
    description: Mapped[str] = mapped_column(Text)

    # URL баннера/изображения акции
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Промо-код для активации скидки (может отсутствовать для автоматических акций)
    promo_code: Mapped[str | None] = mapped_column(
        String(50), unique=True, nullable=True
    )

    # Скидка в процентах (например, 20 = 20%)
    discount_percent: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Скидка фиксированной суммой в копейках
    discount_amount: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Период действия акции
    valid_from: Mapped[date] = mapped_column(Date)
    valid_until: Mapped[date] = mapped_column(Date)

    # Максимальное количество использований (None = без ограничений)
    max_uses: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Текущее количество использований промо-кода
    current_uses: Mapped[int] = mapped_column(Integer, default=0)

    # Флаг активности — неактивные акции скрыты от пользователей
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
