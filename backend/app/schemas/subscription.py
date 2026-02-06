"""
Pydantic-схемы для абонементов и тарифных планов.
"""

from pydantic import BaseModel


class SubscriptionPlanResponse(BaseModel):
    """Тарифный план абонемента."""
    id: int
    name: str
    lessons_count: int
    validity_days: int
    price: int  # цена в копейках
    description: str | None
    is_popular: bool
    price_per_lesson: int  # вычисляемое: цена за одно занятие

    model_config = {"from_attributes": True}


class SubscriptionResponse(BaseModel):
    """Информация об абонементе пользователя."""
    id: int
    plan: SubscriptionPlanResponse
    lessons_remaining: int
    starts_at: str  # ISO date
    expires_at: str  # ISO date
    is_active: bool

    model_config = {"from_attributes": True}


class PurchaseRequest(BaseModel):
    """Запрос на покупку абонемента."""
    plan_id: int
    promo_code: str | None = None
