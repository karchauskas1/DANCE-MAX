"""Сервис уведомлений — формирует задачи для Celery."""

import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Сервис уведомлений через Telegram-бота.

    В MVP: логирование вызовов.
    В проде: отправка задач в Celery для асинхронной доставки.
    """

    @staticmethod
    async def send_lesson_reminder(
        user_telegram_id: int,
        lesson_name: str,
        time: str,
        room: str,
    ) -> None:
        """Напоминание о занятии за 2 часа.

        Args:
            user_telegram_id: Telegram ID пользователя.
            lesson_name: Название занятия.
            time: Время начала занятия.
            room: Название зала.
        """
        # В проде: celery_app.tasks.notifications.send_lesson_reminder.delay(
        #     user_telegram_id, lesson_name, time, room
        # )
        logger.info(
            "Напоминание о занятии: user=%d, lesson=%s, time=%s, room=%s",
            user_telegram_id,
            lesson_name,
            time,
            room,
        )

    @staticmethod
    async def send_subscription_expiring(
        user_telegram_id: int,
        lessons_left: int,
    ) -> None:
        """Уведомление об истечении абонемента.

        Args:
            user_telegram_id: Telegram ID пользователя.
            lessons_left: Количество оставшихся занятий.
        """
        # В проде: celery_app.tasks.notifications.send_subscription_expiring.delay(
        #     user_telegram_id, lessons_left
        # )
        logger.info(
            "Абонемент заканчивается: user=%d, осталось=%d",
            user_telegram_id,
            lessons_left,
        )

    @staticmethod
    async def send_lesson_cancelled(
        user_telegram_id: int,
        lesson_name: str,
        date: str,
    ) -> None:
        """Уведомление об отмене занятия.

        Args:
            user_telegram_id: Telegram ID пользователя.
            lesson_name: Название занятия.
            date: Дата занятия.
        """
        # В проде: celery_app.tasks.notifications.send_lesson_cancelled.delay(
        #     user_telegram_id, lesson_name, date
        # )
        logger.info(
            "Занятие отменено: user=%d, lesson=%s, date=%s",
            user_telegram_id,
            lesson_name,
            date,
        )
