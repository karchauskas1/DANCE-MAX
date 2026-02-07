"""
Главный модуль приложения DanceMax API.

Создаёт экземпляр FastAPI, подключает CORS-middleware,
регистрирует все роутеры, настраивает webhook для Telegram-бота,
rate limiting и определяет корневой эндпоинт.
"""

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

import sentry_sdk
from aiogram.types import MenuButtonWebApp, WebAppInfo
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.routes import api_router
from app.core.bot import bot, setup_dispatcher
from app.core.config import settings

logger: logging.Logger = logging.getLogger(__name__)

# Sentry — инициализация при наличии DSN
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment="production",
        traces_sample_rate=0.2,
        enable_tracing=True,
    )
    logger.info("Sentry инициализирован")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Жизненный цикл приложения: действия при запуске и остановке."""
    # Регистрируем хендлеры бота в диспетчере
    setup_dispatcher()

    # Устанавливаем webhook для получения обновлений от Telegram
    if settings.TELEGRAM_BOT_TOKEN:
        webhook_url = f"{settings.BACKEND_URL}/api/bot/webhook"
        try:
            await bot.set_webhook(
                url=webhook_url,
                drop_pending_updates=True,
            )
            logger.info("Telegram webhook установлен: %s", webhook_url)

            # Устанавливаем кнопку Web App в меню бота
            await bot.set_chat_menu_button(
                menu_button=MenuButtonWebApp(
                    text="Открыть приложение",
                    web_app=WebAppInfo(url=settings.TELEGRAM_WEBAPP_URL),
                )
            )
            logger.info("Menu button установлена")
        except Exception:
            logger.exception("Не удалось настроить Telegram webhook")

    logger.info("DanceMax API запущен")
    yield

    # Удаляем webhook при остановке приложения
    if settings.TELEGRAM_BOT_TOKEN:
        try:
            await bot.delete_webhook()
            await bot.session.close()
            logger.info("Telegram webhook удалён, сессия закрыта")
        except Exception:
            logger.exception("Ошибка при удалении webhook")

    logger.info("DanceMax API остановлен")


# Rate limiter — ограничение частоты запросов по IP
# Глобальный лимит: 100 запросов/минуту; admin write: 30 запросов/минуту
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

app = FastAPI(
    title="DanceMax API",
    description="API для Telegram Web App танцевальной студии DanceMax",
    version="1.0.0",
    lifespan=lifespan,
)

# Привязываем limiter к приложению (slowapi хранит state в app)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS: разрешаем только конкретные домены фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()],
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
