"""Обработчик команды /schedule — расписание на сегодня."""

from aiogram import Router
from aiogram.filters import Command
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)

from app.core.config import settings

router = Router()


@router.message(Command("schedule"))
async def cmd_schedule(message: Message) -> None:
    """Расписание на сегодня.

    В MVP: заглушка с кнопкой открытия приложения.
    В проде: запрос к API за расписанием на текущий день.
    """
    await message.answer(
        "<b>Расписание</b>\n\n"
        "Для просмотра полного расписания откройте приложение.",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="Полное расписание",
                        web_app=WebAppInfo(
                            url=f"{settings.TELEGRAM_WEBAPP_URL}/schedule"
                        ),
                    )
                ],
            ]
        ),
    )
