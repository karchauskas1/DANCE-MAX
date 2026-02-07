"""Точка входа для Telegram-бота Dance Max (режим polling).

Используется ТОЛЬКО для локальной разработки.
В продакшене (Vercel) бот работает через webhook,
интегрированный в FastAPI (см. app/api/routes/webhook.py).

Запуск: python -m bot.main
"""

import asyncio
import logging

from aiogram.types import MenuButtonWebApp, WebAppInfo

from app.core.bot import bot, dp, setup_dispatcher
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main() -> None:
    """Инициализация и запуск бота в режиме polling (для локальной разработки)."""
    # Регистрируем хендлеры
    setup_dispatcher()

    # Удаляем webhook, если был установлен ранее (polling и webhook несовместимы)
    await bot.delete_webhook(drop_pending_updates=True)

    # Установка меню-кнопки с Web App
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="Открыть приложение",
            web_app=WebAppInfo(url=settings.TELEGRAM_WEBAPP_URL),
        )
    )

    logger.info("DanceMax Bot запущен (polling mode)")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
