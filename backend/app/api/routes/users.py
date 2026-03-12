"""
Роутер пользователей.

Эндпоинты для работы с профилем пользователя:
- Получение текущего профиля
- Баланс и информация об активных абонементах
- История транзакций (пагинация)
"""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.subscription import Subscription
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionResponse
from app.schemas.user import SetRealNameRequest, UserBalanceResponse, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    user: User = Depends(get_current_user),
) -> UserResponse:
    """Получить профиль текущего пользователя."""
    return UserResponse.model_validate(user)


@router.put("/real-name", response_model=UserResponse)
async def set_real_name(
    body: SetRealNameRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Установить настоящее ФИО пользователя по трём отдельным полям.
    Можно вызвать только один раз — после установки изменить нельзя.
    real_name заполняется автоматически как «Фамилия Имя Отчество».
    """
    if user.real_name is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="ФИО уже установлено и не может быть изменено",
        )
    # Pydantic уже применил .strip() через field_validator(mode="before"),
    # но повторяем явно для соответствия спеку и защиты от будущих изменений
    user.real_last_name  = body.real_last_name.strip()
    user.real_first_name = body.real_first_name.strip()
    user.real_patronymic = body.real_patronymic.strip()
    user.real_name = f"{user.real_last_name} {user.real_first_name} {user.real_patronymic}"
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.get("/balance", response_model=UserBalanceResponse)
async def get_balance(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> UserBalanceResponse:
    """
    Получить баланс пользователя и количество активных абонементов.
    Активный абонемент — это абонемент с is_active=True и expires_at >= сегодня.
    """
    # Считаем количество активных абонементов
    result = await db.execute(
        select(func.count(Subscription.id)).where(
            Subscription.user_id == user.id,
            Subscription.is_active == True,  # noqa: E712
            Subscription.expires_at >= date.today(),
        )
    )
    active_count = result.scalar() or 0

    return UserBalanceResponse(
        balance=user.balance,
        active_subscriptions=active_count,
    )


@router.get("/history", response_model=list[TransactionResponse])
async def get_transaction_history(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    offset: int = Query(0, ge=0, description="Смещение для пагинации"),
    limit: int = Query(20, ge=1, le=100, description="Количество записей на странице"),
) -> list[TransactionResponse]:
    """
    Получить историю транзакций пользователя с пагинацией.
    Транзакции отсортированы от новых к старым.
    """
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == user.id)
        .order_by(Transaction.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    transactions = result.scalars().all()
    return [TransactionResponse.model_validate(t) for t in transactions]
