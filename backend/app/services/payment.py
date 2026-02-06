"""Бизнес-логика оплаты и покупки абонементов."""

from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Promotion, Subscription, SubscriptionPlan, Transaction, User


class PaymentService:
    """Сервис для работы с платежами и абонементами."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def purchase_subscription(
        self,
        user_id: int,
        plan_id: int,
        promo_code: str | None = None,
    ) -> Subscription:
        """Купить абонемент.

        В MVP: сразу начисляем занятия без реального платежа.
        В проде: создаём invoice через Telegram Payments.

        Args:
            user_id: ID пользователя.
            plan_id: ID тарифного плана.
            promo_code: Промокод (опционально).

        Returns:
            Созданная подписка (Subscription).

        Raises:
            HTTPException: Если план не найден или промокод невалиден.
        """
        # Получаем тарифный план
        plan = await self.db.get(SubscriptionPlan, plan_id)
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Тарифный план не найден",
            )

        # Валидируем промокод, если указан
        discount_percent: int = 0
        promotion: Promotion | None = None
        if promo_code:
            promo_info = await self.validate_promo(promo_code, plan_id)
            discount_percent = promo_info["discount_percent"]
            promotion = promo_info["promotion"]

        # Рассчитываем итоговую цену
        final_price = plan.price * (100 - discount_percent) / 100

        # Получаем пользователя
        user = await self.db.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Пользователь не найден",
            )

        # Создаём подписку
        subscription = Subscription(
            user_id=user_id,
            plan_id=plan_id,
            lessons_total=plan.lessons_count,
            lessons_remaining=plan.lessons_count,
            price_paid=final_price,
            promotion_id=promotion.id if promotion else None,
            purchased_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(days=plan.duration_days),
        )
        self.db.add(subscription)

        # Начисляем занятия на баланс пользователя
        user.balance += plan.lessons_count

        # Создаём транзакцию пополнения
        transaction = Transaction(
            user_id=user_id,
            type="purchase",
            amount=plan.lessons_count,
            description=f"Покупка абонемента «{plan.name}» на {plan.lessons_count} занятий",
        )
        self.db.add(transaction)

        # Увеличиваем счётчик использований промокода
        if promotion:
            promotion.used_count += 1

        await self.db.commit()
        await self.db.refresh(subscription)
        return subscription

    async def validate_promo(self, code: str, plan_id: int) -> dict:
        """Валидация промокода.

        Args:
            code: Код промоакции.
            plan_id: ID тарифного плана (для проверки применимости).

        Returns:
            Словарь с информацией о скидке:
            - discount_percent: размер скидки в процентах
            - promotion: объект промоакции

        Raises:
            HTTPException: Если промокод невалиден, истёк или исчерпан.
        """
        # Ищем промокод в базе
        result = await self.db.execute(
            select(Promotion).where(
                Promotion.code == code.upper(),
                Promotion.is_active == True,  # noqa: E712
            )
        )
        promotion = result.scalar_one_or_none()

        if not promotion:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Промокод не найден или неактивен",
            )

        # Проверяем срок действия
        now = datetime.utcnow()
        if promotion.valid_from and now < promotion.valid_from:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Промокод ещё не активен",
            )
        if promotion.valid_until and now > promotion.valid_until:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Срок действия промокода истёк",
            )

        # Проверяем лимит использований
        if promotion.max_uses and promotion.used_count >= promotion.max_uses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Промокод исчерпан",
            )

        return {
            "discount_percent": promotion.discount_percent,
            "promotion": promotion,
        }
