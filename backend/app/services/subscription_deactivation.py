"""
Сервис деактивации просроченных подписок.

Выполняет пакетную деактивацию подписок, у которых истёк срок действия
(expires_at < текущей даты), но флаг is_active всё ещё True.
Используется из admin-эндпоинта (ручной запуск) и из Celery-задачи (по расписанию).
"""

from datetime import date

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subscription import Subscription


async def deactivate_expired_subscriptions(db: AsyncSession) -> int:
    """
    Деактивировать все просроченные подписки.

    Находит подписки с expires_at < сегодняшней даты и is_active=True,
    устанавливает is_active=False.

    Args:
        db: Асинхронная сессия SQLAlchemy.

    Returns:
        Количество деактивированных подписок.
    """
    today = date.today()

    # Сначала считаем количество записей для отчёта
    count_query = select(Subscription).where(
        Subscription.is_active == True,  # noqa: E712
        Subscription.expires_at < today,
    )
    result = await db.execute(count_query)
    expired = list(result.scalars().all())
    count = len(expired)

    if count == 0:
        return 0

    # Пакетное обновление через UPDATE
    stmt = (
        update(Subscription)
        .where(
            Subscription.is_active == True,  # noqa: E712
            Subscription.expires_at < today,
        )
        .values(is_active=False)
    )
    await db.execute(stmt)
    await db.flush()

    return count
