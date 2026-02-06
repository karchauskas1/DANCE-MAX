"""Celery-задачи для отправки уведомлений через Telegram Bot API."""

import logging

from celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task
def send_lesson_reminder(
    telegram_id: int, lesson_name: str, time: str, room: str
) -> None:
    """Отправить напоминание о занятии через Telegram Bot.

    В MVP: логируем.
    В проде: отправляем сообщение через Bot API с inline-клавиатурой.

    Args:
        telegram_id: Telegram ID пользователя.
        lesson_name: Название занятия.
        time: Время начала.
        room: Зал проведения.
    """
    logger.info(
        "Напоминание для %d: %s в %s, зал %s",
        telegram_id,
        lesson_name,
        time,
        room,
    )


@celery_app.task
def send_subscription_expiring(telegram_id: int, lessons_left: int) -> None:
    """Уведомление об истечении абонемента.

    Args:
        telegram_id: Telegram ID пользователя.
        lessons_left: Количество оставшихся занятий.
    """
    logger.info(
        "Абонемент заканчивается у %d: осталось %d занятий",
        telegram_id,
        lessons_left,
    )


@celery_app.task
def send_lesson_cancelled(
    telegram_id: int, lesson_name: str, date: str
) -> None:
    """Уведомление об отмене занятия.

    Args:
        telegram_id: Telegram ID пользователя.
        lesson_name: Название занятия.
        date: Дата занятия.
    """
    logger.info(
        "Занятие отменено для %d: %s %s",
        telegram_id,
        lesson_name,
        date,
    )


@celery_app.task
def send_booking_confirmation(
    telegram_id: int, lesson_name: str, time: str
) -> None:
    """Подтверждение записи на занятие.

    Args:
        telegram_id: Telegram ID пользователя.
        lesson_name: Название занятия.
        time: Время начала.
    """
    logger.info(
        "Подтверждение записи для %d: %s в %s",
        telegram_id,
        lesson_name,
        time,
    )
