"""
Роутер для обработки Telegram webhook.

Принимает входящие Update от Telegram Bot API и передаёт их
в aiogram Dispatcher для обработки зарегистрированными хендлерами.

Эндпоинт:
    POST /bot/webhook — принимает JSON-тело Update от Telegram
"""

import logging

from aiogram.types import Update
from fastapi import APIRouter, Request, Response

from app.core.bot import bot, dp

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bot", tags=["webhook"])


@router.post("/webhook")
async def telegram_webhook(request: Request) -> Response:
    """
    Обработка входящего Telegram Update через webhook.

    Telegram отправляет JSON с объектом Update на этот эндпоинт.
    Мы парсим его в aiogram Update и передаём в Dispatcher.
    """
    try:
        update_data = await request.json()
        update = Update.model_validate(update_data, context={"bot": bot})
        await dp.feed_update(bot=bot, update=update)
    except Exception:
        logger.exception("Ошибка обработки Telegram webhook")
    # Всегда возвращаем 200, чтобы Telegram не ретраил запрос бесконечно
    return Response(status_code=200)
