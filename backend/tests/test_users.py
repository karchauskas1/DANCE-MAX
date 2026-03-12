"""
Тесты для пользовательских эндпоинтов.

Проверяет:
- Валидацию схемы SetRealNameRequest (три отдельных поля ФИО)
- PUT /api/users/real-name: сохранение трёх полей, идемпотентность, авторизацию
"""

import pytest
from httpx import AsyncClient
from pydantic import ValidationError

from app.models.user import User
from app.schemas.user import SetRealNameRequest


class TestSetRealNameRequest:
    """Тесты валидации схемы SetRealNameRequest."""

    def test_valid_request(self):
        """Корректный запрос с кириллическими именами."""
        req = SetRealNameRequest(
            real_last_name="Иванов",
            real_first_name="Иван",
            real_patronymic="Иванович",
        )
        assert req.real_last_name == "Иванов"
        assert req.real_first_name == "Иван"
        assert req.real_patronymic == "Иванович"

    def test_strips_whitespace(self):
        """Пробелы по краям обрезаются."""
        req = SetRealNameRequest(
            real_last_name="  Иванов  ",
            real_first_name="  Иван  ",
            real_patronymic="  Иванович  ",
        )
        assert req.real_last_name == "Иванов"
        assert req.real_first_name == "Иван"
        assert req.real_patronymic == "Иванович"

    def test_too_short(self):
        """Поле с 1 символом — ошибка валидации."""
        with pytest.raises(ValidationError):
            SetRealNameRequest(
                real_last_name="И",
                real_first_name="Иван",
                real_patronymic="Иванович",
            )

    def test_digits_rejected(self):
        """Цифры в имени — ошибка валидации."""
        with pytest.raises(ValidationError):
            SetRealNameRequest(
                real_last_name="Иванов1",
                real_first_name="Иван",
                real_patronymic="Иванович",
            )

    def test_missing_field(self):
        """Отсутствие обязательного поля — ошибка валидации."""
        with pytest.raises(ValidationError):
            SetRealNameRequest(
                real_last_name="Иванов",
                real_first_name="Иван",
                # real_patronymic отсутствует
            )

    def test_hyphenated_name(self):
        """Двойное имя через дефис — допустимо."""
        req = SetRealNameRequest(
            real_last_name="Иванова-Петрова",
            real_first_name="Анна",
            real_patronymic="Сергеевна",
        )
        assert req.real_last_name == "Иванова-Петрова"

    def test_latin_name(self):
        """Латинские буквы — допустимы (иностранные имена)."""
        req = SetRealNameRequest(
            real_last_name="Smith",
            real_first_name="John",
            real_patronymic="Jr",
        )
        assert req.real_last_name == "Smith"


class TestSetRealNameRoute:
    """Тесты PUT /api/users/real-name"""

    async def test_set_real_name_success(
        self, client: AsyncClient, test_user: User, auth_headers: dict
    ):
        """Успешная установка ФИО — три поля сохраняются + real_name составляется."""
        response = await client.put(
            "/api/users/real-name",
            json={
                "real_last_name": "Иванов",
                "real_first_name": "Иван",
                "real_patronymic": "Иванович",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["real_last_name"] == "Иванов"
        assert data["real_first_name"] == "Иван"
        assert data["real_patronymic"] == "Иванович"
        assert data["real_name"] == "Иванов Иван Иванович"

    async def test_set_real_name_idempotency(
        self, client: AsyncClient, test_user: User, auth_headers: dict
    ):
        """Повторная попытка установить ФИО возвращает 409."""
        await client.put(
            "/api/users/real-name",
            json={
                "real_last_name": "Иванов",
                "real_first_name": "Иван",
                "real_patronymic": "Иванович",
            },
            headers=auth_headers,
        )
        response = await client.put(
            "/api/users/real-name",
            json={
                "real_last_name": "Другой",
                "real_first_name": "Человек",
                "real_patronymic": "Отчество",
            },
            headers=auth_headers,
        )
        assert response.status_code == 409

    async def test_set_real_name_invalid(
        self, client: AsyncClient, test_user: User, auth_headers: dict
    ):
        """Запрос с цифрами в имени возвращает 422."""
        response = await client.put(
            "/api/users/real-name",
            json={
                "real_last_name": "Иванов123",
                "real_first_name": "Иван",
                "real_patronymic": "Иванович",
            },
            headers=auth_headers,
        )
        assert response.status_code == 422

    async def test_set_real_name_strips_whitespace(
        self, client: AsyncClient, test_user: User, auth_headers: dict
    ):
        """Пробелы по краям обрезаются до сохранения."""
        response = await client.put(
            "/api/users/real-name",
            json={
                "real_last_name": "  Иванов  ",
                "real_first_name": "  Иван  ",
                "real_patronymic": "  Иванович  ",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["real_last_name"] == "Иванов"
        assert data["real_name"] == "Иванов Иван Иванович"

    async def test_set_real_name_unauthorized(self, client: AsyncClient):
        """Без токена — 401."""
        response = await client.put(
            "/api/users/real-name",
            json={
                "real_last_name": "Иванов",
                "real_first_name": "Иван",
                "real_patronymic": "Иванович",
            },
        )
        assert response.status_code == 401
