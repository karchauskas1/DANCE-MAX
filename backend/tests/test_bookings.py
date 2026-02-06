"""
Тесты бронирования занятий.

Проверяет бизнес-логику записи на занятия:
- Успешная запись (списание с баланса, создание транзакции)
- Отказ при нулевом балансе
- Отказ при полном занятии (нет свободных мест)
- Отказ при повторной записи на то же занятие
- Успешная отмена записи (возврат на баланс)
- Отказ при отмене уже отменённой записи
- Получение списка бронирований пользователя
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking
from app.models.lesson import Lesson
from app.models.user import User


class TestCreateBooking:
    """Тесты эндпоинта POST /api/bookings"""

    async def test_create_booking_success(
        self,
        client: AsyncClient,
        test_user: User,
        test_lesson: Lesson,
        auth_headers: dict,
    ):
        """Успешная запись на занятие — баланс уменьшается на 1."""
        response = await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()

        # Проверяем структуру ответа бронирования
        assert data["status"] == "active"
        assert data["lesson"]["id"] == test_lesson.id
        assert data["cancelled_at"] is None

    async def test_create_booking_balance_decreases(
        self,
        client: AsyncClient,
        test_user: User,
        test_lesson: Lesson,
        auth_headers: dict,
    ):
        """При записи на занятие баланс пользователя уменьшается на 1."""
        initial_balance = test_user.balance

        await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
            headers=auth_headers,
        )

        # Проверяем обновлённый баланс через /api/auth/me
        me_response = await client.get("/api/auth/me", headers=auth_headers)
        assert me_response.json()["balance"] == initial_balance - 1

    async def test_create_booking_no_balance(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_lesson: Lesson,
        auth_headers: dict,
        test_user: User,
    ):
        """Отказ записи при нулевом балансе — нужно купить абонемент."""
        # Обнуляем баланс пользователя
        test_user.balance = 0
        db_session.add(test_user)
        await db_session.commit()

        response = await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
            headers=auth_headers,
        )

        assert response.status_code == 400
        assert "Недостаточно занятий на балансе" in response.json()["detail"]

    async def test_create_booking_lesson_full(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_lesson_full: Lesson,
        test_user: User,
        auth_headers: dict,
    ):
        """Отказ записи когда все места на занятии заняты."""
        # Создаём бронирование от другого пользователя, чтобы заполнить единственное место
        other_user = User(
            telegram_id=555555555,
            first_name="Другой",
            username="other",
            balance=5,
        )
        db_session.add(other_user)
        await db_session.flush()

        existing_booking = Booking(
            user_id=other_user.id,
            lesson_id=test_lesson_full.id,
            status="active",
        )
        db_session.add(existing_booking)
        await db_session.commit()

        # Пытаемся записаться — мест нет
        response = await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson_full.id},
            headers=auth_headers,
        )

        assert response.status_code == 400
        assert "Нет свободных мест" in response.json()["detail"]

    async def test_create_booking_duplicate(
        self,
        client: AsyncClient,
        test_user: User,
        test_lesson: Lesson,
        auth_headers: dict,
    ):
        """Отказ при повторной записи на то же занятие."""
        # Первая запись — успешная
        response1 = await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
            headers=auth_headers,
        )
        assert response1.status_code == 201

        # Вторая запись на то же занятие — отказ
        response2 = await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
            headers=auth_headers,
        )

        assert response2.status_code == 400
        assert "Вы уже записаны" in response2.json()["detail"]

    async def test_create_booking_lesson_not_found(
        self,
        client: AsyncClient,
        test_user: User,
        auth_headers: dict,
    ):
        """Отказ записи на несуществующее занятие."""
        response = await client.post(
            "/api/bookings",
            json={"lesson_id": 99999},
            headers=auth_headers,
        )

        assert response.status_code == 404
        assert "Занятие не найдено" in response.json()["detail"]

    async def test_create_booking_unauthorized(
        self, client: AsyncClient, test_lesson: Lesson
    ):
        """Отказ записи без авторизации."""
        response = await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
        )

        assert response.status_code == 401


class TestCancelBooking:
    """Тесты эндпоинта DELETE /api/bookings/{booking_id}"""

    async def test_cancel_booking_success(
        self,
        client: AsyncClient,
        test_user: User,
        test_lesson: Lesson,
        auth_headers: dict,
    ):
        """Успешная отмена записи — баланс возвращается."""
        # Создаём бронирование
        create_response = await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
            headers=auth_headers,
        )
        booking_id = create_response.json()["id"]

        # Отменяем бронирование
        cancel_response = await client.delete(
            f"/api/bookings/{booking_id}",
            headers=auth_headers,
        )

        assert cancel_response.status_code == 200
        data = cancel_response.json()
        assert data["status"] == "cancelled"
        assert data["cancelled_at"] is not None

    async def test_cancel_booking_balance_returns(
        self,
        client: AsyncClient,
        test_user: User,
        test_lesson: Lesson,
        auth_headers: dict,
    ):
        """При отмене записи 1 занятие возвращается на баланс."""
        initial_balance = test_user.balance

        # Записываемся (баланс -1)
        create_response = await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
            headers=auth_headers,
        )
        booking_id = create_response.json()["id"]

        # Отменяем (баланс +1, возврат к исходному)
        await client.delete(
            f"/api/bookings/{booking_id}",
            headers=auth_headers,
        )

        me_response = await client.get("/api/auth/me", headers=auth_headers)
        assert me_response.json()["balance"] == initial_balance

    async def test_cancel_already_cancelled(
        self,
        client: AsyncClient,
        test_user: User,
        test_lesson: Lesson,
        auth_headers: dict,
    ):
        """Отказ отмены уже отменённой записи."""
        # Записываемся
        create_response = await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
            headers=auth_headers,
        )
        booking_id = create_response.json()["id"]

        # Первая отмена — успешна
        cancel1 = await client.delete(
            f"/api/bookings/{booking_id}",
            headers=auth_headers,
        )
        assert cancel1.status_code == 200

        # Вторая отмена — отказ
        cancel2 = await client.delete(
            f"/api/bookings/{booking_id}",
            headers=auth_headers,
        )

        assert cancel2.status_code == 400
        assert "уже отменена" in cancel2.json()["detail"]

    async def test_cancel_booking_not_found(
        self, client: AsyncClient, test_user: User, auth_headers: dict
    ):
        """Отмена несуществующего бронирования."""
        response = await client.delete(
            "/api/bookings/99999",
            headers=auth_headers,
        )

        assert response.status_code == 404


class TestGetMyBookings:
    """Тесты эндпоинта GET /api/bookings/my"""

    async def test_get_my_bookings_empty(
        self, client: AsyncClient, test_user: User, auth_headers: dict
    ):
        """Пустой список бронирований для нового пользователя."""
        response = await client.get("/api/bookings/my", headers=auth_headers)

        assert response.status_code == 200
        assert response.json() == []

    async def test_get_my_bookings_with_data(
        self,
        client: AsyncClient,
        test_user: User,
        test_lesson: Lesson,
        auth_headers: dict,
    ):
        """Получение списка бронирований после записи на занятие."""
        # Записываемся на занятие
        await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
            headers=auth_headers,
        )

        # Получаем список
        response = await client.get("/api/bookings/my", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "active"
        assert data[0]["lesson"]["id"] == test_lesson.id

    async def test_get_my_bookings_filter_active(
        self,
        client: AsyncClient,
        test_user: User,
        test_lesson: Lesson,
        auth_headers: dict,
    ):
        """Фильтрация бронирований по статусу active."""
        # Записываемся
        create_resp = await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
            headers=auth_headers,
        )
        booking_id = create_resp.json()["id"]

        # Получаем только активные
        response = await client.get(
            "/api/bookings/my?status=active",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "active"

    async def test_get_my_bookings_filter_cancelled(
        self,
        client: AsyncClient,
        test_user: User,
        test_lesson: Lesson,
        auth_headers: dict,
    ):
        """Фильтрация отменённых бронирований."""
        # Записываемся и отменяем
        create_resp = await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
            headers=auth_headers,
        )
        booking_id = create_resp.json()["id"]

        await client.delete(
            f"/api/bookings/{booking_id}",
            headers=auth_headers,
        )

        # Фильтруем по cancelled
        response = await client.get(
            "/api/bookings/my?status=cancelled",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "cancelled"

    async def test_get_my_bookings_unauthorized(self, client: AsyncClient):
        """Отказ при запросе бронирований без авторизации."""
        response = await client.get("/api/bookings/my")
        assert response.status_code == 401
