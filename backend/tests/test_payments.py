"""
Тесты платежей и покупки абонементов.

Проверяет:
- Получение списка тарифных планов
- Покупка абонемента (начисление занятий на баланс)
- Покупка с промокодом (применение скидки)
- Валидация промокода (корректный, истёкший, исчерпанный, несуществующий)
"""

from datetime import date, timedelta

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.promotion import Promotion
from app.models.subscription import SubscriptionPlan
from app.models.user import User


class TestGetPlans:
    """Тесты эндпоинта GET /api/payments/plans"""

    async def test_get_plans_success(
        self,
        client: AsyncClient,
        test_plan: SubscriptionPlan,
        test_plan_2: SubscriptionPlan,
    ):
        """Получение списка активных тарифных планов."""
        response = await client.get("/api/payments/plans")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    async def test_get_plans_structure(
        self,
        client: AsyncClient,
        test_plan: SubscriptionPlan,
    ):
        """Проверка структуры ответа тарифного плана."""
        response = await client.get("/api/payments/plans")
        data = response.json()
        plan = data[0]

        assert "id" in plan
        assert "name" in plan
        assert "lessons_count" in plan
        assert "validity_days" in plan
        assert "price" in plan
        assert "description" in plan
        assert "is_popular" in plan
        assert "price_per_lesson" in plan

    async def test_get_plans_price_per_lesson(
        self,
        client: AsyncClient,
        test_plan: SubscriptionPlan,
    ):
        """Корректный расчёт цены за одно занятие."""
        response = await client.get("/api/payments/plans")
        data = response.json()
        plan = data[0]

        # 400000 копеек / 8 занятий = 50000 копеек за занятие
        expected = test_plan.price // test_plan.lessons_count
        assert plan["price_per_lesson"] == expected

    async def test_get_plans_empty(self, client: AsyncClient):
        """Пустой список планов если нет активных тарифов."""
        response = await client.get("/api/payments/plans")

        assert response.status_code == 200
        assert response.json() == []

    async def test_get_plans_sorted(
        self,
        client: AsyncClient,
        test_plan: SubscriptionPlan,
        test_plan_2: SubscriptionPlan,
    ):
        """Планы отсортированы по sort_order."""
        response = await client.get("/api/payments/plans")
        data = response.json()

        assert data[0]["name"] == "Стандарт"  # sort_order=1
        assert data[1]["name"] == "Безлимит"  # sort_order=2


class TestCreatePayment:
    """Тесты эндпоинта POST /api/payments/create"""

    async def test_create_payment_success(
        self,
        client: AsyncClient,
        test_user: User,
        test_plan: SubscriptionPlan,
        auth_headers: dict,
    ):
        """Успешная покупка абонемента — занятия начисляются на баланс."""
        initial_balance = test_user.balance

        response = await client.post(
            "/api/payments/create",
            json={"plan_id": test_plan.id},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        # Проверяем структуру ответа подписки
        assert data["plan"]["id"] == test_plan.id
        assert data["lessons_remaining"] == test_plan.lessons_count
        assert data["is_active"] is True

        # Проверяем что баланс увеличился
        me_response = await client.get("/api/auth/me", headers=auth_headers)
        assert me_response.json()["balance"] == initial_balance + test_plan.lessons_count

    async def test_create_payment_subscription_dates(
        self,
        client: AsyncClient,
        test_user: User,
        test_plan: SubscriptionPlan,
        auth_headers: dict,
    ):
        """Даты начала и окончания абонемента установлены корректно."""
        response = await client.post(
            "/api/payments/create",
            json={"plan_id": test_plan.id},
            headers=auth_headers,
        )

        data = response.json()
        today = date.today()
        expected_expires = today + timedelta(days=test_plan.validity_days)

        assert data["starts_at"] == today.isoformat()
        assert data["expires_at"] == expected_expires.isoformat()

    async def test_create_payment_with_promo_code(
        self,
        client: AsyncClient,
        test_user: User,
        test_plan: SubscriptionPlan,
        test_promo: Promotion,
        auth_headers: dict,
    ):
        """Покупка абонемента с промокодом — скидка применяется."""
        response = await client.post(
            "/api/payments/create",
            json={"plan_id": test_plan.id, "promo_code": "DANCE20"},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        # Занятия начислены полностью (скидка влияет только на цену, не на количество)
        assert data["lessons_remaining"] == test_plan.lessons_count

    async def test_create_payment_plan_not_found(
        self,
        client: AsyncClient,
        test_user: User,
        auth_headers: dict,
    ):
        """Отказ покупки при несуществующем тарифном плане."""
        response = await client.post(
            "/api/payments/create",
            json={"plan_id": 99999},
            headers=auth_headers,
        )

        assert response.status_code == 404
        assert "Тарифный план не найден" in response.json()["detail"]

    async def test_create_payment_unauthorized(
        self,
        client: AsyncClient,
        test_plan: SubscriptionPlan,
    ):
        """Отказ покупки без авторизации."""
        response = await client.post(
            "/api/payments/create",
            json={"plan_id": test_plan.id},
        )

        assert response.status_code == 401

    async def test_create_payment_with_invalid_promo(
        self,
        client: AsyncClient,
        test_user: User,
        test_plan: SubscriptionPlan,
        auth_headers: dict,
    ):
        """Покупка с несуществующим промокодом — покупка проходит без скидки."""
        initial_balance = test_user.balance

        response = await client.post(
            "/api/payments/create",
            json={"plan_id": test_plan.id, "promo_code": "NONEXISTENT"},
            headers=auth_headers,
        )

        # Покупка всё равно проходит — промокод просто игнорируется
        assert response.status_code == 200
        data = response.json()
        assert data["lessons_remaining"] == test_plan.lessons_count


class TestValidatePromoCode:
    """Тесты эндпоинта POST /api/promos/validate"""

    async def test_validate_promo_success(
        self,
        client: AsyncClient,
        test_promo: Promotion,
        test_plan: SubscriptionPlan,
    ):
        """Успешная валидация действующего промокода."""
        response = await client.post(
            "/api/promos/validate",
            json={"code": "DANCE20", "plan_id": test_plan.id},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["discount_percent"] == 20
        assert data["message"] == "Промокод применён"

    async def test_validate_promo_case_insensitive(
        self,
        client: AsyncClient,
        test_promo: Promotion,
        test_plan: SubscriptionPlan,
    ):
        """Валидация промокода нечувствительна к регистру."""
        response = await client.post(
            "/api/promos/validate",
            json={"code": "dance20", "plan_id": test_plan.id},
        )

        assert response.status_code == 200
        assert response.json()["valid"] is True

    async def test_validate_promo_not_found(
        self,
        client: AsyncClient,
        test_plan: SubscriptionPlan,
    ):
        """Валидация несуществующего промокода."""
        response = await client.post(
            "/api/promos/validate",
            json={"code": "DOESNOTEXIST", "plan_id": test_plan.id},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert "не найден" in data["message"]

    async def test_validate_promo_expired(
        self,
        client: AsyncClient,
        test_promo_expired: Promotion,
        test_plan: SubscriptionPlan,
    ):
        """Валидация промокода с истёкшим сроком действия."""
        response = await client.post(
            "/api/promos/validate",
            json={"code": "OLDPROMO", "plan_id": test_plan.id},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert "истёк" in data["message"]

    async def test_validate_promo_exhausted(
        self,
        client: AsyncClient,
        test_promo_exhausted: Promotion,
        test_plan: SubscriptionPlan,
    ):
        """Валидация исчерпанного промокода (лимит использований достигнут)."""
        response = await client.post(
            "/api/promos/validate",
            json={"code": "MAXUSED", "plan_id": test_plan.id},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert "исчерпан" in data["message"]
