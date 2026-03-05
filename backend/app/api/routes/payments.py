"""
Роутер платежей.

Эндпоинты для покупки абонементов через Telegram Payments:
- Получение списка тарифных планов
- Создание инвойса (ссылки для оплаты через Telegram)
- Резервный create — для ручного зачисления (админ)
"""

import json
from datetime import date, timedelta

from aiogram.types import LabeledPrice
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.bot import bot
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.promotion import Promotion
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.subscription import PurchaseRequest, SubscriptionPlanResponse, SubscriptionResponse

router = APIRouter(prefix="/payments", tags=["payments"])


class InvoiceRequest(BaseModel):
    """Запрос на создание инвойса для оплаты."""
    plan_id: int
    promo_code: str | None = None


class InvoiceResponse(BaseModel):
    """Ссылка на инвойс для оплаты через Telegram."""
    invoice_url: str


@router.post("/create-invoice", response_model=InvoiceResponse)
async def create_invoice(
    body: InvoiceRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> InvoiceResponse:
    """
    Создать ссылку на инвойс Telegram Payments.

    Фронтенд вызывает WebApp.openInvoice(url) — Telegram показывает
    платёжную форму. После оплаты бот получает successful_payment
    и зачисляет абонемент.

    В payload инвойса передаём plan_id и promo_code, чтобы бот мог
    зачислить правильный абонемент после подтверждения оплаты.
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

    # Минимальная цена для Telegram — 1 рубль (100 копеек)
    if final_price < 100:
        final_price = 100

    # Payload для бота: после оплаты бот распарсит и зачислит абонемент
    payload = json.dumps({
        "plan_id": plan.id,
        "promo_code": body.promo_code.strip() if body.promo_code else None,
    })

    # Данные покупателя для отображения в ЮКассе
    # Имя + username из Telegram, чтобы администратор видел кто платил
    buyer_name = user.first_name or ""
    if user.last_name:
        buyer_name += f" {user.last_name}"
    if user.username:
        buyer_name += f" (@{user.username})"

    # Создаём ссылку на инвойс через Bot API
    invoice_url = await bot.create_invoice_link(
        title=f"Абонемент «{plan.name}»",
        description=(
            f"{plan.lessons_count} занятий, {plan.validity_days} дней\n"
            f"Покупатель: {buyer_name}"
        ),
        payload=payload,
        provider_token=settings.PAYMENT_PROVIDER_TOKEN,
        currency="RUB",
        prices=[
            LabeledPrice(
                label=f"Абонемент «{plan.name}» — {plan.lessons_count} занятий",
                amount=final_price,
            ),
        ],
        # Запрашиваем номер телефона — будет виден в ЮКассе
        need_phone_number=True,
        need_name=True,
        send_phone_number_to_provider=True,
        send_email_to_provider=False,
    )

    return InvoiceResponse(invoice_url=invoice_url)


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
            # Вычисляем цену за одно занятие
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
    """
    Создать платёж и начислить абонемент (MVP — без реального эквайринга).

    Бизнес-логика:
    1. Находим тарифный план по plan_id
    2. Проверяем промокод если передан — применяем скидку
    3. Создаём подписку (Subscription) с начальным количеством занятий
    4. Начисляем занятия на баланс пользователя
    5. Создаём транзакцию покупки (purchase)
    6. Возвращаем данные подписки
    """
    # Шаг 1: Находим тарифный план
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

    # Шаг 2: Проверяем промокод (если передан)
    final_price = plan.price
    promo_description = ""
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
            # Проверяем лимит использований
            if promo.max_uses is not None and promo.current_uses >= promo.max_uses:
                pass  # Промокод исчерпан — игнорируем
            else:
                # Применяем скидку
                if promo.discount_percent:
                    discount = final_price * promo.discount_percent // 100
                    final_price -= discount
                    promo_description = f" (скидка {promo.discount_percent}%)"
                elif promo.discount_amount:
                    final_price = max(0, final_price - promo.discount_amount)
                    promo_description = f" (скидка {promo.discount_amount // 100} руб.)"
                promo.current_uses += 1

    # Шаг 3: Создаём подписку
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

    # Шаг 4: Начисляем занятия на баланс
    user.balance += plan.lessons_count

    # Шаг 5: Создаём транзакцию покупки
    transaction = Transaction(
        user_id=user.id,
        type="purchase",
        amount=plan.lessons_count,
        description=f'Покупка абонемента "{plan.name}" ({plan.lessons_count} занятий){promo_description}',
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


@router.post("/webhook")
async def payment_webhook() -> dict:
    """
    Вебхук от платёжной системы (заглушка для MVP).
    В продакшене здесь будет обработка callback от Telegram Payments или другого провайдера.
    """
    return {"status": "ok", "message": "Webhook received (MVP stub)"}
