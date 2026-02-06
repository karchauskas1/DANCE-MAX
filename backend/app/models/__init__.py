"""
Реестр всех моделей SQLAlchemy.

Импорт всех моделей здесь гарантирует, что Alembic и Base.metadata
видят все таблицы при генерации миграций.
"""

from app.models.booking import Booking
from app.models.direction import Direction
from app.models.lesson import Lesson
from app.models.promotion import Promotion
from app.models.special_course import SpecialCourse
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.teacher import Teacher, teacher_direction
from app.models.transaction import Transaction
from app.models.user import User

__all__: list[str] = [
    "User",
    "Direction",
    "Teacher",
    "teacher_direction",
    "Lesson",
    "Booking",
    "SubscriptionPlan",
    "Subscription",
    "Transaction",
    "Promotion",
    "SpecialCourse",
]
