"""
Модели абонементов: тарифный план (SubscriptionPlan) и абонемент пользователя (Subscription).

SubscriptionPlan — шаблон абонемента (например, "8 занятий за 30 дней").
Subscription — конкретный купленный абонемент пользователя с остатком занятий.
"""

from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SubscriptionPlan(Base):
    """Тарифный план абонемента — шаблон, доступный для покупки."""

    __tablename__ = "subscription_plans"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Название тарифа (например, "Стандарт", "Безлимит")
    name: Mapped[str] = mapped_column(String(100))

    # Количество занятий, входящих в абонемент
    lessons_count: Mapped[int] = mapped_column(Integer)

    # Срок действия абонемента в днях
    validity_days: Mapped[int] = mapped_column(Integer)

    # Цена в копейках (для точных расчётов без float)
    price: Mapped[int] = mapped_column(Integer)

    # Описание тарифа (дополнительные условия, бонусы и т.д.)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Флаг "Популярный" — выделяет тариф в списке
    is_popular: Mapped[bool] = mapped_column(Boolean, default=False)

    # Флаг активности — неактивные тарифы скрыты от пользователей
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Порядок сортировки для отображения в списке
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Subscription(Base):
    """Купленный абонемент пользователя — привязан к конкретному тарифу."""

    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Внешний ключ на пользователя-владельца абонемента
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # Внешний ключ на тарифный план, по которому куплен абонемент
    plan_id: Mapped[int] = mapped_column(ForeignKey("subscription_plans.id"))

    # Оставшееся количество занятий (уменьшается при записи на занятие)
    lessons_remaining: Mapped[int] = mapped_column(Integer)

    # Дата начала действия абонемента
    starts_at: Mapped[date] = mapped_column(Date)

    # Дата окончания действия абонемента
    expires_at: Mapped[date] = mapped_column(Date)

    # Флаг активности — деактивируется при истечении или исчерпании занятий
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Связь с пользователем
    user: Mapped["User"] = relationship(back_populates="subscriptions")  # type: ignore[name-defined]  # noqa: F821

    # Связь с тарифным планом
    plan: Mapped["SubscriptionPlan"] = relationship()
