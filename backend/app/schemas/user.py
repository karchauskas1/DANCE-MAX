"""
Pydantic-схемы для пользователя.
"""

from datetime import datetime

from pydantic import BaseModel


class UserBase(BaseModel):
    """Базовые поля пользователя."""
    first_name: str
    last_name: str | None = None
    username: str | None = None
    phone: str | None = None


class UserResponse(UserBase):
    """Полный ответ с данными пользователя."""
    id: int
    telegram_id: int
    photo_url: str | None = None
    balance: int
    created_at: datetime

    model_config = {"from_attributes": True}


class UserBalanceResponse(BaseModel):
    """Баланс пользователя и количество активных абонементов."""
    balance: int
    active_subscriptions: int
