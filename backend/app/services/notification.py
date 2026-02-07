"""
Сервис уведомлений через Telegram-бота Dance Max.

Отправляет реальные сообщения пользователям через aiogram Bot.
Каждая функция оборачивает отправку в try/except, чтобы
ошибка доставки (бот заблокирован, пользователь удалён)
не ломала бизнес-логику вызывающего кода.
"""

import logging

from app.core.bot import bot

logger = logging.getLogger(__name__)


async def notify_booking_created(
    user_telegram_id: int,
    lesson_info: str,
) -> bool:
    """Уведомление о записи на занятие.

    Args:
        user_telegram_id: Telegram ID пользователя.
        lesson_info: Информация о занятии (направление, дата, время).

    Returns:
        True если сообщение отправлено, False если ошибка.
    """
    text = (
        "<b>Вы записаны на занятие</b>\n\n"
        f"{lesson_info}\n\n"
        "Ждём вас в студии! Если планы изменятся, "
        "отмените запись заранее в приложении."
    )
    try:
        await bot.send_message(chat_id=user_telegram_id, text=text)
        logger.info("Уведомление о записи отправлено: user=%d", user_telegram_id)
        return True
    except Exception:
        logger.warning(
            "Не удалось отправить уведомление о записи: user=%d",
            user_telegram_id,
            exc_info=True,
        )
        return False


async def notify_booking_cancelled(
    user_telegram_id: int,
    lesson_info: str,
) -> bool:
    """Уведомление об отмене записи пользователем.

    Args:
        user_telegram_id: Telegram ID пользователя.
        lesson_info: Информация о занятии (направление, дата, время).

    Returns:
        True если сообщение отправлено, False если ошибка.
    """
    text = (
        "<b>Запись отменена</b>\n\n"
        f"{lesson_info}\n\n"
        "Занятие возвращено на ваш баланс."
    )
    try:
        await bot.send_message(chat_id=user_telegram_id, text=text)
        logger.info("Уведомление об отмене записи отправлено: user=%d", user_telegram_id)
        return True
    except Exception:
        logger.warning(
            "Не удалось отправить уведомление об отмене: user=%d",
            user_telegram_id,
            exc_info=True,
        )
        return False


async def notify_lesson_cancelled(
    user_telegram_id: int,
    lesson_info: str,
    reason: str,
) -> bool:
    """Уведомление об отмене занятия администратором.

    Отправляется всем записанным пользователям, когда
    администратор отменяет занятие.

    Args:
        user_telegram_id: Telegram ID пользователя.
        lesson_info: Информация о занятии (дата, время).
        reason: Причина отмены.

    Returns:
        True если сообщение отправлено, False если ошибка.
    """
    text = (
        "<b>Занятие отменено</b>\n\n"
        f"{lesson_info}\n"
        f"Причина: {reason}\n\n"
        "Занятие возвращено на ваш баланс. Приносим извинения за неудобства."
    )
    try:
        await bot.send_message(chat_id=user_telegram_id, text=text)
        logger.info("Уведомление об отмене занятия отправлено: user=%d", user_telegram_id)
        return True
    except Exception:
        logger.warning(
            "Не удалось отправить уведомление об отмене занятия: user=%d",
            user_telegram_id,
            exc_info=True,
        )
        return False


# ---------- Устаревший класс (оставлен для обратной совместимости) ----------

class NotificationService:
    """Сервис уведомлений через Telegram-бота.

    Устаревший класс-обёртка. Используйте модульные функции
    notify_booking_created, notify_booking_cancelled, notify_lesson_cancelled.
    """

    @staticmethod
    async def send_lesson_reminder(
        user_telegram_id: int,
        lesson_name: str,
        time: str,
        room: str,
    ) -> None:
        """Напоминание о занятии за 2 часа."""
        text = (
            "<b>Напоминание о занятии</b>\n\n"
            f"{lesson_name}\n"
            f"Время: {time}\n"
            f"Зал: {room}\n\n"
            "До встречи в студии!"
        )
        try:
            await bot.send_message(chat_id=user_telegram_id, text=text)
        except Exception:
            logger.warning(
                "Не удалось отправить напоминание: user=%d", user_telegram_id, exc_info=True
            )

    @staticmethod
    async def send_subscription_expiring(
        user_telegram_id: int,
        lessons_left: int,
    ) -> None:
        """Уведомление об истечении абонемента."""
        text = (
            "<b>Абонемент заканчивается</b>\n\n"
            f"Осталось занятий: {lessons_left}\n\n"
            "Продлите абонемент, чтобы не пропустить любимые занятия!"
        )
        try:
            await bot.send_message(chat_id=user_telegram_id, text=text)
        except Exception:
            logger.warning(
                "Не удалось отправить уведомление об абонементе: user=%d",
                user_telegram_id,
                exc_info=True,
            )

    @staticmethod
    async def send_lesson_cancelled(
        user_telegram_id: int,
        lesson_name: str,
        date: str,
    ) -> None:
        """Уведомление об отмене занятия (устаревший метод)."""
        await notify_lesson_cancelled(
            user_telegram_id=user_telegram_id,
            lesson_info=f"{lesson_name}, {date}",
            reason="Занятие отменено",
        )
