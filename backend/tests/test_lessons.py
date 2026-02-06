"""
Тесты расписания занятий.

Проверяет:
- Получение списка занятий (по умолчанию — сегодня)
- Фильтрация по дате, направлению, уровню
- Получение детальной информации о занятии
- Подсчёт свободных мест и флаг is_booked
"""

from datetime import date, timedelta

import pytest
from httpx import AsyncClient

from app.models.direction import Direction
from app.models.lesson import Lesson
from app.models.user import User


class TestGetLessons:
    """Тесты эндпоинта GET /api/lessons"""

    async def test_get_lessons_today(
        self,
        client: AsyncClient,
        test_lesson: Lesson,
    ):
        """Получение занятий на сегодня (поведение по умолчанию)."""
        response = await client.get("/api/lessons")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

        # Проверяем что все занятия на сегодня
        today_str = date.today().isoformat()
        for lesson in data:
            assert lesson["date"] == today_str

    async def test_get_lessons_structure(
        self,
        client: AsyncClient,
        test_lesson: Lesson,
    ):
        """Проверка структуры ответа для занятия в расписании."""
        response = await client.get("/api/lessons")
        data = response.json()
        lesson = data[0]

        # Проверяем все обязательные поля
        assert "id" in lesson
        assert "direction" in lesson
        assert "teacher" in lesson
        assert "date" in lesson
        assert "start_time" in lesson
        assert "end_time" in lesson
        assert "room" in lesson
        assert "max_spots" in lesson
        assert "current_spots" in lesson
        assert "level" in lesson
        assert "is_cancelled" in lesson
        assert "is_booked" in lesson

        # Проверяем вложенные объекты
        assert "name" in lesson["direction"]
        assert "slug" in lesson["direction"]
        assert "name" in lesson["teacher"]
        assert "slug" in lesson["teacher"]

    async def test_get_lessons_filter_by_date(
        self,
        client: AsyncClient,
        test_lesson: Lesson,
        test_lesson_tomorrow: Lesson,
    ):
        """Фильтрация занятий по конкретной дате."""
        tomorrow_str = (date.today() + timedelta(days=1)).isoformat()

        response = await client.get(f"/api/lessons?date={tomorrow_str}")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

        # Все занятия должны быть на указанную дату
        for lesson in data:
            assert lesson["date"] == tomorrow_str

    async def test_get_lessons_filter_by_direction(
        self,
        client: AsyncClient,
        test_lesson: Lesson,
        test_lesson_direction2: Lesson,
        test_direction: Direction,
    ):
        """Фильтрация занятий по направлению (direction_id)."""
        response = await client.get(
            f"/api/lessons?date={date.today().isoformat()}&direction_id={test_direction.id}"
        )

        assert response.status_code == 200
        data = response.json()

        # Все занятия должны быть по указанному направлению
        for lesson in data:
            assert lesson["direction"]["id"] == test_direction.id

    async def test_get_lessons_filter_by_level(
        self,
        client: AsyncClient,
        test_lesson: Lesson,
        test_lesson_direction2: Lesson,
    ):
        """Фильтрация занятий по уровню сложности."""
        response = await client.get(
            f"/api/lessons?date={date.today().isoformat()}&level=all"
        )

        assert response.status_code == 200
        data = response.json()

        for lesson in data:
            assert lesson["level"] == "all"

    async def test_get_lessons_empty_date(
        self,
        client: AsyncClient,
        test_lesson: Lesson,
    ):
        """Пустой список занятий на дату без расписания."""
        far_future = (date.today() + timedelta(days=365)).isoformat()
        response = await client.get(f"/api/lessons?date={far_future}")

        assert response.status_code == 200
        assert response.json() == []

    async def test_get_lessons_current_spots(
        self,
        client: AsyncClient,
        test_user: User,
        test_lesson: Lesson,
        auth_headers: dict,
    ):
        """Подсчёт занятых мест (current_spots) после записи."""
        # До записи — 0 занятых мест
        response_before = await client.get("/api/lessons")
        lessons_before = response_before.json()
        lesson_data = next(l for l in lessons_before if l["id"] == test_lesson.id)
        assert lesson_data["current_spots"] == 0

        # Записываемся на занятие
        await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
            headers=auth_headers,
        )

        # После записи — 1 занятое место
        response_after = await client.get("/api/lessons")
        lessons_after = response_after.json()
        lesson_data_after = next(l for l in lessons_after if l["id"] == test_lesson.id)
        assert lesson_data_after["current_spots"] == 1

    async def test_get_lessons_is_booked_flag(
        self,
        client: AsyncClient,
        test_user: User,
        test_lesson: Lesson,
        auth_headers: dict,
    ):
        """Флаг is_booked=True для авторизованного пользователя, записанного на занятие."""
        # Записываемся
        await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
            headers=auth_headers,
        )

        # Запрашиваем расписание с авторизацией — is_booked должен быть True
        response = await client.get("/api/lessons", headers=auth_headers)
        data = response.json()
        lesson_data = next(l for l in data if l["id"] == test_lesson.id)
        assert lesson_data["is_booked"] is True


class TestGetLessonDetail:
    """Тесты эндпоинта GET /api/lessons/{lesson_id}"""

    async def test_lesson_detail_success(
        self,
        client: AsyncClient,
        test_lesson: Lesson,
    ):
        """Получение детальной информации о занятии."""
        response = await client.get(f"/api/lessons/{test_lesson.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_lesson.id
        assert data["room"] == "Зал 1"
        assert data["level"] == "all"
        assert data["is_cancelled"] is False

        # В детальном ответе — полная информация о направлении и преподавателе
        assert "description" in data["direction"]
        assert "bio" in data["teacher"]

    async def test_lesson_detail_not_found(self, client: AsyncClient):
        """Занятие не найдено по ID."""
        response = await client.get("/api/lessons/99999")

        assert response.status_code == 404
        assert "Занятие не найдено" in response.json()["detail"]

    async def test_lesson_detail_with_spots(
        self,
        client: AsyncClient,
        test_user: User,
        test_lesson: Lesson,
        auth_headers: dict,
    ):
        """Детали занятия корректно показывают количество свободных мест."""
        # Записываемся
        await client.post(
            "/api/bookings",
            json={"lesson_id": test_lesson.id},
            headers=auth_headers,
        )

        response = await client.get(
            f"/api/lessons/{test_lesson.id}",
            headers=auth_headers,
        )

        data = response.json()
        assert data["current_spots"] == 1
        assert data["max_spots"] == 10
        assert data["is_booked"] is True


class TestGetTodayLessons:
    """Тесты эндпоинта GET /api/lessons/today"""

    async def test_today_lessons(
        self,
        client: AsyncClient,
        test_lesson: Lesson,
    ):
        """Получение занятий на сегодня через отдельный эндпоинт."""
        response = await client.get("/api/lessons/today")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

        today_str = date.today().isoformat()
        for lesson in data:
            assert lesson["date"] == today_str
