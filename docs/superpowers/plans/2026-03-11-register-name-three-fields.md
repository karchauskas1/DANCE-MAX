# Регистрация ФИО в трёх полях — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Заменить одно поле ФИО на три отдельных поля (фамилия, имя, отчество) на уровне БД, API и UI, чтобы Telegram-бот мог однозначно читать каждую часть имени пользователя.

**Architecture:** Backend добавляет три новых колонки в таблицу `users` (сохраняя `real_name` для обратной совместимости), обновляет схемы и роут. Frontend обновляет типы, маппинг (два независимых места), хук мутации (с обновлением Zustand стора для предотвращения redirect-петли) и страницу `RegisterName` с тремя inputs и модалкой подтверждения.

**Tech Stack:** Python 3.11, FastAPI, SQLAlchemy async, Alembic, pytest, httpx; React 18, TypeScript, TanStack Query, Zustand, Framer Motion, CSS Modules.

**Spec:** `docs/superpowers/specs/2026-03-11-register-name-three-fields-design.md`

---

## Chunk 1: Backend

### Task 1: Alembic-миграция — три новых колонки

**Files:**
- Create: `backend/alembic/versions/2026_03_11_add_real_name_parts.py`

- [ ] **Step 1: Создать файл миграции**

```python
"""Добавляем поля real_last_name, real_first_name, real_patronymic в таблицу users.

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-03-11
"""

from alembic import op
import sqlalchemy as sa

revision = "b2c3d4e5f6a7"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("real_last_name",  sa.String(100), nullable=True))
    op.add_column("users", sa.Column("real_first_name", sa.String(100), nullable=True))
    op.add_column("users", sa.Column("real_patronymic", sa.String(100), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "real_last_name")
    op.drop_column("users", "real_first_name")
    op.drop_column("users", "real_patronymic")
```

- [ ] **Step 2: Применить миграцию и убедиться, что она работает**

```bash
cd backend && alembic upgrade head
```

Ожидаемый вывод: `Running upgrade a1b2c3d4e5f6 -> b2c3d4e5f6a7, ...` без ошибок.

- [ ] **Step 3: Проверить downgrade**

```bash
cd backend && alembic downgrade -1 && alembic upgrade head
```

Ожидаемый вывод: оба шага без ошибок.

---

### Task 2: Модель User — три новых поля

**Files:**
- Modify: `backend/app/models/user.py`

- [ ] **Step 1: Добавить три колонки после `real_name`**

В файле `backend/app/models/user.py` после строки `real_name: Mapped[str | None] = ...` добавить:

```python
# Раздельные части ФИО (паспортные данные, заполняются одновременно с real_name)
real_last_name:  Mapped[str | None] = mapped_column(String(100), nullable=True)
real_first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
real_patronymic: Mapped[str | None] = mapped_column(String(100), nullable=True)
```

- [ ] **Step 2: Убедиться, что приложение запускается без ошибок**

```bash
cd backend && python -c "from app.models.user import User; print('OK')"
```

Ожидаемый вывод: `OK`

---

### Task 3: Pydantic-схемы — три поля вместо одного

**Files:**
- Modify: `backend/app/schemas/user.py`

- [ ] **Step 1: Написать failing-тест на новую схему**

Создать или добавить в `backend/tests/test_users.py`:

```python
import pytest
from pydantic import ValidationError
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
```

- [ ] **Step 2: Запустить тесты — убедиться, что они падают**

```bash
cd backend && pytest tests/test_users.py::TestSetRealNameRequest -v
```

Ожидаемый вывод: FAILED (класс `TestSetRealNameRequest` не найден или `SetRealNameRequest` не имеет трёх полей).

- [ ] **Step 3: Обновить схему в `backend/app/schemas/user.py`**

Заменить содержимое файла целиком:

```python
"""
Pydantic-схемы для пользователя.
"""

import re

from datetime import datetime

from pydantic import BaseModel, field_validator


class UserBase(BaseModel):
    """Базовые поля пользователя."""
    first_name: str
    last_name: str | None = None
    username: str | None = None
    phone: str | None = None
    real_name: str | None = None
    real_last_name:  str | None = None
    real_first_name: str | None = None
    real_patronymic: str | None = None


class UserResponse(UserBase):
    """Полный ответ с данными пользователя."""
    id: int
    telegram_id: int
    photo_url: str | None = None
    balance: int
    is_admin: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class UserBalanceResponse(BaseModel):
    """Баланс пользователя и количество активных абонементов."""
    balance: int
    active_subscriptions: int


# Паттерн: только буквы кириллицы/латиницы, дефис и пробел
_NAME_PATTERN = re.compile(r"^[А-ЯЁа-яёA-Za-z\- ]+$")


class SetRealNameRequest(BaseModel):
    """Запрос на установку ФИО по трём отдельным полям (один раз, без изменения)."""
    real_last_name:  str
    real_first_name: str
    real_patronymic: str

    @field_validator("real_last_name", "real_first_name", "real_patronymic", mode="before")
    @classmethod
    def validate_name_part(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Поле слишком короткое (минимум 2 символа)")
        if len(v) > 100:
            raise ValueError("Поле слишком длинное (максимум 100 символов)")
        if not _NAME_PATTERN.match(v):
            raise ValueError(
                "Допустимы только буквы (кириллица/латиница), дефис и пробел"
            )
        return v
```

- [ ] **Step 4: Запустить тесты — убедиться, что они проходят**

```bash
cd backend && pytest tests/test_users.py::TestSetRealNameRequest -v
```

Ожидаемый вывод: 7 passed.

---

### Task 4: Роут `/api/users/real-name` — сохранение трёх полей

**Files:**
- Modify: `backend/app/api/routes/users.py`

- [ ] **Step 1: Написать failing-тест на новый роут**

Добавить в `backend/tests/test_users.py`:

```python
from httpx import AsyncClient
from app.models.user import User


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
        # Первый вызов — успех
        await client.put(
            "/api/users/real-name",
            json={
                "real_last_name": "Иванов",
                "real_first_name": "Иван",
                "real_patronymic": "Иванович",
            },
            headers=auth_headers,
        )
        # Второй вызов — 409
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
```

- [ ] **Step 2: Запустить — убедиться, что тесты падают**

```bash
cd backend && pytest tests/test_users.py::TestSetRealNameRoute -v
```

Ожидаемый вывод: FAILED (роут ожидает `real_name`, а не три поля).

- [ ] **Step 3: Обновить роут в `backend/app/api/routes/users.py`**

Заменить функцию `set_real_name`:

```python
@router.put("/real-name", response_model=UserResponse)
async def set_real_name(
    body: SetRealNameRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Установить настоящее ФИО пользователя по трём отдельным полям.
    Можно вызвать только один раз — после установки изменить нельзя.
    real_name заполняется автоматически как «Фамилия Имя Отчество».
    """
    if user.real_name is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="ФИО уже установлено и не может быть изменено",
        )
    # Pydantic уже применил .strip() через field_validator(mode="before"),
    # но повторяем явно для соответствия спеку и защиты от будущих изменений
    user.real_last_name  = body.real_last_name.strip()
    user.real_first_name = body.real_first_name.strip()
    user.real_patronymic = body.real_patronymic.strip()
    user.real_name = f"{user.real_last_name} {user.real_first_name} {user.real_patronymic}"
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)
```

- [ ] **Step 4: Запустить тесты — убедиться, что проходят**

```bash
cd backend && pytest tests/test_users.py -v
```

Ожидаемый вывод: все тесты PASSED.

- [ ] **Step 5: Запустить все backend-тесты — убедиться, что ничего не сломалось**

```bash
cd backend && pytest -v
```

Ожидаемый вывод: все существующие тесты PASSED.

- [ ] **Step 6: Коммит**

```bash
cd backend
git add alembic/versions/2026_03_11_add_real_name_parts.py \
        app/models/user.py \
        app/schemas/user.py \
        app/api/routes/users.py \
        tests/test_users.py
git commit -m "feat: разделить ФИО на три поля (фамилия, имя, отчество)"
```

---

## Chunk 2: Frontend

### Task 5: TypeScript-типы — три новых поля в интерфейсе User

**Files:**
- Modify: `frontend/src/types/index.ts`

- [ ] **Step 1: Добавить три поля в интерфейс `User`**

В файле `frontend/src/types/index.ts` в интерфейсе `User` (строки 138-151) после `realName?` добавить:

```typescript
/** Фамилия (паспортные данные) */
realLastName?: string;
/** Имя (паспортные данные, отличается от firstName из Telegram-профиля) */
realFirstName?: string;
/** Отчество (паспортные данные) */
realPatronymic?: string;
```

Результирующий интерфейс `User`:

```typescript
export interface User {
  id: number;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  phone?: string;
  photoUrl?: string;
  /** Настоящее ФИО (заполняется один раз при регистрации) */
  realName?: string;
  /** Фамилия (паспортные данные) */
  realLastName?: string;
  /** Имя (паспортные данные, отличается от firstName из Telegram-профиля) */
  realFirstName?: string;
  /** Отчество (паспортные данные) */
  realPatronymic?: string;
  /** Баланс — количество оставшихся занятий */
  balance: number;
  isAdmin: boolean;
}
```

- [ ] **Step 2: Проверить типы**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -30
```

Ожидаемый вывод: ошибки только в файлах, которые ещё не обновлены (mappers, useAuth, users.ts, RegisterName) — это нормально на данном шаге.

---

### Task 6: Маппинг — два независимых места

**Files:**
- Modify: `frontend/src/api/mappers.ts` (функция `mapUser`)
- Modify: `frontend/src/hooks/useAuth.ts` (функция `mapUserResponse` + константа `MOCK_USER`)

#### Место 1: `mappers.ts`

- [ ] **Step 1: Обновить функцию `mapUser`**

В файле `frontend/src/api/mappers.ts` в функции `mapUser` (строки 107-120) после строки `realName: data.real_name ?? undefined,` добавить:

```typescript
realLastName:   data.real_last_name  ?? undefined,
realFirstName:  data.real_first_name ?? undefined,
realPatronymic: data.real_patronymic ?? undefined,
```

#### Место 2: `useAuth.ts`

- [ ] **Step 2: Обновить `MOCK_USER` — добавить `realName` и три гранулярных поля**

В файле `frontend/src/hooks/useAuth.ts` в константе `MOCK_USER` (строки 8-18) добавить:

```typescript
realName:       'Тест Пользователь Тестович',
realLastName:   'Тест',
realFirstName:  'Пользователь',
realPatronymic: 'Тестович',
```

> **Причина:** без `realName` AppShell перенаправляет на `/register-name` в мок-режиме, ломая локальную разработку.

- [ ] **Step 3: Обновить приватную функцию `mapUserResponse` в `useAuth.ts`**

В функции `mapUserResponse` (строки 23-36) после строки `realName: ...` добавить:

```typescript
realLastName:   (u.real_last_name  as string | null | undefined) ?? undefined,
realFirstName:  (u.real_first_name as string | null | undefined) ?? undefined,
realPatronymic: (u.real_patronymic as string | null | undefined) ?? undefined,
```

> **Почему `?? undefined`, а не `|| undefined`:** параметр `u` имеет тип `Record<string, unknown>`, поэтому прямой каст `as string` небезопасен — `null` превратится в строку `"null"`. Используем `?? undefined`, который корректно обрабатывает `null` и `undefined`.

- [ ] **Step 4: Проверить типы**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -30
```

Ожидаемый вывод: ошибок в `mappers.ts` и `useAuth.ts` больше нет.

---

### Task 7: Хук `useSetRealName` — новый тип payload + Zustand update

**Files:**
- Modify: `frontend/src/api/queries/users.ts`

- [ ] **Step 1: Добавить импорт `useAuthStore`** в начало файла `frontend/src/api/queries/users.ts` (перед остальными импортами из `../../store/`):

```typescript
import { useAuthStore } from '../../store/auth';
```

> **Важно:** импорт добавляется ДО замены тела хука, иначе TypeScript выдаст ошибку на `useAuthStore` в следующем шаге.

- [ ] **Step 2: Обновить хук полностью**

В файле `frontend/src/api/queries/users.ts` заменить функцию `useSetRealName` (строки 49-60):

```typescript
export interface SetRealNamePayload {
  realLastName:  string;
  realFirstName: string;
  realPatronymic: string;
}

/** Установить настоящее ФИО (один раз, без возможности изменения). */
export function useSetRealName() {
  const queryClient = useQueryClient();
  // Явно указываем полный generic <User, Error, SetRealNamePayload>,
  // иначе TypeScript оставит старый <User, Error, string> и выдаст ошибку типов
  return useMutation<User, Error, SetRealNamePayload>({
    mutationFn: async (payload) => {
      const data = await apiClient.put<unknown>('/api/users/real-name', {
        real_last_name:  payload.realLastName,
        real_first_name: payload.realFirstName,
        real_patronymic: payload.realPatronymic,
      });
      return mapUser(data);
    },
    onSuccess: (updatedUser) => {
      // Инвалидируем TanStack Query кэш профиля
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      // КРИТИЧНО: обновляем Zustand auth store напрямую.
      // AppShell читает user.realName из Zustand, а не из TanStack Query.
      // Без этого AppShell зациклится на редиректе /register-name → 409 → loop.
      // Навигация на '/' происходит в компоненте RegisterName (не здесь),
      // чтобы хук не был связан с маршрутизацией.
      const token = useAuthStore.getState().token!;
      useAuthStore.getState().setAuth(updatedUser, token);
    },
  });
}
```

- [ ] **Step 3: Проверить типы**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -30
```

Ожидаемый вывод: ошибок в `queries/users.ts` нет. Остаётся только `RegisterName.tsx`.

---

### Task 8: Страница RegisterName — три поля + обновлённая модалка

**Files:**
- Modify: `frontend/src/pages/RegisterName/RegisterName.tsx`
- Modify: `frontend/src/pages/RegisterName/RegisterName.module.css`

- [ ] **Step 1: Заменить `RegisterName.tsx` полностью**

```typescript
/* Форма ввода настоящего ФИО — три отдельных поля (фамилия, имя, отчество).
   Показывается один раз после онбординга. Двойное подтверждение:
   ввод → модалка «Вы уверены?» → сохранение. */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSetRealName } from '../../api/queries';
import styles from './RegisterName.module.css';

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' },
  }),
};

export default function RegisterName() {
  const navigate = useNavigate();
  const setRealName = useSetRealName();

  const [lastName,   setLastName]   = useState('');
  const [firstName,  setFirstName]  = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const trimmed = {
    last:  lastName.trim(),
    first: firstName.trim(),
    patr:  patronymic.trim(),
  };

  const isValid =
    trimmed.last.length >= 2 &&
    trimmed.first.length >= 2 &&
    trimmed.patr.length >= 2;

  const fullName = `${trimmed.last} ${trimmed.first} ${trimmed.patr}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setRealName.mutate(
      {
        realLastName:  trimmed.last,
        realFirstName: trimmed.first,
        realPatronymic: trimmed.patr,
      },
      {
        onSuccess: () => {
          // Навигация здесь; обновление Zustand происходит внутри хука
          navigate('/', { replace: true });
        },
        onError: (err) => {
          setShowConfirm(false);
          setError(err.message || 'Ошибка сохранения');
        },
      },
    );
  };

  return (
    <div className={styles.page}>
      <motion.form
        className={styles.card}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <img src="/logo-circle.png" alt="Dance Max" className={styles.logo} />

        <h1 className={styles.title}>Регистрация</h1>

        <div className={styles.fields}>
          {([
            { label: 'Фамилия',  value: lastName,   set: setLastName,   autoComplete: 'family-name',     i: 0 },
            { label: 'Имя',      value: firstName,  set: setFirstName,  autoComplete: 'given-name',      i: 1 },
            { label: 'Отчество', value: patronymic, set: setPatronymic, autoComplete: 'additional-name', i: 2 },
          ] as const).map(({ label, value, set, autoComplete, i }) => (
            <motion.div
              key={label}
              className={styles.inputGroup}
              custom={i}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label className={styles.label}>{label}</label>
              <input
                type="text"
                className={styles.input}
                placeholder={label}
                value={value}
                onChange={(e) => set(e.target.value)}
                autoComplete={autoComplete}
                autoFocus={i === 0}
              />
            </motion.div>
          ))}
        </div>

        <p className={styles.hint}>
          Вводите в соответствии с паспортными данными
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={!isValid}
        >
          Готово
        </button>
      </motion.form>

      {/* Модалка двойного подтверждения */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className={styles.confirmOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              className={styles.confirmCard}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={styles.confirmTitle}>Проверьте данные</h2>

              <div className={styles.confirmName}>{fullName}</div>

              <p className={styles.confirmWarning}>
                Нажимая «Подтвердить», вы подтверждаете, что введённые данные
                соответствуют паспортным данным.
              </p>

              <div className={styles.confirmButtons}>
                <button
                  type="button"
                  className={`${styles.confirmBtn} ${styles.btnBack}`}
                  onClick={() => setShowConfirm(false)}
                >
                  Ввести заново
                </button>
                <button
                  type="button"
                  className={`${styles.confirmBtn} ${styles.btnConfirm}`}
                  onClick={handleConfirm}
                  disabled={setRealName.isPending}
                >
                  {setRealName.isPending ? 'Сохраняю...' : 'Подтвердить'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Обновить CSS — удалить `.subtitle`, добавить `.fields` и `.hint`**

В файле `frontend/src/pages/RegisterName/RegisterName.module.css`:

**Удалить** блок `.subtitle` (строки 42-48 — он был нужен для старого однострочного описания, которое заменяется на `.hint`):

```css
/* УДАЛИТЬ этот блок полностью: */
.subtitle {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.5;
}
```

**Добавить** в конец файла:

```css
/* Контейнер для трёх полей ввода */
.fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* Подсказка о паспортных данных */
.hint {
  font-size: 12px;
  color: var(--color-gray-400);
  text-align: center;
  margin-top: 4px;
  margin-bottom: 0;
  line-height: 1.4;
}
```

- [ ] **Step 3: Проверить типы — никаких ошибок**

```bash
cd frontend && npx tsc --noEmit
```

Ожидаемый вывод: 0 errors.

- [ ] **Step 4: Запустить dev-сервер и проверить визуально**

```bash
cd frontend && npm run dev
```

Открыть `http://localhost:5173/register-name` и убедиться:
- три поля появляются по очереди с анимацией
- кнопка «Готово» неактивна пока поля пустые
- при заполнении — кнопка активируется
- нажатие «Готово» → модалка с ФИО и текстом подтверждения
- кнопка «Ввести заново» → закрывает модалку
- кнопка «Подтвердить» → вызывает мутацию

- [ ] **Step 5: Финальный коммит**

```bash
cd frontend
git add src/types/index.ts \
        src/api/mappers.ts \
        src/hooks/useAuth.ts \
        src/api/queries/users.ts \
        src/pages/RegisterName/RegisterName.tsx \
        src/pages/RegisterName/RegisterName.module.css
git commit -m "feat: форма регистрации ФИО — три отдельных поля с подтверждением"
```

- [ ] **Step 6: Коммит документации**

```bash
cd ..
git add docs/superpowers/specs/2026-03-11-register-name-three-fields-design.md \
        docs/superpowers/plans/2026-03-11-register-name-three-fields.md
git commit -m "docs: спек и план — регистрация ФИО в трёх полях"
```
