"""Обработчик команды /balance — быстрая проверка баланса занятий."""

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


@router.message(Command("balance"))
async def cmd_balance(message: Message) -> None:
    """Быстрая проверка баланса занятий.

    В MVP: заглушка с кнопкой открытия приложения.
    В проде: запрос к API по telegram_id через httpx.
    """
    await message.answer(
        "<b>Ваш баланс</b>\n\n"
        "Для просмотра баланса откройте приложение.",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="Открыть приложение",
                        web_app=WebAppInfo(
                            url=f"{settings.TELEGRAM_WEBAPP_URL}/profile"
                        ),
                    )
                ],
            ]
        ),
    )
