"""
Синглтон экземпляров Bot и Dispatcher для aiogram 3.

Используется:
- В webhook-эндпоинте для обработки входящих Update от Telegram
- В сервисе уведомлений для отправки сообщений пользователям
- В рассылке (broadcast) для массовой отправки

Единая точка создания — исключает дублирование и гарантирует,
что все хендлеры зарегистрированы ровно один раз.
"""

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from app.core.config import settings

# Глобальный экземпляр бота — переиспользуется во всех модулях
bot = Bot(
    token=settings.TELEGRAM_BOT_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML),
)

# Диспетчер с зарегистрированными хендлерами
dp = Dispatcher()


def setup_dispatcher() -> None:
    """Зарегистрировать все хендлеры бота в диспетчере.

    Вызывается один раз при старте приложения (в lifespan FastAPI).
    Импорт роутеров внутри функции — для избежания циклических зависимостей.
    """
    from bot.handlers import start, balance, schedule, help as help_handler

    dp.include_router(start.router)
    dp.include_router(balance.router)
    dp.include_router(schedule.router)
    dp.include_router(help_handler.router)
