"""Периодические задачи Celery Beat для Dance Max."""

import logging

from celery.schedules import crontab

from celery_app import celery_app

logger = logging.getLogger(__name__)

# Настройка периодических задач (Celery Beat)
celery_app.conf.beat_schedule = {
    "check-lesson-reminders": {
        "task": "celery_app.tasks.scheduled.check_lesson_reminders",
        "schedule": crontab(minute="*/30"),  # каждые 30 минут
    },
    "check-expiring-subscriptions": {
        "task": "celery_app.tasks.scheduled.check_expiring_subscriptions",
        "schedule": crontab(hour=10, minute=0),  # каждый день в 10:00 МСК
    },
}


@celery_app.task
def check_lesson_reminders() -> None:
    """Проверить занятия, которые начнутся через 2 часа, и отправить напоминания.

    В проде:
    1. Запрос к БД за занятиями, начинающимися через ~2 часа
    2. Для каждого забронированного пользователя — отправка напоминания
    3. Пометка отправленных напоминаний, чтобы не дублировать
    """
    logger.info("Проверка напоминаний о занятиях...")
    # В проде: query lessons starting in ~2 hours, send reminders to booked users


@celery_app.task
def check_expiring_subscriptions() -> None:
    """Проверить абонементы, которые заканчиваются через 3 дня или 1 день.

    В проде:
    1. Запрос к БД за подписками, истекающими через 3 дня и 1 день
    2. Отправка уведомлений пользователям о необходимости продления
    """
    logger.info("Проверка истекающих абонементов...")
    # В проде: query subscriptions expiring soon, send notifications
