"""
Валидация Telegram Web App initData.

Telegram передаёт в Web App строку initData, содержащую данные пользователя
и подпись (hash). Сервер обязан проверить подпись, чтобы убедиться,
что данные действительно пришли от Telegram, а не были подделаны.

Алгоритм проверки (согласно документации Telegram):
1. Разбираем initData-строку на пары ключ=значение (URL query string).
2. Извлекаем значение поля "hash" — это подпись от Telegram.
3. Оставшиеся пары (без hash) сортируем по алфавиту по ключу.
4. Формируем data_check_string: пары "ключ=значение", соединённые через "\\n".
5. Вычисляем secret_key = HMAC-SHA256(ключ="WebAppData", сообщение=bot_token).
6. Вычисляем HMAC-SHA256(ключ=secret_key, сообщение=data_check_string).
7. Сравниваем вычисленный хеш с полученным hash из initData.
8. Если совпадают — данные подлинные, возвращаем распарсенные данные пользователя.
"""

import hashlib
import hmac
import json
from typing import Any
from urllib.parse import parse_qs, unquote


def validate_init_data(init_data: str, bot_token: str) -> dict[str, Any] | None:
    """
    Валидация initData от Telegram Web App.

    Параметры:
        init_data: строка initData, переданная из Telegram Web App (URL-encoded).
        bot_token: токен бота для формирования секретного ключа HMAC.

    Возвращает:
        Словарь с данными пользователя при успешной валидации, или None при ошибке.
    """
    try:
        # Шаг 1: Разбираем initData-строку на параметры
        parsed_data: dict[str, list[str]] = parse_qs(init_data)

        # Шаг 2: Извлекаем hash — подпись Telegram, по которой проверяем целостность
        if "hash" not in parsed_data:
            return None
        received_hash: str = parsed_data["hash"][0]

        # Шаг 3: Формируем список пар "ключ=значение" без hash, сортируем по ключу
        # Каждый параметр берём как "ключ=значение" (первое значение из списка)
        data_pairs: list[str] = []
        for key in sorted(parsed_data.keys()):
            if key == "hash":
                continue
            value: str = parsed_data[key][0]
            data_pairs.append(f"{key}={value}")

        # Шаг 4: Соединяем пары через перенос строки — это data_check_string
        data_check_string: str = "\n".join(data_pairs)

        # Шаг 5: Генерируем secret_key через HMAC-SHA256
        # Ключ — строка "WebAppData", сообщение — токен бота
        secret_key: bytes = hmac.new(
            key=b"WebAppData",
            msg=bot_token.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).digest()

        # Шаг 6: Вычисляем HMAC-SHA256 от data_check_string с secret_key
        calculated_hash: str = hmac.new(
            key=secret_key,
            msg=data_check_string.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).hexdigest()

        # Шаг 7: Сравниваем хеши (используем hmac.compare_digest для защиты от timing-атак)
        if not hmac.compare_digest(calculated_hash, received_hash):
            # Подпись не совпала — данные могли быть подделаны
            return None

        # Шаг 8: Извлекаем и парсим данные пользователя из поля "user"
        user_data_raw: str | None = parsed_data.get("user", [None])[0]
        if user_data_raw is None:
            return None

        # Поле user содержит JSON-объект в URL-encoded виде
        user_data: dict[str, Any] = json.loads(unquote(user_data_raw))
        return user_data

    except (json.JSONDecodeError, KeyError, IndexError, ValueError):
        # Ошибка разбора данных — возвращаем None
        return None
