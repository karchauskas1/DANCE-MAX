"""
Обработчики Telegram Payments: подтверждение оплаты и зачисление абонемента.

Поток:
1. Фронтенд вызывает /api/payments/create-invoice → получает invoice_url
2. WebApp.openInvoice(url) → Telegram показывает форму оплаты
3. Telegram присылает pre_checkout_query → мы отвечаем ok=True
4. После списания Telegram присылает successful_payment → зачисляем занятия
"""

import json
import logging
from datetime import date, timedelta

from aiogram import F, Router
from aiogram.types import Message, PreCheckoutQuery
from sqlalchemy import select

from app.database import async_session
from app.models.promotion import Promotion
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.transaction import Transaction
from app.models.user import User

logger = logging.getLogger(__name__)

router = Router(name="payments")


@router.pre_checkout_query()
async def handle_pre_checkout(query: PreCheckoutQuery) -> None:
    """Подтверждаем, что всё ок перед списанием средств.

    Telegram требует ответ в течение 10 секунд.
    """
    logger.info("pre_checkout_query от user=%s, payload=%s", query.from_user.id, query.invoice_payload)
    await query.answer(ok=True)


@router.message(F.successful_payment)
async def handle_successful_payment(message: Message) -> None:
    """После успешной оплаты: создаём подписку и зачисляем занятия.

    Payload содержит JSON: {"plan_id": int, "promo_code": str | null}
    """
    payment = message.successful_payment
    if payment is None:
        return

    telegram_id = message.from_user.id if message.from_user else None
    if telegram_id is None:
        logger.error("successful_payment без from_user")
        return

    # Разбираем payload
    try:
        payload = json.loads(payment.invoice_payload)
        plan_id: int = payload["plan_id"]
        promo_code: str | None = payload.get("promo_code")
    except (json.JSONDecodeError, KeyError) as exc:
        logger.error("Невалидный payload: %s — %s", payment.invoice_payload, exc)
        return

    logger.info(
        "successful_payment: user=%s, plan=%s, amount=%s %s",
        telegram_id, plan_id, payment.total_amount, payment.currency,
    )

    async with async_session() as db:
        # Находим пользователя
        result = await db.execute(
            select(User).where(User.telegram_id == telegram_id)
        )
        user = result.scalar_one_or_none()
        if user is None:
            logger.error("Пользователь telegram_id=%s не найден", telegram_id)
            return

        # Находим тарифный план
        result = await db.execute(
            select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id)
        )
        plan = result.scalar_one_or_none()
        if plan is None:
            logger.error("План id=%s не найден", plan_id)
            return

        # Формируем описание с учётом промокода
        promo_description = ""
        if promo_code:
            promo_result = await db.execute(
                select(Promotion).where(
                    Promotion.promo_code == promo_code.upper(),
                    Promotion.is_active == True,  # noqa: E712
                )
            )
            promo = promo_result.scalar_one_or_none()
            if promo is not None:
                if promo.discount_percent:
                    promo_description = f" (скидка {promo.discount_percent}%)"
                elif promo.discount_amount:
                    promo_description = f" (скидка {promo.discount_amount // 100} руб.)"
                promo.current_uses += 1

        # Создаём подписку
        today = date.today()
        subscription = Subscription(
            user_id=user.id,
            plan_id=plan.id,
            lessons_remaining=plan.lessons_count,
            starts_at=today,
            expires_at=today + timedelta(days=plan.validity_days),
            is_active=True,
        )
        db.add(subscription)

        # Зачисляем занятия на баланс
        user.balance += plan.lessons_count

        # Транзакция покупки
        transaction = Transaction(
            user_id=user.id,
            type="purchase",
            amount=plan.lessons_count,
            description=(
                f'Покупка абонемента "{plan.name}" '
                f'({plan.lessons_count} занятий){promo_description}'
            ),
        )
        db.add(transaction)

        await db.commit()

    # Уведомляем пользователя
    await message.answer(
        f"<b>Оплата прошла!</b>\n\n"
        f'Абонемент «{plan.name}» активирован.\n'
        f"На балансе: <b>{user.balance}</b> занятий.\n\n"
        f"Открывайте приложение и записывайтесь!"
    )
