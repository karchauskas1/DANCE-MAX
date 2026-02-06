"""Бизнес-логика записей на занятия (бронирование)."""

from datetime import date as date_type, datetime

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Booking, Lesson, Transaction, User


class BookingService:
    """Сервис для работы с записями на занятия."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_booking(self, user_id: int, lesson_id: int) -> Booking:
        """Записать пользователя на занятие.

        Проверки:
        1. Занятие существует и не отменено
        2. Пользователь ещё не записан
        3. Есть свободные места
        4. У пользователя есть баланс

        Args:
            user_id: ID пользователя.
            lesson_id: ID занятия.

        Returns:
            Созданная запись (Booking).

        Raises:
            HTTPException: При нарушении одного из условий.
        """
        # Получаем занятие
        lesson = await self.db.get(Lesson, lesson_id)
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Занятие не найдено",
            )
        if lesson.is_cancelled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Занятие отменено",
            )

        # Проверяем, не записан ли уже пользователь
        existing = await self.db.execute(
            select(Booking).where(
                Booking.user_id == user_id,
                Booking.lesson_id == lesson_id,
                Booking.status == "active",
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Вы уже записаны на это занятие",
            )

        # Проверяем свободные места
        spots_count = await self.db.execute(
            select(func.count(Booking.id)).where(
                Booking.lesson_id == lesson_id,
                Booking.status == "active",
            )
        )
        current_spots = spots_count.scalar() or 0
        if current_spots >= lesson.max_spots:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="На занятии нет свободных мест",
            )

        # Проверяем баланс пользователя
        user = await self.db.get(User, user_id)
        if not user or user.balance <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Недостаточно занятий на балансе",
            )

        # Создаём запись
        booking = Booking(
            user_id=user_id,
            lesson_id=lesson_id,
            status="active",
            booked_at=datetime.utcnow(),
        )
        self.db.add(booking)

        # Списываем занятие с баланса
        user.balance -= 1

        # Создаём транзакцию списания
        transaction = Transaction(
            user_id=user_id,
            type="deduction",
            amount=-1,
            description="Запись на занятие",
            booking_id=booking.id,
        )
        self.db.add(transaction)

        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def cancel_booking(self, user_id: int, booking_id: int) -> Booking:
        """Отменить запись и вернуть занятие на баланс.

        Args:
            user_id: ID пользователя (для проверки владельца).
            booking_id: ID записи для отмены.

        Returns:
            Обновлённая запись (Booking) со статусом «cancelled».

        Raises:
            HTTPException: Если запись не найдена, не принадлежит пользователю или уже отменена.
        """
        booking = await self.db.get(Booking, booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Запись не найдена",
            )
        if booking.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Это не ваша запись",
            )
        if booking.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Запись уже отменена",
            )

        booking.status = "cancelled"
        booking.cancelled_at = datetime.utcnow()

        # Возвращаем занятие на баланс
        user = await self.db.get(User, user_id)
        if user:
            user.balance += 1

        # Транзакция возврата
        transaction = Transaction(
            user_id=user_id,
            type="refund",
            amount=1,
            description="Отмена записи на занятие",
            booking_id=booking_id,
        )
        self.db.add(transaction)

        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def get_user_bookings(
        self, user_id: int, upcoming: bool = True
    ) -> list[Booking]:
        """Получить записи пользователя.

        Args:
            user_id: ID пользователя.
            upcoming: True — предстоящие активные записи, False — прошедшие/отменённые.

        Returns:
            Список записей, отсортированных по дате.
        """
        query = (
            select(Booking)
            .join(Lesson)
            .where(Booking.user_id == user_id)
        )

        if upcoming:
            # Активные записи на будущие занятия
            query = query.where(
                Booking.status == "active",
                Lesson.date >= date_type.today(),
            )
        else:
            # Прошедшие или отменённые записи
            query = query.where(
                (Booking.status != "active") | (Lesson.date < date_type.today())
            )

        query = query.order_by(Lesson.date.desc(), Lesson.start_time.desc())

        result = await self.db.execute(query)
        return list(result.scalars().all())
