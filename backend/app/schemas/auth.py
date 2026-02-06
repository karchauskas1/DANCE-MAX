"""
Pydantic-схемы для авторизации через Telegram.
"""

from pydantic import BaseModel

from app.schemas.user import UserResponse


class TelegramAuthRequest(BaseModel):
    """Запрос авторизации — initData строка из Telegram WebApp."""
    init_data: str


class AuthResponse(BaseModel):
    """Ответ после успешной авторизации: JWT-токен и данные пользователя."""
    token: str
    user: UserResponse
