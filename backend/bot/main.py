"""Точка входа для Telegram-бота Dance Max.

Использует aiogram 3 с поддержкой Telegram Web App.
"""

import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties

from app.core.config import settings
from bot.handlers import start, balance, schedule, help

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main() -> None:
    """Инициализация и запуск бота."""
    bot = Bot(
        token=settings.TELEGRAM_BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher()

    # Регистрация хендлеров
    dp.include_router(start.router)
    dp.include_router(balance.router)
    dp.include_router(schedule.router)
    dp.include_router(help.router)

    # Установка меню-кнопки с Web App
    from aiogram.types import MenuButtonWebApp, WebAppInfo

    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="Открыть приложение",
            web_app=WebAppInfo(url=settings.TELEGRAM_WEBAPP_URL),
        )
    )

    logger.info("DanceMax Bot запущен")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
