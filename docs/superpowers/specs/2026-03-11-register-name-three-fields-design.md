# Дизайн: Регистрация ФИО в трёх отдельных полях

**Дата:** 2026-03-11
**Статус:** Approved

---

## Контекст

При первом входе пользователя в приложение Dance Max необходимо запросить настоящее ФИО в соответствии с паспортными данными. Это нужно для записи на занятия и идентификации студента. Ранее использовалось одно текстовое поле — теперь переходим на три отдельных поля (фамилия, имя, отчество), чтобы бот мог однозначно определить каждую часть имени.

---

## Пользовательский сценарий

1. Пользователь впервые открывает Mini App через Telegram.
2. После онбординга попадает на `/register-name`.
3. Видит три поля: **Фамилия**, **Имя**, **Отчество**.
4. Подсказка: _«Вводите в соответствии с паспортными данными»_.
5. Нажимает кнопку **«Готово»**.
6. Открывается модальное окно подтверждения с полным именем.
7. Текст: _«Нажимая «Подтвердить», вы подтверждаете, что введённые данные соответствуют паспортным данным»_.
8. Кнопки: **«Ввести заново»** (закрыть модалку) и **«Подтвердить»** (сохранить и перейти на главную).

---

## Изменения по слоям

### 1. База данных (Alembic-миграция)

Новый файл миграции добавляет три колонки в таблицу `users`.

**upgrade:**
```sql
ALTER TABLE users ADD COLUMN real_last_name  VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN real_first_name VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN real_patronymic VARCHAR(100) NULL;
```

**downgrade** (обязательно для production rollback):
```sql
ALTER TABLE users DROP COLUMN real_last_name;
ALTER TABLE users DROP COLUMN real_first_name;
ALTER TABLE users DROP COLUMN real_patronymic;
```

Поле `real_name` (VARCHAR 200) **остаётся** для обратной совместимости. Значение в нём будет автоматически заполняться как `"<last_name> <first_name> <patronymic>"` при сохранении трёх новых полей.

### 2. Backend: модель User

Добавить в `backend/app/models/user.py` три поля после `real_name`:

```python
real_last_name:  Mapped[str | None] = mapped_column(String(100), nullable=True)
real_first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
real_patronymic: Mapped[str | None] = mapped_column(String(100), nullable=True)
```

`real_name` остаётся как совокупное поле для обратной совместимости.

### 3. Backend: схемы Pydantic

**`SetRealNameRequest`** → заменяем `real_name: str` на три поля:

```python
class SetRealNameRequest(BaseModel):
    real_last_name:  str   # Фамилия
    real_first_name: str   # Имя
    real_patronymic: str   # Отчество (обязательное)
```

Валидация каждого поля через `@field_validator`:
- `.strip()` перед валидацией
- min 2, max 100 символов
- паттерн: `^[А-ЯЁа-яёA-Za-z\- ]+$` (только буквы кириллицы/латиницы, дефис, пробел — цифры запрещены)

**`UserResponse`** → добавить три новых поля рядом с `real_name`:
```python
real_last_name:  str | None = None
real_first_name: str | None = None
real_patronymic: str | None = None
```

### 4. Backend: роут `/api/users/real-name`

Логика проверки: `user.real_name is not None` → 409.
При сохранении:
```python
user.real_last_name  = body.real_last_name.strip()
user.real_first_name = body.real_first_name.strip()
user.real_patronymic = body.real_patronymic.strip()
user.real_name = f"{user.real_last_name} {user.real_first_name} {user.real_patronymic}"
```

### 5. Frontend: типы (`types/index.ts`)

Добавить в интерфейс `User`:
```ts
realLastName?:  string;
realFirstName?: string;
realPatronymic?: string;
```

> Примечание: `firstName`/`lastName` в типе `User` — это данные из Telegram-профиля. Новые поля `realLastName`/`realFirstName`/`realPatronymic` — паспортные данные. Конфликта нет.

### 6. Frontend: маппинг — два отдельных места

**Место 1 — `frontend/src/api/mappers.ts`**, функция `mapUser` (строки 107-120), добавить:
```ts
realLastName:   data.real_last_name  ?? undefined,
realFirstName:  data.real_first_name ?? undefined,
realPatronymic: data.real_patronymic ?? undefined,
```

**Место 2 — `frontend/src/hooks/useAuth.ts`**, приватная функция `mapUserResponse` (строки 23-36) — это **отдельная копия**, не связанная с `mapUser`, обновляется независимо:
```ts
realLastName:   (u.real_last_name  as string) || undefined,
realFirstName:  (u.real_first_name as string) || undefined,
realPatronymic: (u.real_patronymic as string) || undefined,
```

**Также в том же файле** — обновить константу `MOCK_USER`, добавить все новые поля:
```ts
realName:       'Тест Пользователь Тестович',
realLastName:   'Тест',
realFirstName:  'Пользователь',
realPatronymic: 'Тестович',
```
Без `realName` AppShell зациклится на редиректе. Без трёх гранулярных полей компоненты, читающие `user.realFirstName`, получат `undefined` в дев-режиме.

### 7. Frontend: хук `useSetRealName` (`api/queries/users.ts`)

Изменить тип мутации с `string` на объект. Полная сигнатура хука:
```ts
interface SetRealNamePayload {
  realLastName:  string;
  realFirstName: string;
  realPatronymic: string;
}

export function useSetRealName() {
  const queryClient = useQueryClient();
  // Явно указываем <User, Error, SetRealNamePayload> — без этого TypeScript
  // оставит старый generic <User, Error, string> и даст ошибку типов
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
      // Инвалидируем TanStack Query кэш
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      // КРИТИЧНО: обновляем Zustand auth store, иначе AppShell зациклится
      // (AppShell читает user.realName из Zustand, не из TanStack Query)
      const token = useAuthStore.getState().token!;
      useAuthStore.getState().setAuth(updatedUser, token);
      // Навигация на '/' происходит в компоненте RegisterName через его
      // собственный onSuccess callback — НЕ здесь, чтобы не связывать хук с маршрутизацией
    },
  });
}
```

### 8. Frontend: страница `RegisterName.tsx`

Заменяем одно поле на три:
- `<input>` Фамилия (`autoComplete="family-name"`)
- `<input>` Имя (`autoComplete="given-name"`)
- `<input>` Отчество (`autoComplete="additional-name"`)

Состояние: три отдельных `useState` строки.

Подсказка под полями: _«Вводите в соответствии с паспортными данными»_

Кнопка: **«Готово»** (disabled пока хотя бы одно поле пустое или <2 символов после trim)

Модальное подтверждение:
- Заголовок: **«Проверьте данные»**
- Отображение: `"<Фамилия> <Имя> <Отчество>"`
- Текст: _«Нажимая «Подтвердить», вы подтверждаете, что введённые данные соответствуют паспортным данным»_
- Кнопка 1: **«Ввести заново»** → закрыть модалку
- Кнопка 2: **«Подтвердить»** → вызвать мутацию. В `onSuccess` компонента (не хука) — `navigate('/', { replace: true })`. Хук обновляет стор, страница делает навигацию — два независимых `onSuccess`.

---

## Анимации

Следуем уже установленному паттерну в проекте:
- Форма: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`
- Поля появляются с staggerChildren: 0.08 (три поля появляются по очереди)
- Модалка: backdrop fade + spring scale (как в текущей реализации)

---

## Обратная совместимость

- Пользователи, у которых `real_name` уже заполнен (старый строковый формат), не попадают на `/register-name` — AppShell проверяет `user.realName` и редиректит только при `null/undefined`.
- Три новых поля у таких пользователей будут `NULL` — это нормально, данные не теряются.

---

## Файлы, которые меняются

| Файл | Действие |
|------|----------|
| `backend/alembic/versions/2026_03_11_add_real_name_parts.py` | Создать |
| `backend/app/models/user.py` | Обновить |
| `backend/app/schemas/user.py` | Обновить |
| `backend/app/api/routes/users.py` | Обновить |
| `frontend/src/types/index.ts` | Обновить |
| `frontend/src/api/mappers.ts` | Обновить |
| `frontend/src/hooks/useAuth.ts` | Обновить (mapUserResponse + MOCK_USER) |
| `frontend/src/api/queries/users.ts` | Обновить |
| `frontend/src/pages/RegisterName/RegisterName.tsx` | Обновить |
| `frontend/src/pages/RegisterName/RegisterName.module.css` | Обновить (стили для трёх полей) |
