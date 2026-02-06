"""
Модуль безопасности: создание и верификация JWT-токенов.
Используется для аутентификации пользователей через Bearer-токены.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from app.core.config import settings


def create_access_token(data: dict[str, Any]) -> str:
    """
    Создание JWT access-токена.

    Принимает словарь с данными пользователя (обычно {"sub": telegram_id}),
    добавляет время истечения и подписывает токен секретным ключом.
    """
    to_encode: dict[str, Any] = data.copy()

    # Вычисляем время истечения токена
    expire: datetime = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})

    # Подписываем токен алгоритмом HS256
    encoded_jwt: str = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def verify_token(token: str) -> dict[str, Any] | None:
    """
    Верификация и декодирование JWT-токена.

    Возвращает payload (словарь с данными) при успешной проверке,
    или None если токен невалиден, истёк или подпись не совпадает.
    """
    try:
        # Декодируем токен, проверяя подпись и срок действия
        payload: dict[str, Any] = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except JWTError:
        # Токен невалиден: истёк срок, неверная подпись, повреждён и т.д.
        return None
