"""Переиспользуемые inline-клавиатуры для Telegram-бота."""

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

from app.core.config import settings


def webapp_button(
    text: str = "Открыть приложение", path: str = ""
) -> InlineKeyboardMarkup:
    """Создать клавиатуру с кнопкой Web App.

    Args:
        text: Текст кнопки.
        path: Путь внутри Web App (например, "/profile").

    Returns:
        Клавиатура с одной кнопкой Web App.
    """
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text=text,
                    web_app=WebAppInfo(
                        url=f"{settings.TELEGRAM_WEBAPP_URL}{path}"
                    ),
                )
            ],
        ]
    )


def lesson_reminder_keyboard(lesson_id: int) -> InlineKeyboardMarkup:
    """Клавиатура для напоминания о занятии.

    Args:
        lesson_id: ID занятия для формирования ссылки.

    Returns:
        Клавиатура с кнопкой «Подробнее».
    """
    return webapp_button("Подробнее", f"/lesson/{lesson_id}")


def subscription_keyboard() -> InlineKeyboardMarkup:
    """Клавиатура для продления абонемента.

    Returns:
        Клавиатура с кнопкой «Продлить абонемент».
    """
    return webapp_button("Продлить абонемент", "/payment")
