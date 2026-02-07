"""
Роутер аутентификации.

Обрабатывает авторизацию пользователей через Telegram Web App initData:
- Валидация initData от Telegram
- Создание/обновление пользователя в БД
- Выдача JWT-токена
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.security import create_access_token
from app.core.telegram import validate_init_data
from app.database import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, TelegramAuthRequest
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/telegram", response_model=AuthResponse)
async def telegram_auth(
    body: TelegramAuthRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    """
    Авторизация через Telegram Web App.

    1. Валидируем initData — проверяем подпись от Telegram
    2. Извлекаем данные пользователя из initData
    3. Создаём нового пользователя или обновляем существующего
    4. Генерируем JWT-токен
    5. Возвращаем токен и данные пользователя
    """
    # Шаг 1: Валидация initData
    user_data = validate_init_data(body.init_data, settings.TELEGRAM_BOT_TOKEN)
    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидные данные авторизации Telegram",
        )

    # Шаг 2: Извлекаем telegram_id и профильные данные
    telegram_id: int = user_data["id"]
    first_name: str = user_data.get("first_name", "")
    last_name: str | None = user_data.get("last_name")
    username: str | None = user_data.get("username")
    photo_url: str | None = user_data.get("photo_url")

    # Шаг 3: Ищем пользователя в БД или создаём нового
    result = await db.execute(
        select(User).where(User.telegram_id == telegram_id)
    )
    user = result.scalar_one_or_none()

    # Список telegram_id администраторов (из переменной окружения)
    ADMIN_IDS = {int(x.strip()) for x in settings.ADMIN_IDS.split(",") if x.strip()}

    if user is None:
        # Новый пользователь — создаём запись
        user = User(
            telegram_id=telegram_id,
            first_name=first_name,
            last_name=last_name,
            username=username,
            photo_url=photo_url,
            is_admin=telegram_id in ADMIN_IDS,
        )
        db.add(user)
        await db.flush()
    else:
        # Существующий пользователь — обновляем данные профиля из Telegram
        user.first_name = first_name
        user.last_name = last_name
        user.username = username
        if photo_url:
            user.photo_url = photo_url
        await db.flush()

    # Шаг 4: Генерируем JWT-токен (sub = telegram_id)
    token = create_access_token(data={"sub": str(telegram_id)})

    # Шаг 5: Возвращаем ответ
    return AuthResponse(
        token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Получить данные текущего авторизованного пользователя.
    Используется для проверки валидности токена и получения актуальных данных.
    """
    return UserResponse.model_validate(user)
