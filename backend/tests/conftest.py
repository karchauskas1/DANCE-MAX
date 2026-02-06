"""
Конфигурация тестов DanceMax API.

Настраивает:
- Асинхронный SQLite in-memory для изоляции тестов
- httpx.AsyncClient с ASGITransport для тестирования FastAPI
- Фикстуры для создания тестовых пользователей, направлений, преподавателей,
  занятий и тарифных планов
"""

from datetime import date, time, timedelta

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.security import create_access_token
from app.database import Base, get_db
from app.main import app
from app.models.direction import Direction
from app.models.lesson import Lesson
from app.models.promotion import Promotion
from app.models.subscription import SubscriptionPlan
from app.models.teacher import Teacher
from app.models.user import User

# Асинхронный движок SQLite in-memory для тестов
# connect_args={"check_same_thread": False} необходим для SQLite + async
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine_test = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

async_session_test = async_sessionmaker(
    engine_test,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def override_get_db():
    """Переопределение зависимости get_db для тестов — использует тестовую БД."""
    async with async_session_test() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Переопределяем зависимость get_db на тестовую
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
async def setup_database():
    """
    Создание и очистка таблиц перед каждым тестом.
    autouse=True — выполняется автоматически для каждого теста.
    """
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session() -> AsyncSession:
    """Тестовая сессия БД для прямого взаимодействия с данными в тестах."""
    async with async_session_test() as session:
        yield session


@pytest.fixture
async def client() -> AsyncClient:
    """HTTP-клиент для тестирования FastAPI через ASGI."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """
    Создание тестового пользователя с балансом 5 занятий.
    Используется для тестов, требующих авторизации обычного пользователя.
    """
    user = User(
        telegram_id=123456789,
        first_name="Тест",
        last_name="Пользователь",
        username="testuser",
        balance=5,
        is_admin=False,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_admin(db_session: AsyncSession) -> User:
    """
    Создание тестового администратора.
    Используется для тестов, требующих прав администратора.
    """
    admin = User(
        telegram_id=987654321,
        first_name="Админ",
        last_name="Тестовый",
        username="testadmin",
        balance=10,
        is_admin=True,
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest.fixture
def auth_headers(test_user: User) -> dict[str, str]:
    """
    HTTP-заголовки авторизации с JWT-токеном тестового пользователя.
    Используется для отправки авторизованных запросов.
    """
    token = create_access_token(data={"sub": str(test_user.telegram_id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(test_admin: User) -> dict[str, str]:
    """
    HTTP-заголовки авторизации с JWT-токеном тестового администратора.
    """
    token = create_access_token(data={"sub": str(test_admin.telegram_id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def test_direction(db_session: AsyncSession) -> Direction:
    """Создание тестового танцевального направления."""
    direction = Direction(
        name="Хип-хоп",
        slug="hip-hop",
        description="Энергичный уличный танец с акцентом на ритм и импровизацию.",
        short_description="Уличный танец",
        color="#FF5722",
        icon="music",
        is_active=True,
        sort_order=1,
    )
    db_session.add(direction)
    await db_session.commit()
    await db_session.refresh(direction)
    return direction


@pytest.fixture
async def test_direction_2(db_session: AsyncSession) -> Direction:
    """Создание второго тестового направления для фильтрации."""
    direction = Direction(
        name="Contemporary",
        slug="contemporary",
        description="Современный танец, сочетающий элементы классики и модерна.",
        short_description="Современный танец",
        color="#2196F3",
        icon="wind",
        is_active=True,
        sort_order=2,
    )
    db_session.add(direction)
    await db_session.commit()
    await db_session.refresh(direction)
    return direction


@pytest.fixture
async def test_teacher(db_session: AsyncSession, test_direction: Direction) -> Teacher:
    """Создание тестового преподавателя, привязанного к направлению."""
    teacher = Teacher(
        name="Анна Иванова",
        slug="anna-ivanova",
        bio="Преподаватель хип-хопа с 10-летним стажем.",
        photo_url="https://example.com/anna.jpg",
        experience_years=10,
        is_active=True,
    )
    teacher.directions.append(test_direction)
    db_session.add(teacher)
    await db_session.commit()
    await db_session.refresh(teacher)
    return teacher


@pytest.fixture
async def test_lesson(
    db_session: AsyncSession,
    test_direction: Direction,
    test_teacher: Teacher,
) -> Lesson:
    """
    Создание тестового занятия на сегодня.
    Максимум 10 мест, уровень all.
    """
    lesson = Lesson(
        direction_id=test_direction.id,
        teacher_id=test_teacher.id,
        date=date.today(),
        start_time=time(18, 0),
        end_time=time(19, 30),
        room="Зал 1",
        max_spots=10,
        level="all",
        is_cancelled=False,
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    return lesson


@pytest.fixture
async def test_lesson_full(
    db_session: AsyncSession,
    test_direction: Direction,
    test_teacher: Teacher,
) -> Lesson:
    """
    Создание тестового занятия с 1 местом (для теста переполнения).
    """
    lesson = Lesson(
        direction_id=test_direction.id,
        teacher_id=test_teacher.id,
        date=date.today(),
        start_time=time(20, 0),
        end_time=time(21, 30),
        room="Зал 2",
        max_spots=1,
        level="beginner",
        is_cancelled=False,
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    return lesson


@pytest.fixture
async def test_lesson_tomorrow(
    db_session: AsyncSession,
    test_direction: Direction,
    test_teacher: Teacher,
) -> Lesson:
    """Создание тестового занятия на завтра (для фильтрации по дате)."""
    tomorrow = date.today() + timedelta(days=1)
    lesson = Lesson(
        direction_id=test_direction.id,
        teacher_id=test_teacher.id,
        date=tomorrow,
        start_time=time(10, 0),
        end_time=time(11, 30),
        room="Зал 1",
        max_spots=15,
        level="intermediate",
        is_cancelled=False,
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    return lesson


@pytest.fixture
async def test_lesson_direction2(
    db_session: AsyncSession,
    test_direction_2: Direction,
    test_teacher: Teacher,
) -> Lesson:
    """Создание тестового занятия по второму направлению (для фильтрации)."""
    lesson = Lesson(
        direction_id=test_direction_2.id,
        teacher_id=test_teacher.id,
        date=date.today(),
        start_time=time(12, 0),
        end_time=time(13, 30),
        room="Зал 3",
        max_spots=8,
        level="advanced",
        is_cancelled=False,
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    return lesson


@pytest.fixture
async def test_plan(db_session: AsyncSession) -> SubscriptionPlan:
    """Создание тестового тарифного плана абонемента."""
    plan = SubscriptionPlan(
        name="Стандарт",
        lessons_count=8,
        validity_days=30,
        price=400000,  # 4000 руб. в копейках
        description="8 занятий за 30 дней",
        is_popular=True,
        is_active=True,
        sort_order=1,
    )
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)
    return plan


@pytest.fixture
async def test_plan_2(db_session: AsyncSession) -> SubscriptionPlan:
    """Создание второго тестового тарифного плана."""
    plan = SubscriptionPlan(
        name="Безлимит",
        lessons_count=30,
        validity_days=30,
        price=900000,  # 9000 руб. в копейках
        description="Безлимитный абонемент на 30 дней",
        is_popular=False,
        is_active=True,
        sort_order=2,
    )
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)
    return plan


@pytest.fixture
async def test_promo(db_session: AsyncSession) -> Promotion:
    """Создание тестового промокода со скидкой 20%."""
    promo = Promotion(
        title="Скидка 20% на первый абонемент",
        description="Введите промокод DANCE20 при покупке абонемента.",
        promo_code="DANCE20",
        discount_percent=20,
        discount_amount=None,
        valid_from=date.today() - timedelta(days=7),
        valid_until=date.today() + timedelta(days=30),
        max_uses=100,
        current_uses=0,
        is_active=True,
    )
    db_session.add(promo)
    await db_session.commit()
    await db_session.refresh(promo)
    return promo


@pytest.fixture
async def test_promo_expired(db_session: AsyncSession) -> Promotion:
    """Создание истёкшего промокода (для теста невалидного промокода)."""
    promo = Promotion(
        title="Старая акция",
        description="Эта акция уже закончилась.",
        promo_code="OLDPROMO",
        discount_percent=10,
        valid_from=date.today() - timedelta(days=60),
        valid_until=date.today() - timedelta(days=1),
        max_uses=50,
        current_uses=0,
        is_active=True,
    )
    db_session.add(promo)
    await db_session.commit()
    await db_session.refresh(promo)
    return promo


@pytest.fixture
async def test_promo_exhausted(db_session: AsyncSession) -> Promotion:
    """Создание исчерпанного промокода (лимит использований достигнут)."""
    promo = Promotion(
        title="Популярная акция",
        description="Промокод полностью использован.",
        promo_code="MAXUSED",
        discount_percent=15,
        valid_from=date.today() - timedelta(days=7),
        valid_until=date.today() + timedelta(days=30),
        max_uses=10,
        current_uses=10,
        is_active=True,
    )
    db_session.add(promo)
    await db_session.commit()
    await db_session.refresh(promo)
    return promo
