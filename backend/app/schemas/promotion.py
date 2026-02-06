"""
Pydantic-схемы для акций и промокодов.
"""

from pydantic import BaseModel


class PromotionResponse(BaseModel):
    """Информация об акции (без промокода — он скрыт от публичного API)."""
    id: int
    title: str
    description: str
    image_url: str | None
    promo_code: str | None
    discount_percent: int | None
    discount_amount: int | None
    valid_from: str  # ISO date
    valid_until: str  # ISO date

    model_config = {"from_attributes": True}


class PromoValidateRequest(BaseModel):
    """Запрос на валидацию промокода при покупке абонемента."""
    code: str
    plan_id: int


class PromoValidateResponse(BaseModel):
    """Результат валидации промокода."""
    valid: bool
    discount_percent: int | None = None
    discount_amount: int | None = None
    message: str | None = None
