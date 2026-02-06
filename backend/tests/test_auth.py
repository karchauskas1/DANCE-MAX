"""
Тесты авторизации через Telegram Web App.

Проверяет:
- Авторизацию через initData (с мокированием валидации Telegram)
- Получение данных текущего пользователя /api/auth/me
- Отказ при невалидном токене
"""

from unittest.mock import patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class TestTelegramAuth:
    """Тесты эндпоинта POST /api/auth/telegram"""

    async def test_auth_success_new_user(self, client: AsyncClient):
        """Успешная авторизация нового пользователя — создание аккаунта и выдача JWT."""
        # Мокируем validate_init_data, чтобы вернуть данные тестового пользователя
        mock_user_data = {
            "id": 111222333,
            "first_name": "Новый",
            "last_name": "Пользователь",
            "username": "newuser",
            "photo_url": "https://example.com/photo.jpg",
        }

        with patch(
            "app.api.routes.auth.validate_init_data",
            return_value=mock_user_data,
        ):
            response = await client.post(
                "/api/auth/telegram",
                json={"init_data": "mock_init_data_string"},
            )

        assert response.status_code == 200
        data = response.json()

        # Проверяем структуру ответа
        assert "token" in data
        assert "user" in data
        assert data["user"]["telegram_id"] == 111222333
        assert data["user"]["first_name"] == "Новый"
        assert data["user"]["last_name"] == "Пользователь"
        assert data["user"]["username"] == "newuser"
        assert data["user"]["balance"] == 0  # Новый пользователь — баланс 0

    async def test_auth_success_existing_user(
        self, client: AsyncClient, test_user: User
    ):
        """Повторная авторизация существующего пользователя — обновление профиля."""
        mock_user_data = {
            "id": test_user.telegram_id,
            "first_name": "Обновлённый",
            "last_name": "Профиль",
            "username": "updateduser",
        }

        with patch(
            "app.api.routes.auth.validate_init_data",
            return_value=mock_user_data,
        ):
            response = await client.post(
                "/api/auth/telegram",
                json={"init_data": "mock_init_data_existing"},
            )

        assert response.status_code == 200
        data = response.json()

        # Данные пользователя обновлены из Telegram
        assert data["user"]["first_name"] == "Обновлённый"
        assert data["user"]["last_name"] == "Профиль"
        assert data["user"]["username"] == "updateduser"
        # Баланс сохраняется при повторной авторизации
        assert data["user"]["balance"] == test_user.balance

    async def test_auth_invalid_init_data(self, client: AsyncClient):
        """Отказ авторизации при невалидных данных initData от Telegram."""
        with patch(
            "app.api.routes.auth.validate_init_data",
            return_value=None,  # Невалидные данные
        ):
            response = await client.post(
                "/api/auth/telegram",
                json={"init_data": "invalid_data"},
            )

        assert response.status_code == 401
        assert "Невалидные данные авторизации" in response.json()["detail"]

    async def test_auth_missing_init_data(self, client: AsyncClient):
        """Отказ при отсутствии поля init_data в запросе."""
        response = await client.post("/api/auth/telegram", json={})

        # Pydantic вернёт 422 (Validation Error)
        assert response.status_code == 422


class TestAuthMe:
    """Тесты эндпоинта GET /api/auth/me"""

    async def test_me_success(
        self, client: AsyncClient, test_user: User, auth_headers: dict
    ):
        """Получение данных текущего авторизованного пользователя."""
        response = await client.get("/api/auth/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["telegram_id"] == test_user.telegram_id
        assert data["first_name"] == test_user.first_name
        assert data["balance"] == test_user.balance

    async def test_me_unauthorized(self, client: AsyncClient):
        """Отказ при запросе без токена авторизации."""
        response = await client.get("/api/auth/me")
        assert response.status_code == 401

    async def test_me_invalid_token(self, client: AsyncClient):
        """Отказ при запросе с невалидным JWT-токеном."""
        headers = {"Authorization": "Bearer invalid_token_here"}
        response = await client.get("/api/auth/me", headers=headers)
        assert response.status_code == 401
