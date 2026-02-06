"""
FastAPI dependencies для авторизации и доступа к текущему пользователю.
Используются как Depends(...) в защищённых эндпоинтах.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.security import verify_token
from app.models.user import User

# Bearer-схема для извлечения JWT из заголовка Authorization
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Получить текущего авторизованного пользователя по JWT-токену.
    Выбрасывает 401 если токен отсутствует или невалиден.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется авторизация",
        )

    payload = verify_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидный или истёкший токен",
        )

    # sub содержит telegram_id пользователя
    telegram_id = int(payload["sub"])
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )

    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """
    Получить текущего пользователя если авторизован, иначе None.
    Используется для эндпоинтов с опциональной авторизацией
    (например, чтобы показать флаг is_booked в списке занятий).
    """
    if credentials is None:
        return None

    payload = verify_token(credentials.credentials)
    if payload is None:
        return None

    telegram_id = int(payload["sub"])
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    return result.scalar_one_or_none()


async def get_current_admin(
    user: User = Depends(get_current_user),
) -> User:
    """
    Проверить что текущий пользователь — администратор.
    Выбрасывает 403 если пользователь не имеет прав администратора.
    """
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещён: требуются права администратора",
        )
    return user
