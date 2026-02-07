"""
Роутер администрирования.

Эндпоинты для админ-панели (требуют права администратора):
- Дашборд со статистикой
- CRUD занятий
- CRUD направлений, преподавателей, спецкурсов, акций, тарифов
- Управление учениками
- Отметка посещений
- Деактивация просроченных подписок
- Рассылка (заглушка)
"""

from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_admin

# Rate limiter для admin write-эндпоинтов (30 запросов/минуту)
limiter = Limiter(key_func=get_remote_address)
from app.database import get_db
from app.models.booking import Booking
from app.models.direction import Direction
from app.models.lesson import Lesson
from app.models.promotion import Promotion
from app.models.special_course import SpecialCourse
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.teacher import Teacher, teacher_direction
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.user import UserResponse
from app.services.subscription_deactivation import deactivate_expired_subscriptions
from app.services.notification import notify_lesson_cancelled

router = APIRouter(prefix="/admin", tags=["admin"])


# ---------- Схемы запросов для админки ----------

class DashboardResponse(BaseModel):
    """Статистика для дашборда админки."""
    bookings_today: int
    active_students: int
    revenue_week: int  # выручка за неделю в копейках (количество купленных занятий)
    total_lessons_today: int
    cancelled_lessons_today: int


class LessonCreateRequest(BaseModel):
    """Запрос на создание занятия."""
    direction_id: int
    teacher_id: int
    date: str  # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    room: str = "Зал 1"
    max_spots: int = 15
    level: str = "all"


class LessonUpdateRequest(BaseModel):
    """Запрос на обновление занятия (все поля опциональны)."""
    direction_id: int | None = None
    teacher_id: int | None = None
    date: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    room: str | None = None
    max_spots: int | None = None
    level: str | None = None


class LessonCancelRequest(BaseModel):
    """Запрос на отмену занятия."""
    reason: str = "Занятие отменено администратором"


class BalanceAdjustRequest(BaseModel):
    """Запрос на ручную корректировку баланса ученика."""
    amount: int  # положительное — начисление, отрицательное — списание
    reason: str


class BroadcastRequest(BaseModel):
    """Запрос на рассылку сообщения.

    Параметры target:
    - all: все пользователи
    - active_subs: пользователи с балансом > 0
    - by_direction: пользователи с записями на указанное направление (требуется direction_id)
    """
    message: str
    target: str = "all"  # all / active_subs / by_direction
    direction_id: int | None = None  # обязателен при target="by_direction"


class BroadcastResponse(BaseModel):
    """Результат рассылки."""
    status: str
    target: str
    total_users: int
    sent: int
    failed: int
    message_preview: str


class StudentDetailResponse(BaseModel):
    """Детальная информация об ученике для админки."""
    id: int
    telegram_id: int
    first_name: str
    last_name: str | None
    username: str | None
    phone: str | None
    balance: int
    is_admin: bool
    created_at: datetime
    total_bookings: int
    attended_bookings: int

    model_config = {"from_attributes": True}


# ---------- Схемы: Направления ----------

class DirectionCreateRequest(BaseModel):
    """Запрос на создание направления."""
    name: str
    slug: str
    description: str = ""
    short_description: str = ""
    image_url: str | None = None
    color: str = "#FF5722"
    icon: str = "music"
    is_active: bool = True
    sort_order: int = 0


class DirectionUpdateRequest(BaseModel):
    """Запрос на обновление направления (все поля опциональны)."""
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    short_description: str | None = None
    image_url: str | None = None
    color: str | None = None
    icon: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


# ---------- Схемы: Преподаватели ----------

class TeacherCreateRequest(BaseModel):
    """Запрос на создание преподавателя."""
    name: str
    slug: str | None = None
    bio: str = ""
    photo_url: str | None = None
    experience_years: int = 0
    is_active: bool = True
    direction_ids: list[int] = []


class TeacherUpdateRequest(BaseModel):
    """Запрос на обновление преподавателя (все поля опциональны)."""
    name: str | None = None
    slug: str | None = None
    bio: str | None = None
    photo_url: str | None = None
    experience_years: int | None = None
    is_active: bool | None = None
    direction_ids: list[int] | None = None


# ---------- Схемы: Спецкурсы ----------

class SpecialCourseCreateRequest(BaseModel):
    """Запрос на создание специального курса."""
    name: str
    description: str
    direction_id: int | None = None
    teacher_id: int | None = None
    price: int
    lessons_count: int
    start_date: str  # YYYY-MM-DD
    image_url: str | None = None
    max_participants: int
    is_active: bool = True


class SpecialCourseUpdateRequest(BaseModel):
    """Запрос на обновление специального курса (все поля опциональны)."""
    name: str | None = None
    description: str | None = None
    direction_id: int | None = None
    teacher_id: int | None = None
    price: int | None = None
    lessons_count: int | None = None
    start_date: str | None = None  # YYYY-MM-DD
    image_url: str | None = None
    max_participants: int | None = None
    is_active: bool | None = None


# ---------- Схемы: Акции ----------

class PromotionCreateRequest(BaseModel):
    """Запрос на создание акции."""
    title: str
    description: str
    image_url: str | None = None
    promo_code: str | None = None
    discount_percent: int | None = None
    discount_amount: int | None = None
    valid_from: str  # YYYY-MM-DD
    valid_until: str  # YYYY-MM-DD
    max_uses: int | None = None
    is_active: bool = True


class PromotionUpdateRequest(BaseModel):
    """Запрос на обновление акции (все поля опциональны)."""
    title: str | None = None
    description: str | None = None
    image_url: str | None = None
    promo_code: str | None = None
    discount_percent: int | None = None
    discount_amount: int | None = None
    valid_from: str | None = None  # YYYY-MM-DD
    valid_until: str | None = None  # YYYY-MM-DD
    max_uses: int | None = None
    is_active: bool | None = None


# ---------- Схемы: Тарифные планы ----------

class SubscriptionPlanCreateRequest(BaseModel):
    """Запрос на создание тарифного плана."""
    name: str
    lessons_count: int
    validity_days: int
    price: int
    description: str | None = None
    is_popular: bool = False
    is_active: bool = True
    sort_order: int = 0


class SubscriptionPlanUpdateRequest(BaseModel):
    """Запрос на обновление тарифного плана (все поля опциональны)."""
    name: str | None = None
    lessons_count: int | None = None
    validity_days: int | None = None
    price: int | None = None
    description: str | None = None
    is_popular: bool | None = None
    is_active: bool | None = None
    sort_order: int | None = None


# ---------- Эндпоинты ----------

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> DashboardResponse:
    """
    Получить статистику для дашборда админки.
    - Количество записей на сегодня
    - Количество активных учеников (с балансом > 0)
    - Выручка за неделю (количество купленных занятий)
    - Общее количество занятий сегодня и отменённых
    """
    today = date.today()
    week_ago = today - timedelta(days=7)

    # Записи на сегодня (active bookings для сегодняшних занятий)
    bookings_today_result = await db.execute(
        select(func.count(Booking.id))
        .join(Lesson, Booking.lesson_id == Lesson.id)
        .where(
            Lesson.date == today,
            Booking.status == "active",
        )
    )
    bookings_today = bookings_today_result.scalar() or 0

    # Активные ученики (с балансом > 0)
    active_students_result = await db.execute(
        select(func.count(User.id)).where(
            User.balance > 0,
            User.is_admin == False,  # noqa: E712
        )
    )
    active_students = active_students_result.scalar() or 0

    # Выручка за неделю: сумма amount по транзакциям типа purchase за последние 7 дней
    revenue_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.type == "purchase",
            Transaction.created_at >= datetime.combine(week_ago, time.min).replace(tzinfo=timezone.utc),
        )
    )
    revenue_week = revenue_result.scalar() or 0

    # Занятия сегодня
    lessons_today_result = await db.execute(
        select(func.count(Lesson.id)).where(Lesson.date == today)
    )
    total_lessons_today = lessons_today_result.scalar() or 0

    # Отменённые занятия сегодня
    cancelled_today_result = await db.execute(
        select(func.count(Lesson.id)).where(
            Lesson.date == today,
            Lesson.is_cancelled == True,  # noqa: E712
        )
    )
    cancelled_lessons_today = cancelled_today_result.scalar() or 0

    return DashboardResponse(
        bookings_today=bookings_today,
        active_students=active_students,
        revenue_week=revenue_week,
        total_lessons_today=total_lessons_today,
        cancelled_lessons_today=cancelled_lessons_today,
    )


@router.post("/lessons", status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def create_lesson(
    request: Request,
    body: LessonCreateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Создать новое занятие в расписании.
    Администратор указывает направление, преподавателя, дату, время, зал и вместимость.
    """
    # Парсим дату и время из строк
    try:
        lesson_date = date.fromisoformat(body.date)
        start = time.fromisoformat(body.start_time)
        end = time.fromisoformat(body.end_time)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный формат даты или времени. Ожидается: дата YYYY-MM-DD, время HH:MM",
        )

    lesson = Lesson(
        direction_id=body.direction_id,
        teacher_id=body.teacher_id,
        date=lesson_date,
        start_time=start,
        end_time=end,
        room=body.room,
        max_spots=body.max_spots,
        level=body.level,
    )
    db.add(lesson)
    await db.flush()

    return {
        "id": lesson.id,
        "message": "Занятие создано",
        "date": lesson.date.isoformat(),
        "start_time": lesson.start_time.strftime("%H:%M"),
        "end_time": lesson.end_time.strftime("%H:%M"),
    }


@router.put("/lessons/{lesson_id}")
@limiter.limit("30/minute")
async def update_lesson(
    request: Request,
    lesson_id: int,
    body: LessonUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Обновить данные занятия.
    Обновляются только переданные поля (partial update).
    """
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()

    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Занятие не найдено",
        )

    # Обновляем только переданные поля
    if body.direction_id is not None:
        lesson.direction_id = body.direction_id
    if body.teacher_id is not None:
        lesson.teacher_id = body.teacher_id
    if body.date is not None:
        try:
            lesson.date = date.fromisoformat(body.date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Неверный формат даты")
    if body.start_time is not None:
        try:
            lesson.start_time = time.fromisoformat(body.start_time)
        except ValueError:
            raise HTTPException(status_code=400, detail="Неверный формат времени начала")
    if body.end_time is not None:
        try:
            lesson.end_time = time.fromisoformat(body.end_time)
        except ValueError:
            raise HTTPException(status_code=400, detail="Неверный формат времени окончания")
    if body.room is not None:
        lesson.room = body.room
    if body.max_spots is not None:
        lesson.max_spots = body.max_spots
    if body.level is not None:
        lesson.level = body.level

    await db.flush()

    return {"id": lesson.id, "message": "Занятие обновлено"}


@router.delete("/lessons/{lesson_id}")
@limiter.limit("30/minute")
async def cancel_lesson(
    request: Request,
    lesson_id: int,
    body: LessonCancelRequest | None = None,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Отменить занятие.
    При отмене все активные бронирования отменяются,
    а занятия возвращаются на баланс учеников.
    """
    result = await db.execute(
        select(Lesson)
        .where(Lesson.id == lesson_id)
        .options(selectinload(Lesson.bookings))
    )
    lesson = result.scalar_one_or_none()

    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Занятие не найдено",
        )

    if lesson.is_cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Занятие уже отменено",
        )

    # Отменяем занятие
    reason = body.reason if body else "Занятие отменено администратором"
    lesson.is_cancelled = True
    lesson.cancel_reason = reason

    # Отменяем все активные бронирования и возвращаем занятия на баланс
    refunded_count = 0
    for booking in lesson.bookings:
        if booking.status == "active":
            booking.status = "cancelled"
            booking.cancelled_at = datetime.now(timezone.utc)

            # Возвращаем занятие на баланс пользователя
            user_result = await db.execute(
                select(User).where(User.id == booking.user_id)
            )
            booked_user = user_result.scalar_one_or_none()
            if booked_user:
                booked_user.balance += 1

                # Создаём транзакцию возврата
                transaction = Transaction(
                    user_id=booked_user.id,
                    type="refund",
                    amount=1,
                    description=f"Возврат за отменённое занятие: {reason}",
                    booking_id=booking.id,
                )
                db.add(transaction)
                refunded_count += 1

    await db.flush()

    # Уведомляем пользователей об отмене занятия через Telegram-бота
    lesson_info = f"{lesson.date.isoformat()} {lesson.start_time.strftime('%H:%M')}"
    for booking in lesson.bookings:
        if booking.status == "cancelled":
            user_result = await db.execute(
                select(User).where(User.id == booking.user_id)
            )
            booked_user = user_result.scalar_one_or_none()
            if booked_user:
                await notify_lesson_cancelled(
                    user_telegram_id=booked_user.telegram_id,
                    lesson_info=lesson_info,
                    reason=reason,
                )

    return {
        "id": lesson.id,
        "message": "Занятие отменено",
        "refunded_bookings": refunded_count,
    }


@router.get("/students", response_model=list[UserResponse])
async def get_students(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
    search: str | None = Query(None, description="Поиск по имени, фамилии или username"),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> list[UserResponse]:
    """
    Получить список учеников с поиском и пагинацией.
    Поиск работает по имени, фамилии и username (регистронезависимый).
    """
    query = select(User).where(User.is_admin == False)  # noqa: E712

    # Фильтр поиска
    if search:
        search_pattern = f"%{search.lower()}%"
        query = query.where(
            (func.lower(User.first_name).like(search_pattern))
            | (func.lower(User.last_name).like(search_pattern))
            | (func.lower(User.username).like(search_pattern))
        )

    query = query.order_by(User.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]


@router.get("/students/{student_id}", response_model=StudentDetailResponse)
async def get_student_detail(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> StudentDetailResponse:
    """
    Получить детальную информацию об ученике.
    Включает статистику по бронированиям и посещениям.
    """
    result = await db.execute(select(User).where(User.id == student_id))
    student = result.scalar_one_or_none()

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ученик не найден",
        )

    # Считаем общее количество бронирований
    total_result = await db.execute(
        select(func.count(Booking.id)).where(Booking.user_id == student_id)
    )
    total_bookings = total_result.scalar() or 0

    # Считаем количество посещений (статус attended)
    attended_result = await db.execute(
        select(func.count(Booking.id)).where(
            Booking.user_id == student_id,
            Booking.status == "attended",
        )
    )
    attended_bookings = attended_result.scalar() or 0

    return StudentDetailResponse(
        id=student.id,
        telegram_id=student.telegram_id,
        first_name=student.first_name,
        last_name=student.last_name,
        username=student.username,
        phone=student.phone,
        balance=student.balance,
        is_admin=student.is_admin,
        created_at=student.created_at,
        total_bookings=total_bookings,
        attended_bookings=attended_bookings,
    )


@router.post("/students/{student_id}/balance")
@limiter.limit("30/minute")
async def adjust_balance(
    request: Request,
    student_id: int,
    body: BalanceAdjustRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> dict:
    """
    Ручная корректировка баланса ученика администратором.
    Положительное amount — начисление, отрицательное — списание.
    """
    result = await db.execute(select(User).where(User.id == student_id))
    student = result.scalar_one_or_none()

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ученик не найден",
        )

    # Корректируем баланс
    student.balance += body.amount

    # Не допускаем отрицательный баланс
    if student.balance < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Баланс не может быть отрицательным",
        )

    # Создаём транзакцию корректировки
    transaction = Transaction(
        user_id=student.id,
        type="manual",
        amount=body.amount,
        description=f"Корректировка администратором ({admin.first_name}): {body.reason}",
    )
    db.add(transaction)

    await db.flush()

    return {
        "student_id": student.id,
        "new_balance": student.balance,
        "adjustment": body.amount,
        "message": "Баланс скорректирован",
    }


@router.post("/bookings/{booking_id}/attend")
@limiter.limit("30/minute")
async def mark_attendance(
    request: Request,
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Отметить посещение: перевести бронирование в статус attended.
    Используется администратором для учёта посещений.
    """
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Запись не найдена",
        )

    if booking.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Невозможно отметить посещение: статус записи — {booking.status}",
        )

    booking.status = "attended"

    await db.flush()

    return {
        "booking_id": booking.id,
        "status": "attended",
        "message": "Посещение отмечено",
    }


@router.post("/broadcast", response_model=BroadcastResponse)
@limiter.limit("10/minute")
async def send_broadcast(
    request: Request,
    body: BroadcastRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> BroadcastResponse:
    """
    Отправить рассылку сообщения пользователям через Telegram Bot.

    Поддерживаемые target:
    - all: все пользователи
    - active_subs: пользователи с балансом > 0
    - by_direction: пользователи с записями на указанное направление
    """
    from app.core.bot import bot as tg_bot

    # Валидация: target=by_direction требует direction_id
    if body.target == "by_direction" and body.direction_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Для рассылки по направлению необходимо указать direction_id",
        )

    # Собираем список telegram_id в зависимости от target
    if body.target == "active_subs":
        result = await db.execute(
            select(User.telegram_id).where(User.balance > 0)
        )
    elif body.target == "by_direction":
        # Пользователи, у которых есть бронирования на занятия этого направления
        result = await db.execute(
            select(User.telegram_id)
            .distinct()
            .join(Booking, Booking.user_id == User.id)
            .join(Lesson, Booking.lesson_id == Lesson.id)
            .where(Lesson.direction_id == body.direction_id)
        )
    else:
        # all: все зарегистрированные пользователи
        result = await db.execute(select(User.telegram_id))

    telegram_ids = [row[0] for row in result.all()]
    total_users = len(telegram_ids)

    # Отправляем сообщение каждому пользователю
    sent = 0
    failed = 0
    for tg_id in telegram_ids:
        try:
            await tg_bot.send_message(chat_id=tg_id, text=body.message)
            sent += 1
        except Exception:
            # Пользователь заблокировал бота, удалил аккаунт и т.д.
            failed += 1

    return BroadcastResponse(
        status="completed",
        target=body.target,
        total_users=total_users,
        sent=sent,
        failed=failed,
        message_preview=body.message[:100],
    )


# =====================================================================
# CRUD: Направления (Directions)
# =====================================================================


@router.post("/directions", status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def create_direction(
    request: Request,
    body: DirectionCreateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Создать новое танцевальное направление.
    Проверяет уникальность slug перед созданием.
    """
    # Проверяем уникальность slug
    existing = await db.execute(
        select(Direction).where(Direction.slug == body.slug)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Направление со slug '{body.slug}' уже существует",
        )

    direction = Direction(
        name=body.name,
        slug=body.slug,
        description=body.description,
        short_description=body.short_description,
        image_url=body.image_url,
        color=body.color,
        icon=body.icon,
        is_active=body.is_active,
        sort_order=body.sort_order,
    )
    db.add(direction)
    await db.flush()

    return {
        "id": direction.id,
        "slug": direction.slug,
        "message": "Направление создано",
    }


@router.put("/directions/{direction_id}")
@limiter.limit("30/minute")
async def update_direction(
    request: Request,
    direction_id: int,
    body: DirectionUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Обновить данные направления.
    Обновляются только переданные поля (partial update).
    """
    result = await db.execute(select(Direction).where(Direction.id == direction_id))
    direction = result.scalar_one_or_none()

    if direction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Направление не найдено",
        )

    # Проверяем уникальность slug, если меняется
    if body.slug is not None and body.slug != direction.slug:
        slug_check = await db.execute(
            select(Direction).where(Direction.slug == body.slug)
        )
        if slug_check.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Направление со slug '{body.slug}' уже существует",
            )

    # Обновляем только переданные поля
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(direction, field, value)

    await db.flush()

    return {"id": direction.id, "message": "Направление обновлено"}


@router.delete("/directions/{direction_id}")
@limiter.limit("30/minute")
async def delete_direction(
    request: Request,
    direction_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Деактивировать направление (мягкое удаление — is_active=False).
    Направление скрывается от пользователей, но остаётся в БД.
    """
    result = await db.execute(select(Direction).where(Direction.id == direction_id))
    direction = result.scalar_one_or_none()

    if direction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Направление не найдено",
        )

    direction.is_active = False
    await db.flush()

    return {"id": direction.id, "message": "Направление деактивировано"}


# =====================================================================
# CRUD: Преподаватели (Teachers)
# =====================================================================


@router.post("/teachers", status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def create_teacher(
    request: Request,
    body: TeacherCreateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Создать нового преподавателя.
    Можно сразу привязать к направлениям через direction_ids.
    """
    # Генерируем slug из имени, если не указан
    slug = body.slug or body.name.lower().replace(" ", "-")

    # Проверяем уникальность slug
    existing = await db.execute(
        select(Teacher).where(Teacher.slug == slug)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Преподаватель со slug '{slug}' уже существует",
        )

    teacher = Teacher(
        name=body.name,
        slug=slug,
        bio=body.bio,
        photo_url=body.photo_url,
        experience_years=body.experience_years,
        is_active=body.is_active,
    )

    # Привязываем направления, если указаны
    if body.direction_ids:
        directions_result = await db.execute(
            select(Direction).where(Direction.id.in_(body.direction_ids))
        )
        directions = list(directions_result.scalars().all())
        if len(directions) != len(body.direction_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Одно или несколько направлений не найдены",
            )
        teacher.directions = directions

    db.add(teacher)
    await db.flush()

    return {
        "id": teacher.id,
        "slug": teacher.slug,
        "message": "Преподаватель создан",
    }


@router.put("/teachers/{teacher_id}")
@limiter.limit("30/minute")
async def update_teacher(
    request: Request,
    teacher_id: int,
    body: TeacherUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Обновить данные преподавателя.
    Обновляются только переданные поля (partial update).
    direction_ids полностью заменяет список привязанных направлений.
    """
    result = await db.execute(
        select(Teacher)
        .where(Teacher.id == teacher_id)
        .options(selectinload(Teacher.directions))
    )
    teacher = result.scalar_one_or_none()

    if teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Преподаватель не найден",
        )

    # Проверяем уникальность slug, если меняется
    if body.slug is not None and body.slug != teacher.slug:
        slug_check = await db.execute(
            select(Teacher).where(Teacher.slug == body.slug)
        )
        if slug_check.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Преподаватель со slug '{body.slug}' уже существует",
            )

    # Обновляем скалярные поля
    update_data = body.model_dump(exclude_unset=True, exclude={"direction_ids"})
    for field, value in update_data.items():
        setattr(teacher, field, value)

    # Обновляем M2M связь с направлениями, если передан direction_ids
    if body.direction_ids is not None:
        directions_result = await db.execute(
            select(Direction).where(Direction.id.in_(body.direction_ids))
        )
        directions = list(directions_result.scalars().all())
        if len(directions) != len(body.direction_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Одно или несколько направлений не найдены",
            )
        teacher.directions = directions

    await db.flush()

    return {"id": teacher.id, "message": "Преподаватель обновлён"}


@router.delete("/teachers/{teacher_id}")
@limiter.limit("30/minute")
async def delete_teacher(
    request: Request,
    teacher_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Деактивировать преподавателя (мягкое удаление — is_active=False).
    """
    result = await db.execute(select(Teacher).where(Teacher.id == teacher_id))
    teacher = result.scalar_one_or_none()

    if teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Преподаватель не найден",
        )

    teacher.is_active = False
    await db.flush()

    return {"id": teacher.id, "message": "Преподаватель деактивирован"}


# =====================================================================
# CRUD: Спецкурсы (Special Courses)
# =====================================================================


@router.post("/courses", status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def create_special_course(
    request: Request,
    body: SpecialCourseCreateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Создать новый специальный курс.
    Администратор указывает параметры курса: цену, количество занятий, дату старта и т.д.
    """
    try:
        start = date.fromisoformat(body.start_date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный формат даты старта. Ожидается: YYYY-MM-DD",
        )

    course = SpecialCourse(
        name=body.name,
        description=body.description,
        direction_id=body.direction_id,
        teacher_id=body.teacher_id,
        price=body.price,
        lessons_count=body.lessons_count,
        start_date=start,
        image_url=body.image_url,
        max_participants=body.max_participants,
        is_active=body.is_active,
    )
    db.add(course)
    await db.flush()

    return {
        "id": course.id,
        "name": course.name,
        "message": "Спецкурс создан",
    }


@router.put("/courses/{course_id}")
@limiter.limit("30/minute")
async def update_special_course(
    request: Request,
    course_id: int,
    body: SpecialCourseUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Обновить данные специального курса.
    Обновляются только переданные поля (partial update).
    """
    result = await db.execute(
        select(SpecialCourse).where(SpecialCourse.id == course_id)
    )
    course = result.scalar_one_or_none()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Спецкурс не найден",
        )

    # Обработка даты отдельно, если передана
    if body.start_date is not None:
        try:
            course.start_date = date.fromisoformat(body.start_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Неверный формат даты старта. Ожидается: YYYY-MM-DD",
            )

    # Обновляем остальные поля
    update_data = body.model_dump(exclude_unset=True, exclude={"start_date"})
    for field, value in update_data.items():
        setattr(course, field, value)

    await db.flush()

    return {"id": course.id, "message": "Спецкурс обновлён"}


@router.delete("/courses/{course_id}")
@limiter.limit("30/minute")
async def delete_special_course(
    request: Request,
    course_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Деактивировать специальный курс (мягкое удаление — is_active=False).
    """
    result = await db.execute(
        select(SpecialCourse).where(SpecialCourse.id == course_id)
    )
    course = result.scalar_one_or_none()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Спецкурс не найден",
        )

    course.is_active = False
    await db.flush()

    return {"id": course.id, "message": "Спецкурс деактивирован"}


# =====================================================================
# CRUD: Акции (Promotions)
# =====================================================================


@router.post("/promos", status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def create_promotion(
    request: Request,
    body: PromotionCreateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Создать новую акцию / промо-кампанию.
    Можно указать процентную или фиксированную скидку, промо-код и сроки действия.
    """
    try:
        valid_from = date.fromisoformat(body.valid_from)
        valid_until = date.fromisoformat(body.valid_until)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный формат даты. Ожидается: YYYY-MM-DD",
        )

    if valid_from > valid_until:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Дата начала акции не может быть позже даты окончания",
        )

    # Проверяем уникальность промо-кода, если указан
    if body.promo_code:
        existing = await db.execute(
            select(Promotion).where(Promotion.promo_code == body.promo_code)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Промо-код '{body.promo_code}' уже используется",
            )

    promotion = Promotion(
        title=body.title,
        description=body.description,
        image_url=body.image_url,
        promo_code=body.promo_code,
        discount_percent=body.discount_percent,
        discount_amount=body.discount_amount,
        valid_from=valid_from,
        valid_until=valid_until,
        max_uses=body.max_uses,
        current_uses=0,
        is_active=body.is_active,
    )
    db.add(promotion)
    await db.flush()

    return {
        "id": promotion.id,
        "title": promotion.title,
        "message": "Акция создана",
    }


@router.put("/promos/{promotion_id}")
@limiter.limit("30/minute")
async def update_promotion(
    request: Request,
    promotion_id: int,
    body: PromotionUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Обновить данные акции.
    Обновляются только переданные поля (partial update).
    """
    result = await db.execute(
        select(Promotion).where(Promotion.id == promotion_id)
    )
    promotion = result.scalar_one_or_none()

    if promotion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Акция не найдена",
        )

    # Проверяем уникальность промо-кода, если меняется
    if body.promo_code is not None and body.promo_code != promotion.promo_code:
        code_check = await db.execute(
            select(Promotion).where(Promotion.promo_code == body.promo_code)
        )
        if code_check.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Промо-код '{body.promo_code}' уже используется",
            )

    # Обработка дат отдельно
    parsed_from = promotion.valid_from
    parsed_until = promotion.valid_until

    if body.valid_from is not None:
        try:
            parsed_from = date.fromisoformat(body.valid_from)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Неверный формат даты начала. Ожидается: YYYY-MM-DD",
            )
        promotion.valid_from = parsed_from

    if body.valid_until is not None:
        try:
            parsed_until = date.fromisoformat(body.valid_until)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Неверный формат даты окончания. Ожидается: YYYY-MM-DD",
            )
        promotion.valid_until = parsed_until

    if parsed_from > parsed_until:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Дата начала акции не может быть позже даты окончания",
        )

    # Обновляем остальные поля
    update_data = body.model_dump(
        exclude_unset=True, exclude={"valid_from", "valid_until"}
    )
    for field, value in update_data.items():
        setattr(promotion, field, value)

    await db.flush()

    return {"id": promotion.id, "message": "Акция обновлена"}


@router.delete("/promos/{promotion_id}")
@limiter.limit("30/minute")
async def delete_promotion(
    request: Request,
    promotion_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Деактивировать акцию (мягкое удаление — is_active=False).
    """
    result = await db.execute(
        select(Promotion).where(Promotion.id == promotion_id)
    )
    promotion = result.scalar_one_or_none()

    if promotion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Акция не найдена",
        )

    promotion.is_active = False
    await db.flush()

    return {"id": promotion.id, "message": "Акция деактивирована"}


# =====================================================================
# CRUD: Тарифные планы (Subscription Plans)
# =====================================================================


@router.post("/subscriptions", status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def create_subscription_plan(
    request: Request,
    body: SubscriptionPlanCreateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Создать новый тарифный план абонемента.
    Определяет количество занятий, срок действия и цену.
    """
    plan = SubscriptionPlan(
        name=body.name,
        lessons_count=body.lessons_count,
        validity_days=body.validity_days,
        price=body.price,
        description=body.description,
        is_popular=body.is_popular,
        is_active=body.is_active,
        sort_order=body.sort_order,
    )
    db.add(plan)
    await db.flush()

    return {
        "id": plan.id,
        "name": plan.name,
        "message": "Тарифный план создан",
    }


@router.put("/subscriptions/{plan_id}")
@limiter.limit("30/minute")
async def update_subscription_plan(
    request: Request,
    plan_id: int,
    body: SubscriptionPlanUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Обновить данные тарифного плана.
    Обновляются только переданные поля (partial update).
    """
    result = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id)
    )
    plan = result.scalar_one_or_none()

    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тарифный план не найден",
        )

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)

    await db.flush()

    return {"id": plan.id, "message": "Тарифный план обновлён"}


@router.delete("/subscriptions/{plan_id}")
@limiter.limit("30/minute")
async def delete_subscription_plan(
    request: Request,
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Деактивировать тарифный план (мягкое удаление — is_active=False).
    Существующие подписки, купленные по этому тарифу, продолжат действовать.
    """
    result = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id)
    )
    plan = result.scalar_one_or_none()

    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тарифный план не найден",
        )

    plan.is_active = False
    await db.flush()

    return {"id": plan.id, "message": "Тарифный план деактивирован"}


# =====================================================================
# Деактивация просроченных подписок
# =====================================================================


@router.post("/deactivate-expired")
@limiter.limit("30/minute")
async def deactivate_expired(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> dict:
    """
    Вручную запустить деактивацию просроченных подписок.
    Деактивирует все подписки, у которых expires_at < текущей даты и is_active=True.
    """
    count = await deactivate_expired_subscriptions(db)

    return {
        "deactivated_count": count,
        "message": f"Деактивировано просроченных подписок: {count}",
    }
