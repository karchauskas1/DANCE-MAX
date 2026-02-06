"""
Конфигурация приложения DanceMax.
Все настройки загружаются из переменных окружения или .env файла.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Настройки приложения, загружаемые из окружения."""

    # Подключение к базе данных PostgreSQL через asyncpg
    DATABASE_URL: str = "postgresql+asyncpg://dancemax:dancemax_secret@localhost:5432/dancemax"

    # Подключение к Redis для кеширования и очередей
    REDIS_URL: str = "redis://localhost:6379"

    # Секретный ключ для подписи JWT-токенов (обязательно сменить в продакшене)
    SECRET_KEY: str = "dev-secret-key-change-in-production"

    # Токен Telegram-бота для валидации initData и отправки уведомлений
    TELEGRAM_BOT_TOKEN: str = ""

    # URL фронтенда Telegram Web App
    TELEGRAM_WEBAPP_URL: str = "http://localhost:5173"

    # Токен платёжного провайдера для Telegram Payments
    PAYMENT_PROVIDER_TOKEN: str = ""

    # JWT-настройки
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 дней — срок жизни токена
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"


# Глобальный экземпляр настроек, используется во всём приложении
settings = Settings()
