"""
Роутер акций и промо-кодов.

Эндпоинты для работы с акциями:
- Список активных акций (без промокодов в ответе)
- Проверка и применение промо-кода
"""

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.promotion import Promotion
from app.schemas.promotion import (
    PromoValidateRequest,
    PromoValidateResponse,
    PromotionResponse,
)

router = APIRouter(prefix="/promos", tags=["promos"])


@router.get("", response_model=list[PromotionResponse])
async def get_promotions(
    db: AsyncSession = Depends(get_db),
) -> list[PromotionResponse]:
    """
    Получить список активных акций.
    Промокоды скрыты в ответе (promo_code = None) — пользователь вводит их вручную.
    """
    result = await db.execute(
        select(Promotion).where(
            Promotion.is_active == True,  # noqa: E712
            Promotion.valid_from <= date.today(),
            Promotion.valid_until >= date.today(),
        )
    )
    promotions = result.scalars().all()

    # Скрываем промокоды в публичном API — пользователи вводят их вручную
    return [
        PromotionResponse(
            id=p.id,
            title=p.title,
            description=p.description,
            image_url=p.image_url,
            promo_code=None,  # Не показываем промокод в списке акций
            discount_percent=p.discount_percent,
            discount_amount=p.discount_amount,
            valid_from=p.valid_from.isoformat(),
            valid_until=p.valid_until.isoformat(),
        )
        for p in promotions
    ]


@router.post("/validate", response_model=PromoValidateResponse)
async def validate_promo_code(
    body: PromoValidateRequest,
    db: AsyncSession = Depends(get_db),
) -> PromoValidateResponse:
    """
    Валидация промокода перед покупкой абонемента.

    Проверки:
    1. Промокод существует и активен
    2. Промокод в периоде действия
    3. Не исчерпан лимит использований
    """
    result = await db.execute(
        select(Promotion).where(
            Promotion.promo_code == body.code.upper(),
            Promotion.is_active == True,  # noqa: E712
        )
    )
    promo = result.scalar_one_or_none()

    # Промокод не найден
    if promo is None:
        return PromoValidateResponse(
            valid=False,
            message="Промокод не найден",
        )

    # Проверяем период действия
    today = date.today()
    if promo.valid_from > today or promo.valid_until < today:
        return PromoValidateResponse(
            valid=False,
            message="Срок действия промокода истёк",
        )

    # Проверяем лимит использований
    if promo.max_uses is not None and promo.current_uses >= promo.max_uses:
        return PromoValidateResponse(
            valid=False,
            message="Промокод исчерпан",
        )

    # Промокод валиден
    return PromoValidateResponse(
        valid=True,
        discount_percent=promo.discount_percent,
        discount_amount=promo.discount_amount,
        message="Промокод применён",
    )
