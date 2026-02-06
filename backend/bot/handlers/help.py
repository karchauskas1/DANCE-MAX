"""Обработчик команды /help — список доступных команд."""

from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

router = Router()


@router.message(Command("help"))
async def cmd_help(message: Message) -> None:
    """Список доступных команд бота."""
    await message.answer(
        "<b>Доступные команды:</b>\n\n"
        "/start — Открыть приложение\n"
        "/balance — Проверить баланс\n"
        "/schedule — Расписание на сегодня\n"
        "/help — Список команд\n\n"
        "<b>Контакты студии:</b>\n"
        "Телефон: +7 (999) 123-45-67\n"
        "Адрес: Санкт-Петербург"
    )
