"""
Главный модуль приложения DanceMax API.

Создаёт экземпляр FastAPI, подключает CORS-middleware,
регистрирует все роутеры и определяет корневой эндпоинт.
"""

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router

logger: logging.Logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Жизненный цикл приложения: действия при запуске и остановке."""
    # Действия при запуске приложения
    logger.info("DanceMax API запущен")
    yield
    # Действия при остановке приложения (если нужны)
    logger.info("DanceMax API остановлен")


app = FastAPI(
    title="DanceMax API",
    description="API для Telegram Web App танцевальной студии DanceMax",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS-настройки: разрешаем все источники для разработки
# В продакшене следует ограничить origins конкретными доменами
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение всех роутеров с общим префиксом /api
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root() -> dict[str, str]:
    """Корневой эндпоинт для проверки работоспособности API."""
    return {"status": "ok", "app": "DanceMax API"}
