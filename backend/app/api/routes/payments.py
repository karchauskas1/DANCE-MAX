"""
Роутер платежей.

Оплата абонементов через прямой API ЮКассы:
- Получение списка тарифных планов
- Создание платежа → редирект на страницу ЮКассы
- Webhook от ЮКассы → зачисление абонемента
- Резервный create — для ручного зачисления (админ)
"""

import json
import logging
import uuid
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from yookassa import Configuration, Payment

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.database import get_db, async_session
from app.models.promotion import Promotion
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.subscription import PurchaseRequest, SubscriptionPlanResponse, SubscriptionResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["payments"])

# Инициализация ЮКассы
Configuration.account_id = settings.YOOKASSA_SHOP_ID
Configuration.secret_key = settings.YOOKASSA_SECRET_KEY


class CreatePaymentRequest(BaseModel):
    """Запрос на создание платежа через ЮКассу."""
    plan_id: int
    promo_code: str | None = None


class CreatePaymentResponse(BaseModel):
    """Ответ с URL для оплаты."""
    payment_url: str
    payment_id: str


@router.post("/create-invoice", response_model=CreatePaymentResponse)
async def create_invoice(
    body: CreatePaymentRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CreatePaymentResponse:
    """
    Создать платёж через ЮКассу.

    Возвращает URL для редиректа на страницу оплаты ЮКассы.
    После оплаты ЮКасса шлёт webhook → зачисляем абонемент.
    """
    # Находим тарифный план
    result = await db.execute(
        select(SubscriptionPlan).where(
            SubscriptionPlan.id == body.plan_id,
            SubscriptionPlan.is_active == True,  # noqa: E712
        )
    )
    plan = result.scalar_one_or_none()

    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тарифный план не найден",
        )

    # Считаем итоговую цену с промокодом
    final_price = plan.price  # в копейках
    if body.promo_code:
        promo_result = await db.execute(
            select(Promotion).where(
                Promotion.promo_code == body.promo_code.upper(),
                Promotion.is_active == True,  # noqa: E712
                Promotion.valid_from <= date.today(),
                Promotion.valid_until >= date.today(),
            )
        )
        promo = promo_result.scalar_one_or_none()
        if promo is not None:
            can_use = promo.max_uses is None or promo.current_uses < promo.max_uses
            if can_use:
                if promo.discount_percent:
                    final_price -= final_price * promo.discount_percent // 100
                elif promo.discount_amount:
                    final_price = max(0, final_price - promo.discount_amount)

    # Минимальная сумма ЮКассы — 1 рубль
    if final_price < 100:
        final_price = 100

    # Конвертируем копейки в рубли для ЮКассы (формат "49.00")
    amount_rub = f"{final_price / 100:.2f}"

    # Данные покупателя для отображения в ЮКассе
    buyer_name = user.first_name or ""
    if user.last_name:
        buyer_name += f" {user.last_name}"
    if user.username:
        buyer_name += f" (@{user.username})"

    # Метаданные — передаём в ЮКассу, получим обратно в webhook
    metadata = {
        "user_id": user.id,
        "telegram_id": user.telegram_id,
        "plan_id": plan.id,
        "promo_code": body.promo_code.strip() if body.promo_code else None,
        "buyer_name": buyer_name,
    }

    # URL возврата после оплаты — обратно в Mini App
    return_url = f"{settings.TELEGRAM_WEBAPP_URL}/profile"

    # Создаём платёж через ЮКассу
    payment = Payment.create({
        "amount": {
            "value": amount_rub,
            "currency": "RUB",
        },
        "confirmation": {
            "type": "redirect",
            "return_url": return_url,
        },
        "capture": True,  # автоматическое подтверждение
        "description": f"Абонемент «{plan.name}» — {plan.lessons_count} занятий. {buyer_name}",
        "metadata": metadata,
    }, uuid.uuid4().hex)

    confirmation_url = payment.confirmation.confirmation_url

    return CreatePaymentResponse(
        payment_url=confirmation_url,
        payment_id=payment.id,
    )


@router.post("/webhook")
async def payment_webhook(request: Request) -> dict:
    """
    Webhook от ЮКассы — вызывается при изменении статуса платежа.

    При статусе 'succeeded':
    1. Находим пользователя по metadata.user_id
    2. Находим тарифный план по metadata.plan_id
    3. Создаём подписку, зачисляем занятия, создаём транзакцию
    4. Обрабатываем промокод
    """
    body = await request.json()
    event_type = body.get("event")

    # Нас интересует только успешная оплата
    if event_type != "payment.succeeded":
        return {"status": "ok"}

    payment_obj = body.get("object", {})
    payment_id = payment_obj.get("id", "unknown")
    metadata = payment_obj.get("metadata", {})

    user_id = metadata.get("user_id")
    plan_id = metadata.get("plan_id")
    promo_code = metadata.get("promo_code")

    if not user_id or not plan_id:
        logger.error("Webhook без user_id/plan_id: payment=%s", payment_id)
        return {"status": "error", "message": "missing metadata"}

    logger.info(
        "ЮКасса webhook: payment=%s, user=%s, plan=%s",
        payment_id, user_id, plan_id,
    )

    async with async_session() as db:
        # Находим пользователя
        result = await db.execute(
            select(User).where(User.id == int(user_id))
        )
        user = result.scalar_one_or_none()
        if user is None:
            logger.error("Пользователь id=%s не найден", user_id)
            return {"status": "error"}

        # Находим тарифный план
        result = await db.execute(
            select(SubscriptionPlan).where(SubscriptionPlan.id == int(plan_id))
        )
        plan = result.scalar_one_or_none()
        if plan is None:
            logger.error("План id=%s не найден", plan_id)
            return {"status": "error"}

        # Обрабатываем промокод
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

    # Уведомляем пользователя через Telegram
    try:
        from app.core.bot import bot
        await bot.send_message(
            chat_id=user.telegram_id,
            text=(
                f"<b>Оплата прошла!</b>\n\n"
                f'Абонемент «{plan.name}» активирован.\n'
                f"На балансе: <b>{user.balance}</b> занятий.\n\n"
                f"Открывайте приложение и записывайтесь!"
            ),
        )
    except Exception as exc:
        logger.warning("Не удалось отправить уведомление: %s", exc)

    return {"status": "ok"}


@router.get("/plans", response_model=list[SubscriptionPlanResponse])
async def get_plans(
    db: AsyncSession = Depends(get_db),
) -> list[SubscriptionPlanResponse]:
    """
    Получить список доступных тарифных планов абонементов.
    Сортировка по sort_order. Только активные планы.
    """
    result = await db.execute(
        select(SubscriptionPlan)
        .where(SubscriptionPlan.is_active == True)  # noqa: E712
        .order_by(SubscriptionPlan.sort_order)
    )
    plans = result.scalars().all()

    return [
        SubscriptionPlanResponse(
            id=p.id,
            name=p.name,
            lessons_count=p.lessons_count,
            validity_days=p.validity_days,
            price=p.price,
            description=p.description,
            is_popular=p.is_popular,
            price_per_lesson=p.price // p.lessons_count if p.lessons_count > 0 else 0,
        )
        for p in plans
    ]


@router.post("/create", response_model=SubscriptionResponse)
async def create_payment(
    body: PurchaseRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SubscriptionResponse:
    """Ручное зачисление абонемента (для админа, без реальной оплаты)."""
    result = await db.execute(
        select(SubscriptionPlan).where(
            SubscriptionPlan.id == body.plan_id,
            SubscriptionPlan.is_active == True,  # noqa: E712
        )
    )
    plan = result.scalar_one_or_none()

    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тарифный план не найден",
        )

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
    user.balance += plan.lessons_count

    transaction = Transaction(
        user_id=user.id,
        type="purchase",
        amount=plan.lessons_count,
        description=f'Покупка абонемента "{plan.name}" ({plan.lessons_count} занятий)',
        subscription_id=subscription.id,
    )
    db.add(transaction)
    await db.commit()

    return SubscriptionResponse(
        id=subscription.id,
        plan=SubscriptionPlanResponse(
            id=plan.id,
            name=plan.name,
            lessons_count=plan.lessons_count,
            validity_days=plan.validity_days,
            price=plan.price,
            description=plan.description,
            is_popular=plan.is_popular,
            price_per_lesson=plan.price // plan.lessons_count if plan.lessons_count > 0 else 0,
        ),
        lessons_remaining=subscription.lessons_remaining,
        starts_at=subscription.starts_at.isoformat(),
        expires_at=subscription.expires_at.isoformat(),
        is_active=subscription.is_active,
    )
