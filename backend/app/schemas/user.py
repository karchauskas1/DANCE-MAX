"""
Pydantic-схемы для пользователя.
"""

import re
from datetime import datetime

from pydantic import BaseModel, field_validator


class UserBase(BaseModel):
    """Базовые поля пользователя."""
    first_name: str
    last_name: str | None = None
    username: str | None = None
    phone: str | None = None
    real_name: str | None = None
    real_last_name:  str | None = None
    real_first_name: str | None = None
    real_patronymic: str | None = None


class UserResponse(UserBase):
    """Полный ответ с данными пользователя."""
    id: int
    telegram_id: int
    photo_url: str | None = None
    balance: int
    is_admin: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class UserBalanceResponse(BaseModel):
    """Баланс пользователя и количество активных абонементов."""
    balance: int
    active_subscriptions: int


# Паттерн: только буквы кириллицы/латиницы, дефис и пробел
_NAME_PATTERN = re.compile(r"^[А-ЯЁа-яёA-Za-z\- ]+$")


class SetRealNameRequest(BaseModel):
    """Запрос на установку ФИО по трём отдельным полям (один раз, без возможности изменения)."""
    real_last_name:  str
    real_first_name: str
    real_patronymic: str

    @field_validator("real_last_name", "real_first_name", "real_patronymic", mode="before")
    @classmethod
    def validate_name_part(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Поле слишком короткое (минимум 2 символа)")
        if len(v) > 100:
            raise ValueError("Поле слишком длинное (максимум 100 символов)")
        if not _NAME_PATTERN.match(v):
            raise ValueError(
                "Допустимы только буквы (кириллица/латиница), дефис и пробел"
            )
        return v
