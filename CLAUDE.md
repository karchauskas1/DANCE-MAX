# CLAUDE.md — Dance Max Project

## Проект
Telegram-бот + Mini App для студии танцев Dance Max.
Единый хаб: оплата, запись, расписание, контент.

---

## ДИЗАЙН (КРИТИЧНО)

### Запрещено
- Типовой AI/Bootstrap/Material UI вид
- Скучный корпоратив, дефолтные отступы
- Emoji вместо иконок — использовать **Lucide Icons** / Phosphor / SVG

### Принципы
- **Правило "десятого решения"** — первый вариант НИКОГДА не берётся в продакшн. Рабочее решение принимается только после нескольких итераций. Не экономить на токенах — всегда давать проверенное, качественное решение
- Характер: энергия танца, страсть, движение
- Детали: микроанимации, нестандартные hover, продуманные переходы
- Типографика: игра размеров и весов
- Пространство: асимметрия, воздух
- Референсы: Linear.app, Stripe, Apple, премиум фитнес-приложения

---

## АНИМАЦИИ (КРИТИЧНО)

Всё живое, всё плавное. Каждое взаимодействие — с откликом. Библиотека: **Framer Motion**.

### Обязательно анимировать
1. **Страницы** — fade+slide через `AnimatePresence mode="wait"`
2. **Списки** — staggerChildren: 0.08, элементы появляются по очереди
3. **Кнопки** — hover: translateY(-2px) + shadow, active: scale(0.98)
4. **Карточки** — hover: translateY(-4px) + shadow-lg
5. **Модалки** — backdrop fade + modal spring scale
6. **Skeleton** — shimmer gradient animation
7. **Табы** — плавный индикатор
8. **Числа/счётчики** — анимированный подсчёт (react-spring)
9. **Успешные действия** — spring checkmark/confetti

### Правила
- Длительность: 150-400ms
- Easing: ease-out для появления, ease-in для исчезновения
- Только transform + opacity (GPU)
- Уважать `prefers-reduced-motion`

### CSS-переменные для анимаций
```css
--transition-fast: 150ms ease;
--transition-normal: 250ms ease;
--transition-slow: 400ms ease;
--transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## ТЕСТИРОВАНИЕ (КРИТИЧНО)

### Правило: Функция → Тесты → Прогон → Зелёные → Коммит

- **НЕЛЬЗЯ** мержить код без тестов
- Backend (pytest): 80%+ покрытие бизнес-логики
- Frontend (Vitest + Testing Library): 60%+ покрытие компонентов
- Приоритет: авторизация → оплата → запись → граничные случаи → ошибки

### Команды
```bash
# Backend
cd backend && pytest                # все тесты
cd backend && pytest --cov=app      # с покрытием

# Frontend
cd frontend && npm run test         # все тесты
cd frontend && npm run test:coverage
```

---

## Стек

**Frontend:** React 18 + TypeScript, Vite, CSS Modules (НЕ Tailwind), @twa-dev/sdk, React Router, TanStack Query, Zustand, Framer Motion

**Backend:** Python 3.11+, FastAPI, SQLAlchemy, PostgreSQL, Redis, Celery, aiogram 3.x

**Infra:** Docker + Compose, Nginx, Let's Encrypt

---

## Дизайн-токены (variables.css)
```css
:root {
  /* Цвета */
  --color-primary: #FF5C35;
  --color-primary-light: #FF7A5C;
  --color-primary-dark: #E5472A;
  --color-secondary: #1A1A1A;
  --color-background: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-gray-100: #F5F5F5;
  --color-gray-200: #E5E5E5;
  --color-gray-400: #A3A3A3;
  --color-gray-600: #525252;
  --color-text: #0A0A0A;
  --color-text-secondary: #525252;
  --color-success: #22C55E;
  --color-error: #EF4444;

  /* Типографика */
  --font-display: 'Unbounded', sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;

  /* Размеры */
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 24px;

  /* Тени */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
}
```

---

## API Endpoints

```
POST /api/auth/telegram          GET /api/auth/me
GET  /api/users/profile|balance|history
GET  /api/lessons[/:id|/today]
POST /api/bookings               DELETE /api/bookings/:id    GET /api/bookings/my
GET  /api/payments/plans          POST /api/payments/create|webhook
GET  /api/directions[/:id]       GET /api/teachers[/:id]
GET  /api/courses[/:id]          GET /api/promos
# Admin: CRUD, расписание, рассылки, статистика
```

---

## Модели БД

- **User**: id, telegram_id(unique), username?, first_name, last_name?, phone?, balance(int=0), created_at, updated_at
- **Lesson**: id, direction_id(FK), teacher_id(FK), datetime, duration_minutes(60), max_students?, level(beginner/intermediate/advanced), status(scheduled/cancelled/completed)
- **Booking**: id, user_id(FK), lesson_id(FK), status(active/cancelled/attended/missed), created_at
- **Direction**: id, name, slug(unique), description, icon(Lucide name), image_url?, sort_order, is_active
- **Teacher**: id, name, slug(unique), bio, photo_url?, experience_years, is_active, directions(M2M)
- **Transaction**: id, user_id(FK), type(payment/lesson/refund/manual/bonus), amount(int), description, payment_id?, created_at

---

## Правила разработки

- TypeScript strict, никаких `any`, функциональные компоненты
- Именование: PascalCase (компоненты), camelCase+use (хуки), snake_case (API роуты)
- CSS Modules с CSS-переменными
- Git: ветки `feature/`/`fix/`/`refactor/`, коммиты на русском, PR перед мержем
- UI компоненты в `components/ui/`: Button, Card, Input, Modal, Tabs, Badge, Avatar, Skeleton, Toast

## Telegram Web App
- Инициализация: `WebApp.ready()` + `WebApp.expand()` + тема из themeParams
- Авторизация: `WebApp.initData` → POST `/api/auth/telegram`
- Платежи: `WebApp.openInvoice(url, callback)`
- Haptic: `WebApp.HapticFeedback.impactOccurred('light')`

## Команды
```bash
# Backend
cd backend && pip install -r requirements.txt
cd backend && uvicorn app.main:app --reload --port 8000
cd backend && python -m bot.main
cd backend && alembic upgrade head

# Frontend
cd frontend && npm install
cd frontend && npm run dev
cd frontend && npm run build

# Docker
docker-compose up -d [--build]
```

## ENV
```
DATABASE_URL, REDIS_URL, SECRET_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_WEBAPP_URL, PAYMENT_PROVIDER_TOKEN
VITE_API_URL, VITE_BOT_USERNAME
```
