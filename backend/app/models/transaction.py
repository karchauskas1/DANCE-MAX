"""
Модель транзакции (Transaction).

Фиксирует все операции с балансом занятий пользователя:
- purchase: покупка абонемента (пополнение баланса)
- deduction: списание занятия при записи
- refund: возврат занятия при отмене записи
- manual: ручная корректировка администратором
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Внешний ключ на пользователя, которому принадлежит транзакция
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # Тип операции: purchase / deduction / refund / manual
    type: Mapped[str] = mapped_column(String(20))

    # Сумма операции в занятиях (положительная при пополнении, отрицательная при списании)
    amount: Mapped[int] = mapped_column(Integer)

    # Описание операции (например, "Покупка абонемента 'Стандарт'", "Запись на занятие #42")
    description: Mapped[str] = mapped_column(String(300))

    # Связь с абонементом (заполняется при покупке абонемента)
    subscription_id: Mapped[int | None] = mapped_column(
        ForeignKey("subscriptions.id"), nullable=True
    )

    # Связь с бронированием (заполняется при списании/возврате за занятие)
    booking_id: Mapped[int | None] = mapped_column(
        ForeignKey("bookings.id"), nullable=True
    )

    # Дата и время создания транзакции
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    # Связь с пользователем
    user: Mapped["User"] = relationship(back_populates="transactions")  # type: ignore[name-defined]  # noqa: F821
