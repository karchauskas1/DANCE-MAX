# CLAUDE.md — Dance Max Project

## Проект
Telegram-бот + веб-приложение (Mini App) для студии танцев Dance Max.
Единый цифровой хаб: оплата, запись, расписание, контент студии.

---

## ⚠️ КРИТИЧЕСКИ ВАЖНО: ДИЗАЙН

### Анти-паттерны (ЗАПРЕЩЕНО)
Дизайн **НЕ ДОЛЖЕН** быть:
- Типовым AI-сгенерированным (бланковый, шаблонный)
- Очевидным (первое решение, которое приходит в голову)
- Похожим на Bootstrap/Material UI из коробки
- Скучным корпоративным
- С дефолтными отступами и скруглениями

### Правило "Десятого решения"
```
Решение 1 — отбросить
Решение 2 — отбросить
Решение 3 — отбросить
...
Решение 10 — вот это уже интересно, копать глубже
```

Каждый UI-компонент должен пройти через итерации. Первый вариант — это отправная точка, не финал.

### Иконки: НЕ EMOJI
**ЗАПРЕЩЕНО:** использовать emoji (🔥💃📅👤)

**ИСПОЛЬЗОВАТЬ:**
- Lucide Icons (линейные, кастомизируемые)
- Phosphor Icons
- Собственные SVG-иконки
- Символы и логотипы

```tsx
// ❌ ПЛОХО
<span>🔥 Бачата</span>

// ✅ ХОРОШО
import { Flame } from 'lucide-react';
<Flame className="w-5 h-5 text-primary" />
```

---

## ⚠️ КРИТИЧЕСКИ ВАЖНО: АНИМАЦИИ

### Принцип: Всё живое, всё плавное
Приложение должно **ощущаться** живым. Каждое взаимодействие — с откликом. Никаких резких переходов.

### Обязательные анимации

#### 1. Переходы между страницами
```tsx
// Framer Motion page transitions
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
>
  {children}
</motion.div>
```

#### 2. Появление элементов (stagger)
```tsx
// Карточки появляются по очереди
const containerVariants = {
  animate: {
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

<motion.div variants={containerVariants} initial="initial" animate="animate">
  {lessons.map(lesson => (
    <motion.div key={lesson.id} variants={itemVariants}>
      <LessonCard lesson={lesson} />
    </motion.div>
  ))}
</motion.div>
```

#### 3. Кнопки и интерактивные элементы
```css
/* Button.module.css */
.button {
  transition: all var(--transition-normal);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.button:active {
  transform: translateY(0) scale(0.98);
}
```

#### 4. Карточки
```css
/* Card.module.css */
.card {
  transition: all var(--transition-normal);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card:active {
  transform: translateY(-2px);
}
```

#### 5. Модальные окна
```tsx
// Backdrop fade + modal scale
const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { opacity: 0, scale: 0.95, y: 20 }
};
```

#### 6. Skeleton loading
```css
/* Skeleton.module.css */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-gray-100) 25%,
    var(--color-gray-200) 50%,
    var(--color-gray-100) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

#### 7. Pull-to-refresh
```tsx
// Плавный индикатор обновления
const pullProgress = useSpring(0, { stiffness: 400, damping: 30 });
```

#### 8. Tab переключение
```css
/* Tabs.module.css */
.indicator {
  position: absolute;
  bottom: 0;
  height: 3px;
  background: var(--color-primary);
  border-radius: 3px;
  transition: all var(--transition-normal);
}
```

#### 9. Счётчики и числа
```tsx
// Анимированный счётчик баланса
import { useSpring, animated } from '@react-spring/web';

const AnimatedNumber = ({ value }) => {
  const { number } = useSpring({
    number: value,
    from: { number: 0 },
    config: { tension: 300, friction: 20 }
  });
  
  return <animated.span>{number.to(n => n.toFixed(0))}</animated.span>;
};
```

#### 10. Успешные действия
```tsx
// После успешной записи — confetti или checkmark анимация
const successVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: { type: "spring", damping: 15 }
  }
};
```

### Timing функции
```css
:root {
  /* Стандартные */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Специальные */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Правила анимаций
1. **Длительность:** 150-400ms (не больше, иначе тормозит UX)
2. **Easing:** Всегда ease-out для появления, ease-in для исчезновения
3. **Transform:** Использовать transform и opacity (GPU-ускорение)
4. **Reduce motion:** Уважать `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Библиотека: Framer Motion
```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Все страницы оборачиваем в AnimatePresence
<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    ...
  </Routes>
</AnimatePresence>
```

### Принципы дизайна
1. **Характер** — дизайн должен передавать энергию танца, страсть, движение
2. **Детали** — микроанимации, нестандартные hover-эффекты, продуманные переходы
3. **Типографика** — игра размеров, весов, необычные акценты
4. **Пространство** — асимметрия, нестандартные сетки, воздух
5. **Цвет** — градиенты, оверлеи, игра с прозрачностью

### Референсы для вдохновения
- Linear.app — анимации, внимание к деталям
- Stripe — типографика, чистота
- Apple — пространство, фокус
- Приложения фитнес-студий премиум-сегмента

---

## ⚠️ КРИТИЧЕСКИ ВАЖНО: ТЕСТИРОВАНИЕ

### Правило: Функция → Тесты → Прогон

Каждая новая функция **ОБЯЗАТЕЛЬНО** сопровождается тестами:

```
1. Написал функцию/компонент
2. Написал тесты для неё
3. Прогнал тесты
4. Все тесты зелёные → коммит
5. Хотя бы один красный → исправить до коммита
```

### Backend тесты (pytest)
```python
# tests/test_bookings.py

async def test_create_booking_success(client, user, lesson):
    """Успешная запись на занятие"""
    response = await client.post(
        "/api/bookings",
        json={"lesson_id": lesson.id},
        headers=auth_headers(user)
    )
    assert response.status_code == 201
    assert response.json()["lesson_id"] == lesson.id

async def test_create_booking_no_balance(client, user_no_balance, lesson):
    """Нельзя записаться без баланса"""
    response = await client.post(
        "/api/bookings",
        json={"lesson_id": lesson.id},
        headers=auth_headers(user_no_balance)
    )
    assert response.status_code == 400
    assert "balance" in response.json()["detail"].lower()

async def test_create_booking_lesson_full(client, user, full_lesson):
    """Нельзя записаться на заполненное занятие"""
    response = await client.post(
        "/api/bookings",
        json={"lesson_id": full_lesson.id},
        headers=auth_headers(user)
    )
    assert response.status_code == 400
```

### Frontend тесты (Vitest + Testing Library)
```typescript
// src/components/LessonCard.test.tsx

describe('LessonCard', () => {
  it('shows book button when available', () => {
    render(<LessonCard lesson={availableLesson} />);
    expect(screen.getByRole('button', { name: /записаться/i })).toBeInTheDocument();
  });

  it('shows cancel button when already booked', () => {
    render(<LessonCard lesson={bookedLesson} isBooked />);
    expect(screen.getByRole('button', { name: /отменить/i })).toBeInTheDocument();
  });

  it('disables button when lesson is full', () => {
    render(<LessonCard lesson={fullLesson} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Что тестировать обязательно
- [ ] Все API endpoints
- [ ] Авторизация и права доступа
- [ ] Бизнес-логика (запись, оплата, баланс)
- [ ] Граничные случаи (нет баланса, занятие заполнено, отмена)
- [ ] Критические UI-компоненты
- [ ] Интеграция с Telegram Web App

### Команды тестирования
```bash
# Backend
cd backend
pytest                      # все тесты
pytest -v                   # подробный вывод
pytest tests/test_bookings.py  # конкретный файл
pytest -k "booking"         # по имени
pytest --cov=app            # с покрытием

# Frontend
cd frontend
npm run test                # все тесты
npm run test:watch          # watch mode
npm run test:coverage       # с покрытием
```

### Минимальное покрытие
- Backend: **80%+** для бизнес-логики
- Frontend: **60%+** для компонентов

### Тесты — это не опционально
**НЕЛЬЗЯ** мержить код без тестов. Каждый PR должен включать:
- Unit-тесты на новую логику
- Integration-тесты на API endpoints
- Component-тесты на UI-компоненты

### Что тестировать в первую очередь
1. **Критический путь:** авторизация → оплата → запись
2. **Граничные случаи:** нет баланса, занятие заполнено, отмена
3. **Ошибки:** что показываем пользователю при сбоях

---

## Стек

### Frontend (Web App)
- **React 18** + TypeScript
- **Vite** — сборка
- **CSS Modules** — стили (НЕ Tailwind)
- **@twa-dev/sdk** — Telegram Web App SDK
- **React Router** — навигация
- **TanStack Query** — запросы к API
- **Zustand** — стейт-менеджмент
- **Framer Motion** — анимации

### Backend
- **Python 3.11+**
- **FastAPI** — API
- **SQLAlchemy** — ORM
- **PostgreSQL** — база данных
- **Redis** — кэш, очереди задач
- **Celery** — фоновые задачи (уведомления)
- **aiogram 3.x** — Telegram Bot

### Инфраструктура
- **Docker** + Docker Compose
- **Nginx** — reverse proxy
- **Let's Encrypt** — SSL

## Структура проекта

```
dancemax/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   ├── lessons.py
│   │   │   │   ├── bookings.py
│   │   │   │   ├── payments.py
│   │   │   │   ├── directions.py
│   │   │   │   ├── teachers.py
│   │   │   │   └── admin.py
│   │   │   └── deps.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── telegram.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── lesson.py
│   │   │   ├── booking.py
│   │   │   ├── direction.py
│   │   │   ├── teacher.py
│   │   │   └── transaction.py
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── booking.py
│   │   │   ├── payment.py
│   │   │   └── notification.py
│   │   └── main.py
│   ├── bot/
│   │   ├── handlers/
│   │   ├── keyboards/
│   │   ├── middlewares/
│   │   └── main.py
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Базовые компоненты
│   │   │   ├── layout/       # Layout компоненты
│   │   │   └── features/     # Фичевые компоненты
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   │   ├── Home.tsx
│   │   │   │   └── Home.module.css
│   │   │   ├── Schedule/
│   │   │   │   ├── Schedule.tsx
│   │   │   │   └── Schedule.module.css
│   │   │   ├── Lesson/
│   │   │   ├── Directions/
│   │   │   ├── Direction/
│   │   │   ├── Teachers/
│   │   │   ├── Teacher/
│   │   │   ├── Courses/
│   │   │   ├── Course/
│   │   │   ├── Profile/
│   │   │   ├── Payment/
│   │   │   └── About/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── styles/
│   │   │   ├── variables.css   # CSS-переменные (токены)
│   │   │   ├── animations.css  # Глобальные анимации
│   │   │   ├── typography.css  # Типографика
│   │   │   └── globals.css     # Глобальные стили
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── admin/                    # Админ-панель (отдельное приложение)
│   └── ...
├── docker-compose.yml
├── .env.example
├── CLAUDE.md
└── MEGAPROMPT.md
```

## Дизайн-токены

### Цвета
```css
:root {
  --color-primary: #FF5C35;
  --color-primary-light: #FF7A5C;
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
}
```

### CSS-переменные (variables.css)
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
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Тени */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);

  /* Анимации */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;
  --transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Пример CSS Module
```css
/* Button.module.css */
.button {
  background-color: var(--color-primary);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.button:hover {
  background-color: var(--color-primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.button:active {
  transform: translateY(0);
}

.buttonLarge {
  padding: 16px 32px;
  font-size: 18px;
}
```

```tsx
// Button.tsx
import styles from './Button.module.css';

export const Button = ({ size = 'md', children }) => (
  <button className={`${styles.button} ${size === 'lg' ? styles.buttonLarge : ''}`}>
    {children}
  </button>
);
```

## Команды

### Backend
```bash
cd backend

# Установка зависимостей
pip install -r requirements.txt

# Запуск API
uvicorn app.main:app --reload --port 8000

# Запуск бота
python -m bot.main

# Миграции
alembic upgrade head
alembic revision --autogenerate -m "description"

# Тесты
pytest
```

### Frontend
```bash
cd frontend

# Установка
npm install

# Разработка
npm run dev

# Сборка
npm run build

# Линтинг
npm run lint
```

### Docker
```bash
# Запуск всего
docker-compose up -d

# Логи
docker-compose logs -f

# Пересборка
docker-compose up -d --build
```

## API Endpoints

### Auth
```
POST /api/auth/telegram    # Авторизация через Telegram
GET  /api/auth/me          # Текущий пользователь
```

### Users
```
GET  /api/users/profile    # Профиль
GET  /api/users/balance    # Баланс
GET  /api/users/history    # История транзакций
```

### Lessons
```
GET  /api/lessons          # Список занятий (с фильтрами)
GET  /api/lessons/:id      # Детали занятия
GET  /api/lessons/today    # Занятия на сегодня
```

### Bookings
```
POST /api/bookings         # Записаться
DELETE /api/bookings/:id   # Отменить запись
GET  /api/bookings/my      # Мои записи
```

### Payments
```
GET  /api/payments/plans   # Абонементы
POST /api/payments/create  # Создать платёж
POST /api/payments/webhook # Вебхук от платёжки
```

### Content
```
GET  /api/directions       # Направления
GET  /api/directions/:id   # Направление
GET  /api/teachers         # Преподаватели
GET  /api/teachers/:id     # Преподаватель
GET  /api/courses          # Спецкурсы
GET  /api/courses/:id      # Спецкурс
GET  /api/promos           # Акции
```

### Admin
```
# Все CRUD операции для контента
# Управление расписанием
# Рассылки
# Статистика
```

## Модели базы данных

### User
```python
class User(Base):
    id: int
    telegram_id: int (unique)
    username: str | None
    first_name: str
    last_name: str | None
    phone: str | None
    balance: int = 0  # количество занятий
    created_at: datetime
    updated_at: datetime
```

### Lesson
```python
class Lesson(Base):
    id: int
    direction_id: int (FK)
    teacher_id: int (FK)
    datetime: datetime
    duration_minutes: int = 60
    max_students: int | None
    level: str  # beginner, intermediate, advanced
    status: str  # scheduled, cancelled, completed
    created_at: datetime
```

### Booking
```python
class Booking(Base):
    id: int
    user_id: int (FK)
    lesson_id: int (FK)
    status: str  # active, cancelled, attended, missed
    created_at: datetime
```

### Direction
```python
class Direction(Base):
    id: int
    name: str
    slug: str (unique)
    description: str
    icon: str  # название иконки из Lucide (например: "flame", "heart", "moon")
    image_url: str | None
    sort_order: int
    is_active: bool = True
```

### Teacher
```python
class Teacher(Base):
    id: int
    name: str
    slug: str (unique)
    bio: str
    photo_url: str | None
    experience_years: int
    is_active: bool = True
    
    directions: list[Direction]  # M2M
```

### Transaction
```python
class Transaction(Base):
    id: int
    user_id: int (FK)
    type: str  # payment, lesson, refund, manual, bonus
    amount: int  # +/- занятий
    description: str
    payment_id: str | None  # ID из платёжки
    created_at: datetime
```

## Правила разработки

### Код
- TypeScript strict mode
- Все компоненты — функциональные (React FC)
- Хуки для логики, компоненты для UI
- Никаких `any` — всегда типизация
- Комментарии на русском для бизнес-логики

### Именование
- Компоненты: PascalCase (`LessonCard.tsx`)
- Хуки: camelCase с use (`useBooking.ts`)
- Утилиты: camelCase (`formatDate.ts`)
- API роуты: snake_case (`/api/lessons/by_date`)
- CSS классы: kebab-case через Tailwind

### Git
- Ветки: `feature/`, `fix/`, `refactor/`
- Коммиты на русском: "Добавил страницу расписания"
- PR перед мержем в main

### Компоненты UI
Все базовые компоненты в `components/ui/`:
- Button
- Card
- Input
- Modal
- Tabs
- Badge
- Avatar
- Skeleton
- Toast

## Telegram Web App

### Инициализация
```typescript
import WebApp from '@twa-dev/sdk';

// В App.tsx
useEffect(() => {
  WebApp.ready();
  WebApp.expand();
  
  // Тема из Telegram
  document.documentElement.style.setProperty(
    '--tg-theme-bg-color',
    WebApp.themeParams.bg_color || '#FAFAFA'
  );
}, []);
```

### Авторизация
```typescript
// Получаем initData от Telegram
const initData = WebApp.initData;

// Отправляем на бэкенд для валидации
const { user, token } = await api.auth.telegram(initData);
```

### Платежи
```typescript
// Telegram Payments
WebApp.openInvoice(invoiceUrl, (status) => {
  if (status === 'paid') {
    // Успешная оплата
  }
});
```

### Haptic Feedback
```typescript
// Вибрация при действиях
WebApp.HapticFeedback.impactOccurred('light');
WebApp.HapticFeedback.notificationOccurred('success');
```

## Переменные окружения

```env
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/dancemax
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
TELEGRAM_BOT_TOKEN=123456:ABC-DEF
TELEGRAM_WEBAPP_URL=https://app.dancemax.ru
PAYMENT_PROVIDER_TOKEN=...

# Frontend
VITE_API_URL=https://api.dancemax.ru
VITE_BOT_USERNAME=DanceMaxBot
```

## Чеклист перед деплоем

- [ ] Все тесты проходят
- [ ] Нет ошибок TypeScript
- [ ] Нет console.log в продакшн коде
- [ ] Переменные окружения настроены
- [ ] SSL сертификат установлен
- [ ] Бэкапы БД настроены
- [ ] Мониторинг настроен
- [ ] Вебхуки платёжки работают
