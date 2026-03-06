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
        "name": "Lady Style",
        "slug": "lady-style",
        "description": "Lady Style — пластика, грация и женственность. Элементы бачаты и контемпорари. Работа с телом, руками, эмоциями. Только для девушек.",
        "short_description": "Женская пластика и хореография",
        "color": "#B34D6D",
        "icon": "sparkles",
        "sort_order": 2,
    },
    {
        "name": "Доминикана",
        "slug": "dominicana",
        "description": "Доминикана — аутентичный стиль бачаты, рождённый на улицах Доминиканской Республики. Быстрая работа ног, игривость и свобода движений. Танец-настроение.",
        "short_description": "Аутентичный доминиканский стиль",
        "color": "#E5472A",
        "icon": "flame",
        "sort_order": 3,
    },
    {
        "name": "Сальса",
        "slug": "salsa",
        "description": "Сальса — энергичный парный танец с кубинскими корнями. Быстрый темп, яркие повороты и работа в паре. Развивает координацию, музыкальность и уверенность на танцполе.",
        "short_description": "Энергичный кубинский парный танец",
        "color": "#C4A35A",
        "icon": "zap",
        "sort_order": 4,
    },
    {
        "name": "Музыкальность",
        "slug": "musicality",
        "description": "Музыкальность — умение слышать музыку и выражать её телом. Разбор структуры, акцентов, инструментов. Делает любой танец выразительнее и интереснее.",
        "short_description": "Слышать музыку и танцевать в неё",
        "color": "#7C5E99",
        "icon": "music",
        "sort_order": 5,
    },
]

TEACHERS = [
    {
        "name": "Екатерина Волковыская",
        "slug": "ekaterina-volkovyskaya",
        "bio": "Преподаватель бачаты и Lady Style. Помогает раскрыть женственность и уверенность через танец.",
        "experience_years": 5,
        "direction_slugs": ["bachata", "lady-style"],
    },
    {
        "name": "Татьяна Степанова",
        "slug": "tatyana-stepanova",
        "bio": "Преподаватель бачаты. Внимание к технике, плавность движений, работа с музыкальностью.",
        "experience_years": 5,
        "direction_slugs": ["bachata"],
    },
    {
        "name": "Сюзанна Эмирян",
        "slug": "syuzanna-emiryan",
        "bio": "Преподаватель бачаты, Lady Style и доминиканы. Яркий стиль, энергия и эмоциональная подача.",
        "experience_years": 7,
        "direction_slugs": ["bachata", "lady-style", "dominicana"],
    },
    {
        "name": "Артур Бикшанов",
        "slug": "artur-bikshanov",
        "bio": "Преподаватель бачаты. Сильная техника ведения, чёткая структура занятий.",
        "experience_years": 10,
        "direction_slugs": ["bachata"],
    },
    {
        "name": "Артём Бодров",
        "slug": "artem-bodrov",
        "bio": "Преподаватель бачаты. Современный подход, работа над стилем и подачей.",
        "experience_years": 5,
        "direction_slugs": ["bachata"],
    },
    {
        "name": "Тигран Товмасян",
        "slug": "tigran-tovmasyan",
        "bio": "Преподаватель бачаты, доминиканы и музыкальности. Глубокое понимание музыки, авторские методики.",
        "experience_years": 7,
        "direction_slugs": ["bachata", "dominicana", "musicality"],
    },
    {
        "name": "Никита Саттаров",
        "slug": "nikita-sattarov",
        "bio": "Преподаватель бачаты. Молодой, энергичный, фокус на начинающих.",
        "experience_years": 3,
        "direction_slugs": ["bachata"],
    },
    {
        "name": "Максим Коневец",
        "slug": "maksim-konevets",
        "bio": "Преподаватель бачаты, сальсы и доминиканы. Универсальный танцор с широким кругозором и опытом социальных вечеринок.",
        "experience_years": 10,
        "direction_slugs": ["bachata", "salsa", "dominicana"],
    },
    {
        "name": "Яна Амирова",
        "slug": "yana-amirova",
        "bio": "Преподаватель бачаты и Lady Style. Многолетний опыт, глубокая работа с пластикой и женской техникой.",
        "experience_years": 12,
        "direction_slugs": ["bachata", "lady-style"],
    },
]

SUBSCRIPTION_PLANS = [
    # ── Индивидуальные абонементы ──
    {
        "name": "Разовое занятие",
        "lessons_count": 1,
        "validity_days": 30,
        "price": 90000,  # 900 ₽
        "description": "1 час. Приходите на пробную тренировку",
        "is_popular": False,
        "sort_order": 1,
    },
    {
        "name": "4 часа",
        "lessons_count": 4,
        "validity_days": 30,
        "price": 300000,  # 3 000 ₽
        "description": "Спокойный ритм занятий",
        "is_popular": False,
        "sort_order": 2,
    },
    {
        "name": "8 часов",
        "lessons_count": 8,
        "validity_days": 30,
        "price": 520000,  # 5 200 ₽
        "description": "Подойдёт для регулярной практики",
        "is_popular": True,
        "sort_order": 3,
    },
    {
        "name": "12 часов",
        "lessons_count": 12,
        "validity_days": 30,
        "price": 720000,  # 7 200 ₽
        "description": "Комплексная система тренировок",
        "is_popular": False,
        "sort_order": 4,
    },
    {
        "name": "16 часов",
        "lessons_count": 16,
        "validity_days": 30,
        "price": 880000,  # 8 800 ₽
        "description": "Эффективная программа для достижения результатов",
        "is_popular": False,
        "sort_order": 5,
    },
    # ── Парные абонементы ──
    {
        "name": "Парное разовое",
        "lessons_count": 1,
        "validity_days": 30,
        "price": 160000,  # 1 600 ₽
        "description": "1 час. Приходите на пробную тренировку с парой",
        "is_popular": False,
        "sort_order": 6,
    },
    {
        "name": "Парный 4 часа",
        "lessons_count": 4,
        "validity_days": 30,
        "price": 520000,  # 5 200 ₽
        "description": "Спокойный ритм занятий — для двоих",
        "is_popular": False,
        "sort_order": 7,
    },
    {
        "name": "Парный 8 часов",
        "lessons_count": 8,
        "validity_days": 30,
        "price": 920000,  # 9 200 ₽
        "description": "Подойдёт для регулярной практики — для двоих",
        "is_popular": False,
        "sort_order": 8,
    },
    {
        "name": "Парный 16 часов",
        "lessons_count": 16,
        "validity_days": 30,
        "price": 1650000,  # 16 500 ₽
        "description": "Эффективная программа — для двоих",
        "is_popular": False,
        "sort_order": 9,
    },
    # ── Безлимитные абонементы ──
    {
        "name": "Безлимит 1 месяц",
        "lessons_count": 999,
        "validity_days": 30,
        "price": 1180000,  # 11 800 ₽
        "description": "Тренируйтесь без ограничений в удобное время",
        "is_popular": False,
        "sort_order": 10,
    },
    {
        "name": "Безлимит 3 месяца",
        "lessons_count": 999,
        "validity_days": 90,
        "price": 3000000,  # 30 000 ₽
        "description": "Полное погружение и стабильный прогресс",
        "is_popular": False,
        "sort_order": 11,
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
    "teacher_slug": "artur-bikshanov",
    "price": 590000,  # 5 900 ₽
    "lessons_count": 8,
    "start_date": date.today() + timedelta(days=7),
    "max_participants": 16,
}

# Расписание: шаблон занятий на неделю
# (день_недели 0=Пн, направление_slug, преподаватель_slug, время_начала, время_конца, зал, уровень)
WEEKLY_SCHEDULE = [
    # Понедельник
    (0, "bachata", "artur-bikshanov", time(19, 0), time(20, 0), "Рубинштейна", "beginner"),
    (0, "lady-style", "ekaterina-volkovyskaya", time(20, 15), time(21, 15), "Рубинштейна", "all"),
    (0, "bachata", "tigran-tovmasyan", time(21, 30), time(22, 30), "Рубинштейна", "intermediate"),
    # Вторник
    (1, "bachata", "tatyana-stepanova", time(19, 0), time(20, 0), "Рубинштейна", "beginner"),
    (1, "dominicana", "syuzanna-emiryan", time(20, 15), time(21, 15), "Рубинштейна", "all"),
    (1, "bachata", "artem-bodrov", time(21, 30), time(22, 30), "Рубинштейна", "intermediate"),
    # Среда
    (2, "bachata", "nikita-sattarov", time(19, 0), time(20, 0), "Рубинштейна", "beginner"),
    (2, "salsa", "maksim-konevets", time(20, 15), time(21, 15), "Рубинштейна", "all"),
    (2, "musicality", "tigran-tovmasyan", time(21, 30), time(22, 30), "Рубинштейна", "all"),
    # Четверг
    (3, "lady-style", "yana-amirova", time(19, 0), time(20, 0), "Рубинштейна", "all"),
    (3, "bachata", "artur-bikshanov", time(20, 15), time(21, 15), "Рубинштейна", "intermediate"),
    (3, "dominicana", "maksim-konevets", time(21, 30), time(22, 30), "Рубинштейна", "all"),
    # Пятница
    (4, "bachata", "syuzanna-emiryan", time(19, 0), time(20, 0), "Рубинштейна", "beginner"),
    (4, "bachata", "tigran-tovmasyan", time(20, 15), time(21, 15), "Рубинштейна", "advanced"),
    (4, "lady-style", "ekaterina-volkovyskaya", time(21, 30), time(22, 30), "Рубинштейна", "all"),
    # Суббота
    (5, "bachata", "artem-bodrov", time(12, 0), time(13, 0), "Рубинштейна", "beginner"),
    (5, "dominicana", "tigran-tovmasyan", time(13, 15), time(14, 15), "Рубинштейна", "all"),
    (5, "salsa", "maksim-konevets", time(14, 30), time(15, 30), "Рубинштейна", "beginner"),
    # Воскресенье
    (6, "bachata", "tatyana-stepanova", time(12, 0), time(13, 0), "Рубинштейна", "all"),
    (6, "lady-style", "yana-amirova", time(13, 15), time(14, 15), "Рубинштейна", "all"),
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
