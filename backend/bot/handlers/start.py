"""Обработчик команды /start — приветствие и кнопка Web App."""

from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)

from app.core.config import settings

router = Router()


@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    """Обработчик команды /start — приветствие и кнопка Web App."""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="\U0001f3af Открыть приложение",
                    web_app=WebAppInfo(url=settings.TELEGRAM_WEBAPP_URL),
                )
            ],
        ]
    )

    await message.answer(
        f"<b>Добро пожаловать в Dance Max!</b>\n\n"
        f"Студия социальных танцев в Санкт-Петербурге.\n"
        f"Сальса, бачата, кизомба и многое другое.\n\n"
        f"Нажмите кнопку ниже, чтобы открыть приложение:",
        reply_markup=keyboard,
    )
