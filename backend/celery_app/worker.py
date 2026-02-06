"""Воркер Celery — импортирует все задачи для регистрации.

Запуск: celery -A celery_app.worker worker --loglevel=info
Для Celery Beat: celery -A celery_app.worker beat --loglevel=info
"""

from celery_app import celery_app  # noqa: F401

# Импортируем задачи, чтобы Celery их зарегистрировал
import celery_app.tasks.notifications  # noqa: F401
import celery_app.tasks.scheduled  # noqa: F401
