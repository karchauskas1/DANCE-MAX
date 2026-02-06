"""
Alembic env.py — настройка асинхронных миграций.

Загружает DATABASE_URL из app.core.config.settings,
импортирует все модели через app.models и использует Base.metadata
для автогенерации миграций.
"""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.core.config import settings
from app.database import Base

# Импорт всех моделей, чтобы Base.metadata содержал все таблицы
import app.models  # noqa: F401

# Конфигурация Alembic (из alembic.ini)
config = context.config

# Устанавливаем URL базы данных из настроек приложения
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Настраиваем логирование из alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Метаданные моделей — Alembic использует их для autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Запуск миграций в offline-режиме (без подключения к БД).

    Генерирует SQL-скрипты вместо выполнения миграций напрямую.
    Полезно для ревью миграций или применения через CI/CD.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Выполнение миграций в контексте соединения."""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """
    Запуск миграций в async-режиме.

    Создаёт асинхронный движок из конфигурации alembic.ini,
    подключается к БД и выполняет миграции через синхронный callback.
    """
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """
    Запуск миграций в online-режиме (с подключением к БД).
    Использует asyncio для работы с асинхронным движком.
    """
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
