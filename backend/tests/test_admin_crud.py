"""
Тесты CRUD-эндпоинтов администрирования.

Проверяет:
- CRUD направлений (создание, обновление, деактивация)
- CRUD преподавателей (создание с M2M, обновление, деактивация)
- CRUD спецкурсов
- CRUD акций
- CRUD тарифных планов
- Деактивация просроченных подписок
- Проверка прав доступа (только администратор)
- Валидация данных и граничные случаи
"""

from datetime import date, timedelta

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.direction import Direction
from app.models.promotion import Promotion
from app.models.special_course import SpecialCourse
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.teacher import Teacher
from app.models.user import User


# =====================================================================
# Тесты: Направления (Directions)
# =====================================================================


class TestAdminDirectionsCRUD:
    """Тесты CRUD-эндпоинтов направлений."""

    async def test_create_direction_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
    ):
        """Успешное создание направления администратором."""
        response = await client.post(
            "/api/admin/directions",
            json={
                "name": "Бачата",
                "slug": "bachata",
                "description": "Чувственный латиноамериканский танец.",
                "short_description": "Латиноамериканский танец",
                "color": "#E91E63",
                "icon": "heart",
                "sort_order": 3,
            },
            headers=admin_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["slug"] == "bachata"
        assert "id" in data
        assert data["message"] == "Направление создано"

    async def test_create_direction_duplicate_slug(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_direction: Direction,
    ):
        """Ошибка при создании направления с существующим slug."""
        response = await client.post(
            "/api/admin/directions",
            json={
                "name": "Хип-хоп дубль",
                "slug": "hip-hop",  # уже существует
                "description": "Дублирующее направление.",
                "short_description": "Дубль",
                "color": "#000000",
                "icon": "music",
            },
            headers=admin_headers,
        )

        assert response.status_code == 409
        assert "slug" in response.json()["detail"].lower()

    async def test_create_direction_unauthorized(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Обычный пользователь не может создать направление."""
        response = await client.post(
            "/api/admin/directions",
            json={
                "name": "Бачата",
                "slug": "bachata",
                "description": "Описание",
                "short_description": "Короткое",
                "color": "#E91E63",
                "icon": "heart",
            },
            headers=auth_headers,
        )

        assert response.status_code == 403

    async def test_update_direction_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_direction: Direction,
    ):
        """Успешное обновление направления (partial update)."""
        response = await client.put(
            f"/api/admin/directions/{test_direction.id}",
            json={"name": "Хип-хоп (обновлено)", "color": "#FF0000"},
            headers=admin_headers,
        )

        assert response.status_code == 200
        assert response.json()["message"] == "Направление обновлено"

    async def test_update_direction_not_found(
        self,
        client: AsyncClient,
        admin_headers: dict,
    ):
        """Ошибка при обновлении несуществующего направления."""
        response = await client.put(
            "/api/admin/directions/99999",
            json={"name": "Не существует"},
            headers=admin_headers,
        )

        assert response.status_code == 404

    async def test_update_direction_duplicate_slug(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_direction: Direction,
        test_direction_2: Direction,
    ):
        """Ошибка при обновлении slug на уже занятый."""
        response = await client.put(
            f"/api/admin/directions/{test_direction.id}",
            json={"slug": "contemporary"},  # slug test_direction_2
            headers=admin_headers,
        )

        assert response.status_code == 409

    async def test_delete_direction_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_direction: Direction,
    ):
        """Деактивация направления (мягкое удаление)."""
        response = await client.delete(
            f"/api/admin/directions/{test_direction.id}",
            headers=admin_headers,
        )

        assert response.status_code == 200
        assert response.json()["message"] == "Направление деактивировано"

    async def test_delete_direction_not_found(
        self,
        client: AsyncClient,
        admin_headers: dict,
    ):
        """Ошибка при деактивации несуществующего направления."""
        response = await client.delete(
            "/api/admin/directions/99999",
            headers=admin_headers,
        )

        assert response.status_code == 404


# =====================================================================
# Тесты: Преподаватели (Teachers)
# =====================================================================


class TestAdminTeachersCRUD:
    """Тесты CRUD-эндпоинтов преподавателей."""

    async def test_create_teacher_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_direction: Direction,
    ):
        """Успешное создание преподавателя с привязкой к направлению."""
        response = await client.post(
            "/api/admin/teachers",
            json={
                "name": "Мария Петрова",
                "slug": "maria-petrova",
                "bio": "Преподаватель современных танцев.",
                "experience_years": 5,
                "direction_ids": [test_direction.id],
            },
            headers=admin_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["slug"] == "maria-petrova"
        assert "id" in data

    async def test_create_teacher_without_directions(
        self,
        client: AsyncClient,
        admin_headers: dict,
    ):
        """Создание преподавателя без привязки к направлениям."""
        response = await client.post(
            "/api/admin/teachers",
            json={
                "name": "Иван Сидоров",
                "slug": "ivan-sidorov",
                "bio": "Новый преподаватель.",
                "experience_years": 2,
            },
            headers=admin_headers,
        )

        assert response.status_code == 201

    async def test_create_teacher_duplicate_slug(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_teacher: Teacher,
    ):
        """Ошибка при создании преподавателя с существующим slug."""
        response = await client.post(
            "/api/admin/teachers",
            json={
                "name": "Анна Иванова Дубль",
                "slug": "anna-ivanova",  # уже существует
                "bio": "Дубль.",
            },
            headers=admin_headers,
        )

        assert response.status_code == 409

    async def test_create_teacher_invalid_directions(
        self,
        client: AsyncClient,
        admin_headers: dict,
    ):
        """Ошибка при привязке к несуществующим направлениям."""
        response = await client.post(
            "/api/admin/teachers",
            json={
                "name": "Преподаватель",
                "slug": "teacher-test",
                "bio": "Тест.",
                "direction_ids": [99999],
            },
            headers=admin_headers,
        )

        assert response.status_code == 400
        assert "направлен" in response.json()["detail"].lower()

    async def test_update_teacher_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_teacher: Teacher,
    ):
        """Успешное обновление преподавателя."""
        response = await client.put(
            f"/api/admin/teachers/{test_teacher.id}",
            json={"name": "Анна Обновлённая", "experience_years": 15},
            headers=admin_headers,
        )

        assert response.status_code == 200

    async def test_update_teacher_directions(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_teacher: Teacher,
        test_direction_2: Direction,
    ):
        """Обновление списка направлений преподавателя."""
        response = await client.put(
            f"/api/admin/teachers/{test_teacher.id}",
            json={"direction_ids": [test_direction_2.id]},
            headers=admin_headers,
        )

        assert response.status_code == 200

    async def test_delete_teacher_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_teacher: Teacher,
    ):
        """Деактивация преподавателя."""
        response = await client.delete(
            f"/api/admin/teachers/{test_teacher.id}",
            headers=admin_headers,
        )

        assert response.status_code == 200
        assert response.json()["message"] == "Преподаватель деактивирован"


# =====================================================================
# Тесты: Спецкурсы (Special Courses)
# =====================================================================


class TestAdminCoursesCRUD:
    """Тесты CRUD-эндпоинтов спецкурсов."""

    async def test_create_course_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_direction: Direction,
        test_teacher: Teacher,
    ):
        """Успешное создание спецкурса."""
        response = await client.post(
            "/api/admin/courses",
            json={
                "name": "Интенсив по хип-хопу",
                "description": "4-недельный курс для продвинутых.",
                "direction_id": test_direction.id,
                "teacher_id": test_teacher.id,
                "price": 800000,
                "lessons_count": 8,
                "start_date": (date.today() + timedelta(days=14)).isoformat(),
                "max_participants": 12,
            },
            headers=admin_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Интенсив по хип-хопу"
        assert "id" in data

    async def test_create_course_invalid_date(
        self,
        client: AsyncClient,
        admin_headers: dict,
    ):
        """Ошибка при неверном формате даты старта."""
        response = await client.post(
            "/api/admin/courses",
            json={
                "name": "Курс",
                "description": "Описание",
                "price": 100000,
                "lessons_count": 4,
                "start_date": "не-дата",
                "max_participants": 10,
            },
            headers=admin_headers,
        )

        assert response.status_code == 400
        assert "дат" in response.json()["detail"].lower()

    async def test_update_course_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
        db_session: AsyncSession,
        test_direction: Direction,
        test_teacher: Teacher,
    ):
        """Успешное обновление спецкурса."""
        # Сначала создаём курс
        course = SpecialCourse(
            name="Тестовый курс",
            description="Описание",
            direction_id=test_direction.id,
            teacher_id=test_teacher.id,
            price=500000,
            lessons_count=6,
            start_date=date.today() + timedelta(days=7),
            max_participants=10,
        )
        db_session.add(course)
        await db_session.commit()
        await db_session.refresh(course)

        response = await client.put(
            f"/api/admin/courses/{course.id}",
            json={"name": "Курс обновлён", "price": 600000},
            headers=admin_headers,
        )

        assert response.status_code == 200
        assert response.json()["message"] == "Спецкурс обновлён"

    async def test_delete_course_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
        db_session: AsyncSession,
        test_direction: Direction,
        test_teacher: Teacher,
    ):
        """Деактивация спецкурса."""
        course = SpecialCourse(
            name="Курс для удаления",
            description="Описание",
            direction_id=test_direction.id,
            teacher_id=test_teacher.id,
            price=500000,
            lessons_count=4,
            start_date=date.today(),
            max_participants=8,
        )
        db_session.add(course)
        await db_session.commit()
        await db_session.refresh(course)

        response = await client.delete(
            f"/api/admin/courses/{course.id}",
            headers=admin_headers,
        )

        assert response.status_code == 200
        assert response.json()["message"] == "Спецкурс деактивирован"

    async def test_delete_course_not_found(
        self,
        client: AsyncClient,
        admin_headers: dict,
    ):
        """Ошибка при деактивации несуществующего курса."""
        response = await client.delete(
            "/api/admin/courses/99999",
            headers=admin_headers,
        )

        assert response.status_code == 404


# =====================================================================
# Тесты: Акции (Promotions)
# =====================================================================


class TestAdminPromotionsCRUD:
    """Тесты CRUD-эндпоинтов акций."""

    async def test_create_promotion_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
    ):
        """Успешное создание акции."""
        response = await client.post(
            "/api/admin/promotions",
            json={
                "title": "Весенняя акция",
                "description": "Скидка 30% на все абонементы.",
                "promo_code": "SPRING30",
                "discount_percent": 30,
                "valid_from": date.today().isoformat(),
                "valid_until": (date.today() + timedelta(days=30)).isoformat(),
                "max_uses": 50,
            },
            headers=admin_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Весенняя акция"
        assert "id" in data

    async def test_create_promotion_invalid_dates(
        self,
        client: AsyncClient,
        admin_headers: dict,
    ):
        """Ошибка: дата начала позже даты окончания."""
        response = await client.post(
            "/api/admin/promotions",
            json={
                "title": "Невалидная акция",
                "description": "Описание",
                "valid_from": (date.today() + timedelta(days=30)).isoformat(),
                "valid_until": date.today().isoformat(),
            },
            headers=admin_headers,
        )

        assert response.status_code == 400
        assert "дат" in response.json()["detail"].lower()

    async def test_create_promotion_duplicate_promo_code(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_promo: Promotion,
    ):
        """Ошибка при создании акции с существующим промо-кодом."""
        response = await client.post(
            "/api/admin/promotions",
            json={
                "title": "Новая акция",
                "description": "Описание",
                "promo_code": "DANCE20",  # уже существует
                "discount_percent": 10,
                "valid_from": date.today().isoformat(),
                "valid_until": (date.today() + timedelta(days=30)).isoformat(),
            },
            headers=admin_headers,
        )

        assert response.status_code == 409

    async def test_update_promotion_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_promo: Promotion,
    ):
        """Успешное обновление акции."""
        response = await client.put(
            f"/api/admin/promotions/{test_promo.id}",
            json={"title": "Обновлённая акция", "discount_percent": 25},
            headers=admin_headers,
        )

        assert response.status_code == 200
        assert response.json()["message"] == "Акция обновлена"

    async def test_update_promotion_not_found(
        self,
        client: AsyncClient,
        admin_headers: dict,
    ):
        """Ошибка при обновлении несуществующей акции."""
        response = await client.put(
            "/api/admin/promotions/99999",
            json={"title": "Не существует"},
            headers=admin_headers,
        )

        assert response.status_code == 404

    async def test_delete_promotion_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_promo: Promotion,
    ):
        """Деактивация акции."""
        response = await client.delete(
            f"/api/admin/promotions/{test_promo.id}",
            headers=admin_headers,
        )

        assert response.status_code == 200
        assert response.json()["message"] == "Акция деактивирована"


# =====================================================================
# Тесты: Тарифные планы (Subscription Plans)
# =====================================================================


class TestAdminPlansCRUD:
    """Тесты CRUD-эндпоинтов тарифных планов."""

    async def test_create_plan_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
    ):
        """Успешное создание тарифного плана."""
        response = await client.post(
            "/api/admin/plans",
            json={
                "name": "Пробный",
                "lessons_count": 4,
                "validity_days": 14,
                "price": 200000,
                "description": "4 занятия за 2 недели",
                "is_popular": False,
                "sort_order": 0,
            },
            headers=admin_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Пробный"
        assert "id" in data

    async def test_update_plan_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_plan: SubscriptionPlan,
    ):
        """Успешное обновление тарифного плана."""
        response = await client.put(
            f"/api/admin/plans/{test_plan.id}",
            json={"name": "Стандарт Плюс", "price": 450000, "is_popular": True},
            headers=admin_headers,
        )

        assert response.status_code == 200
        assert response.json()["message"] == "Тарифный план обновлён"

    async def test_update_plan_not_found(
        self,
        client: AsyncClient,
        admin_headers: dict,
    ):
        """Ошибка при обновлении несуществующего плана."""
        response = await client.put(
            "/api/admin/plans/99999",
            json={"name": "Не существует"},
            headers=admin_headers,
        )

        assert response.status_code == 404

    async def test_delete_plan_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
        test_plan: SubscriptionPlan,
    ):
        """Деактивация тарифного плана."""
        response = await client.delete(
            f"/api/admin/plans/{test_plan.id}",
            headers=admin_headers,
        )

        assert response.status_code == 200
        assert response.json()["message"] == "Тарифный план деактивирован"

    async def test_delete_plan_not_found(
        self,
        client: AsyncClient,
        admin_headers: dict,
    ):
        """Ошибка при деактивации несуществующего плана."""
        response = await client.delete(
            "/api/admin/plans/99999",
            headers=admin_headers,
        )

        assert response.status_code == 404


# =====================================================================
# Тесты: Деактивация просроченных подписок
# =====================================================================


class TestDeactivateExpiredSubscriptions:
    """Тесты эндпоинта деактивации просроченных подписок."""

    async def test_deactivate_expired_success(
        self,
        client: AsyncClient,
        admin_headers: dict,
        db_session: AsyncSession,
        test_user: User,
        test_plan: SubscriptionPlan,
    ):
        """Деактивация подписок с истёкшим сроком."""
        # Создаём просроченную подписку
        expired_sub = Subscription(
            user_id=test_user.id,
            plan_id=test_plan.id,
            lessons_remaining=3,
            starts_at=date.today() - timedelta(days=60),
            expires_at=date.today() - timedelta(days=1),
            is_active=True,
        )
        db_session.add(expired_sub)
        await db_session.commit()

        response = await client.post(
            "/api/admin/deactivate-expired",
            headers=admin_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["deactivated_count"] == 1

    async def test_deactivate_expired_no_expired(
        self,
        client: AsyncClient,
        admin_headers: dict,
        db_session: AsyncSession,
        test_user: User,
        test_plan: SubscriptionPlan,
    ):
        """Нет просроченных подписок для деактивации."""
        # Создаём активную, непросроченную подписку
        active_sub = Subscription(
            user_id=test_user.id,
            plan_id=test_plan.id,
            lessons_remaining=5,
            starts_at=date.today() - timedelta(days=10),
            expires_at=date.today() + timedelta(days=20),
            is_active=True,
        )
        db_session.add(active_sub)
        await db_session.commit()

        response = await client.post(
            "/api/admin/deactivate-expired",
            headers=admin_headers,
        )

        assert response.status_code == 200
        assert response.json()["deactivated_count"] == 0

    async def test_deactivate_expired_unauthorized(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Обычный пользователь не может запустить деактивацию."""
        response = await client.post(
            "/api/admin/deactivate-expired",
            headers=auth_headers,
        )

        assert response.status_code == 403


# =====================================================================
# Тесты: Проверка прав доступа (общие)
# =====================================================================


class TestAdminAccessControl:
    """Тесты проверки прав доступа к admin-эндпоинтам."""

    async def test_no_auth_returns_401(self, client: AsyncClient):
        """Запрос без авторизации возвращает 401."""
        response = await client.post(
            "/api/admin/directions",
            json={
                "name": "Test",
                "slug": "test",
                "description": "Test",
                "short_description": "Test",
                "color": "#000",
                "icon": "x",
            },
        )
        # Без токена — 401 или 403
        assert response.status_code in (401, 403)

    async def test_regular_user_returns_403(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Обычный пользователь получает 403 при попытке доступа к admin-эндпоинтам."""
        endpoints = [
            ("POST", "/api/admin/directions"),
            ("POST", "/api/admin/teachers"),
            ("POST", "/api/admin/courses"),
            ("POST", "/api/admin/promotions"),
            ("POST", "/api/admin/plans"),
        ]

        for method, url in endpoints:
            if method == "POST":
                response = await client.post(
                    url,
                    json={"name": "test"},
                    headers=auth_headers,
                )
            assert response.status_code == 403, f"Ожидалось 403 для {method} {url}"
