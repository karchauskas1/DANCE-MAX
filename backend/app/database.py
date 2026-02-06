"""
Настройка асинхронного подключения к базе данных через SQLAlchemy.
Используется asyncpg как драйвер для PostgreSQL.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# Создаём асинхронный движок SQLAlchemy для работы с PostgreSQL
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,  # В продакшене логирование SQL-запросов отключено
)

# Фабрика асинхронных сессий — каждая сессия = одна единица работы с БД
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Не инвалидировать объекты после коммита
)


class Base(DeclarativeBase):
    """Базовый класс для всех моделей SQLAlchemy."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Генератор асинхронной сессии БД для использования в Depends.

    Открывает сессию, передаёт её в обработчик запроса,
    и гарантирует закрытие после завершения.
    """
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
