"""
Seed-скрипт: заполняет базу данных начальными данными.

Направления, преподаватели, тарифы, расписание на 2 недели,
промоакция, спецкурс.

Запуск:
  cd backend && python seed.py
"""

import asyncio
import os
import sys
from datetime import date, time, timedelta

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# ─── Подключение к БД ───────────────────────────────────────────

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_VYrjF76AZQtf@ep-damp-tooth-ag3c7unx-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require",
)

# asyncpg требует postgresql+asyncpg://
ASYNC_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
if "sslmode=" in ASYNC_URL:
    ASYNC_URL = ASYNC_URL.replace("sslmode=require", "ssl=require")

engine = create_async_engine(ASYNC_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# ─── Данные ──────────────────────────────────────────────────────

DIRECTIONS = [
    {
        "name": "Бачата",
        "slug": "bachata",
        "description": "Бачата — чувственный парный танец из Доминиканской Республики. Мягкие движения бёдер, близкий контакт и латиноамериканские ритмы. Подходит для начинающих — базовые шаги осваиваются за пару занятий.",
        "short_description": "Парный латиноамериканский танец",
        "color": "#8D1F1F",
        "icon": "heart",
        "sort_order": 1,
    },
    {
        "name": "Сальса",
        "slug": "salsa",
        "description": "Сальса — энергичный парный танец с кубинскими корнями. Быстрый темп, яркие повороты и работа в паре. Развивает координацию, музыкальность и уверенность на танцполе.",
        "short_description": "Энергичный кубинский парный танец",
        "color": "#C4A35A",
        "icon": "flame",
        "sort_order": 2,
    },
    {
        "name": "Кизомба",
        "slug": "kizomba",
        "description": "Кизомба — медленный, плавный парный танец из Анголы. Минимум сложных фигур, максимум ведения и контакта. Идеальный танец для тех, кто хочет научиться чувствовать партнёра.",
        "short_description": "Плавный африканский парный танец",
        "color": "#7C5E99",
        "icon": "music",
        "sort_order": 3,
    },
    {
        "name": "Реггетон",
        "slug": "reggaeton",
        "description": "Реггетон — взрывной сольный танец под латиноамериканский урбан. Изоляции, волны, работа корпуса. Качает, заряжает энергией и раскрепощает. Без пары.",
        "short_description": "Сольный латиноамериканский урбан",
        "color": "#E5472A",
        "icon": "zap",
        "sort_order": 4,
    },
    {
        "name": "Lady Style",
        "slug": "lady-style",
        "description": "Lady Style — пластика, грация и женственность. Элементы бачаты, кизомбы и контемпорари. Работа с телом, руками, эмоциями. Только для девушек.",
        "short_description": "Женская пластика и хореография",
        "color": "#B34D6D",
        "icon": "sparkles",
        "sort_order": 5,
    },
]

TEACHERS = [
    {
        "name": "Мария Ковалёва",
        "slug": "maria-kovaleva",
        "bio": "Преподаватель бачаты и кизомбы с 8-летним стажем. Финалистка Russia Bachata Open 2023. Мягкий стиль преподавания, внимание к технике и музыкальности. Ведёт группы всех уровней.",
        "experience_years": 8,
        "direction_slugs": ["bachata", "kizomba"],
    },
    {
        "name": "Алексей Петров",
        "slug": "alexey-petrov",
        "bio": "Сальсеро со стажем 12 лет. Обучался на Кубе и в Нью-Йорке. Преподаёт кубинскую сальсу и сальсу LA. Энергичные занятия с акцентом на музыкальность и работу в паре.",
        "experience_years": 12,
        "direction_slugs": ["salsa", "bachata"],
    },
    {
        "name": "Екатерина Соколова",
        "slug": "ekaterina-sokolova",
        "bio": "Хореограф Lady Style и реггетон. 6 лет преподавания, авторские программы по женской пластике. Создаёт безопасную атмосферу для раскрепощения и самовыражения.",
        "experience_years": 6,
        "direction_slugs": ["lady-style", "reggaeton"],
    },
    {
        "name": "Даниил Морозов",
        "slug": "daniil-morozov",
        "bio": "Преподаватель кизомбы и урбан-кизомбы. 5 лет опыта, регулярные мастер-классы в Европе. Фокус на ведении, контакте и импровизации.",
        "experience_years": 5,
        "direction_slugs": ["kizomba", "bachata"],
    },
    {
        "name": "Анна Волкова",
        "slug": "anna-volkova",
        "bio": "Универсальный преподаватель — бачата, сальса, реггетон. 3 года активного преподавания. Молодая, энергичная, фокус на начинающих. Делает первые шаги лёгкими и весёлыми.",
        "experience_years": 3,
        "direction_slugs": ["bachata", "salsa", "reggaeton"],
    },
]

SUBSCRIPTION_PLANS = [
    {
        "name": "Пробное",
        "lessons_count": 1,
        "validity_days": 14,
        "price": 50000,  # 500 ₽
        "description": "Одно занятие на пробу — познакомься со студией и преподавателем",
        "is_popular": False,
        "sort_order": 1,
    },
    {
        "name": "Стандарт",
        "lessons_count": 8,
        "validity_days": 30,
        "price": 490000,  # 4 900 ₽
        "description": "8 занятий в месяц — оптимальный вариант для регулярных тренировок",
        "is_popular": True,
        "sort_order": 2,
    },
    {
        "name": "Безлимит",
        "lessons_count": 99,
        "validity_days": 30,
        "price": 990000,  # 9 900 ₽
        "description": "Безлимитное посещение всех направлений — танцуй каждый день",
        "is_popular": False,
        "sort_order": 3,
    },
]

PROMOTION = {
    "title": "Первое занятие бесплатно",
    "description": "Приходи на пробное занятие бесплатно! Используй промокод при оформлении пробного абонемента. Акция для новых учеников студии.",
    "promo_code": "DANCE2026",
    "discount_percent": 100,
    "valid_from": date.today(),
    "valid_until": date.today() + timedelta(days=90),
    "max_uses": 100,
}

SPECIAL_COURSE = {
    "name": "Бачата с нуля: 4-недельный интенсив",
    "description": "Полный курс для абсолютных новичков. За 8 занятий освоишь базовые шаги, повороты, ведение и музыкальность. В конце — мини-вечеринка с другими учениками курса.",
    "direction_slug": "bachata",
    "teacher_slug": "maria-kovaleva",
    "price": 590000,  # 5 900 ₽
    "lessons_count": 8,
    "start_date": date.today() + timedelta(days=7),
    "max_participants": 16,
}

# Расписание: шаблон занятий на неделю
# (день_недели 0=Пн, направление_slug, преподаватель_slug, время_начала, время_конца, зал, уровень)
WEEKLY_SCHEDULE = [
    # Понедельник
    (0, "bachata", "maria-kovaleva", time(18, 0), time(19, 0), "Зал 1", "beginner"),
    (0, "salsa", "alexey-petrov", time(19, 15), time(20, 15), "Зал 1", "all"),
    (0, "lady-style", "ekaterina-sokolova", time(20, 30), time(21, 30), "Зал 2", "all"),
    # Вторник
    (1, "kizomba", "daniil-morozov", time(18, 0), time(19, 0), "Зал 1", "beginner"),
    (1, "reggaeton", "ekaterina-sokolova", time(19, 15), time(20, 15), "Зал 2", "all"),
    (1, "bachata", "anna-volkova", time(20, 30), time(21, 30), "Зал 1", "intermediate"),
    # Среда
    (2, "salsa", "alexey-petrov", time(18, 0), time(19, 0), "Зал 1", "beginner"),
    (2, "bachata", "maria-kovaleva", time(19, 15), time(20, 15), "Зал 1", "intermediate"),
    (2, "kizomba", "daniil-morozov", time(20, 30), time(21, 30), "Зал 2", "all"),
    # Четверг
    (3, "lady-style", "ekaterina-sokolova", time(18, 0), time(19, 0), "Зал 2", "all"),
    (3, "reggaeton", "anna-volkova", time(19, 15), time(20, 15), "Зал 1", "all"),
    (3, "bachata", "alexey-petrov", time(20, 30), time(21, 30), "Зал 1", "advanced"),
    # Пятница
    (4, "salsa", "alexey-petrov", time(18, 0), time(19, 0), "Зал 1", "all"),
    (4, "kizomba", "maria-kovaleva", time(19, 15), time(20, 15), "Зал 2", "beginner"),
    (4, "bachata", "anna-volkova", time(20, 30), time(21, 30), "Зал 1", "beginner"),
    # Суббота
    (5, "bachata", "maria-kovaleva", time(11, 0), time(12, 0), "Зал 1", "beginner"),
    (5, "salsa", "alexey-petrov", time(12, 15), time(13, 15), "Зал 1", "all"),
    (5, "reggaeton", "ekaterina-sokolova", time(13, 30), time(14, 30), "Зал 2", "all"),
    # Воскресенье
    (6, "kizomba", "daniil-morozov", time(11, 0), time(12, 0), "Зал 1", "all"),
    (6, "lady-style", "ekaterina-sokolova", time(12, 15), time(13, 15), "Зал 2", "all"),
    (6, "bachata", "anna-volkova", time(13, 30), time(14, 30), "Зал 1", "beginner"),
]


# ─── Seed логика ─────────────────────────────────────────────────

async def seed() -> None:
    async with async_session() as db:
        print("🗑  Очистка старых данных...")
        # Порядок удаления — с учётом FK
        for table in [
            "transactions",
            "bookings",
            "subscriptions",
            "lessons",
            "special_courses",
            "promotions",
            "subscription_plans",
            "teacher_directions",
            "teachers",
            "directions",
        ]:
            await db.execute(text(f"DELETE FROM {table}"))
        await db.commit()
        print("   Готово.\n")

        # ── Направления ──
        print("📁 Направления...")
        dir_ids: dict[str, int] = {}
        for d in DIRECTIONS:
            result = await db.execute(
                text("""
                    INSERT INTO directions (name, slug, description, short_description, color, icon, is_active, sort_order)
                    VALUES (:name, :slug, :description, :short_description, :color, :icon, true, :sort_order)
                    RETURNING id
                """),
                d,
            )
            dir_ids[d["slug"]] = result.scalar_one()
            print(f"   + {d['name']}")
        await db.commit()

        # ── Преподаватели ──
        print("\n👩‍🏫 Преподаватели...")
        teacher_ids: dict[str, int] = {}
        for t in TEACHERS:
            result = await db.execute(
                text("""
                    INSERT INTO teachers (name, slug, bio, experience_years, is_active)
                    VALUES (:name, :slug, :bio, :experience_years, true)
                    RETURNING id
                """),
                {"name": t["name"], "slug": t["slug"], "bio": t["bio"], "experience_years": t["experience_years"]},
            )
            tid = result.scalar_one()
            teacher_ids[t["slug"]] = tid

            for ds in t["direction_slugs"]:
                await db.execute(
                    text("INSERT INTO teacher_directions (teacher_id, direction_id) VALUES (:tid, :did)"),
                    {"tid": tid, "did": dir_ids[ds]},
                )
            print(f"   + {t['name']} ({', '.join(t['direction_slugs'])})")
        await db.commit()

        # ── Тарифы ──
        print("\n💳 Тарифы...")
        for p in SUBSCRIPTION_PLANS:
            await db.execute(
                text("""
                    INSERT INTO subscription_plans (name, lessons_count, validity_days, price, description, is_popular, is_active, sort_order)
                    VALUES (:name, :lessons_count, :validity_days, :price, :description, :is_popular, true, :sort_order)
                """),
                p,
            )
            price_rub = p["price"] // 100
            print(f"   + {p['name']} — {p['lessons_count']} зан., {price_rub} ₽")
        await db.commit()

        # ── Расписание на 2 недели ──
        print("\n📅 Расписание (2 недели вперёд)...")
        today = date.today()
        current_weekday = today.weekday()
        lessons_count = 0

        for week_offset in range(2):
            for dow, dir_slug, teacher_slug, start, end, room, level in WEEKLY_SCHEDULE:
                # Вычисляем дату: ближайший день dow от сегодня + week_offset
                days_ahead = dow - current_weekday
                if days_ahead < 0:
                    days_ahead += 7
                lesson_date = today + timedelta(days=days_ahead + 7 * week_offset)

                await db.execute(
                    text("""
                        INSERT INTO lessons (direction_id, teacher_id, date, start_time, end_time, room, max_spots, level, is_cancelled, created_at)
                        VALUES (:dir_id, :teacher_id, :date, :start_time, :end_time, :room, 12, :level, false, now())
                    """),
                    {
                        "dir_id": dir_ids[dir_slug],
                        "teacher_id": teacher_ids[teacher_slug],
                        "date": lesson_date,
                        "start_time": start,
                        "end_time": end,
                        "room": room,
                        "level": level,
                    },
                )
                lessons_count += 1
        await db.commit()
        print(f"   + {lessons_count} занятий создано")

        # ── Промоакция ──
        print("\n🎁 Промоакция...")
        await db.execute(
            text("""
                INSERT INTO promotions (title, description, promo_code, discount_percent, valid_from, valid_until, max_uses, current_uses, is_active)
                VALUES (:title, :description, :promo_code, :discount_percent, :valid_from, :valid_until, :max_uses, 0, true)
            """),
            PROMOTION,
        )
        await db.commit()
        print(f"   + {PROMOTION['title']} (код: {PROMOTION['promo_code']})")

        # ── Спецкурс ──
        print("\n🎓 Спецкурс...")
        sc = SPECIAL_COURSE
        await db.execute(
            text("""
                INSERT INTO special_courses (name, description, direction_id, teacher_id, price, lessons_count, start_date, max_participants, current_participants, is_active)
                VALUES (:name, :description, :dir_id, :teacher_id, :price, :lessons_count, :start_date, :max_participants, 0, true)
            """),
            {
                "name": sc["name"],
                "description": sc["description"],
                "dir_id": dir_ids[sc["direction_slug"]],
                "teacher_id": teacher_ids[sc["teacher_slug"]],
                "price": sc["price"],
                "lessons_count": sc["lessons_count"],
                "start_date": sc["start_date"],
                "max_participants": sc["max_participants"],
            },
        )
        await db.commit()
        print(f"   + {sc['name']}")

        print("\n✅ Seed завершён!")
        print(f"   Направлений: {len(DIRECTIONS)}")
        print(f"   Преподавателей: {len(TEACHERS)}")
        print(f"   Тарифов: {len(SUBSCRIPTION_PLANS)}")
        print(f"   Занятий: {lessons_count}")
        print(f"   Промоакций: 1")
        print(f"   Спецкурсов: 1")


if __name__ == "__main__":
    asyncio.run(seed())
