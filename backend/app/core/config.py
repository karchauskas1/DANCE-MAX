"""
Конфигурация приложения DanceMax.
Все настройки загружаются из переменных окружения или .env файла.
"""

from pydantic import model_validator
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

    # URL бэкенда (для установки webhook Telegram)
    BACKEND_URL: str = "http://localhost:8000"

    # Токен платёжного провайдера для Telegram Payments
    PAYMENT_PROVIDER_TOKEN: str = ""

    # ID администраторов (через запятую: "308477378,123456789")
    ADMIN_IDS: str = "308477378"

    # Разрешённые origins для CORS (через запятую)
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Sentry DSN для мониторинга ошибок (пустая строка = отключён)
    SENTRY_DSN: str = ""

    # JWT-настройки
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 дней — срок жизни токена
    ALGORITHM: str = "HS256"

    @model_validator(mode="after")
    def _fix_database_url(self) -> "Settings":
        """Neon/Vercel даёт postgresql://, а SQLAlchemy async нужен postgresql+asyncpg://.
        Также asyncpg не понимает sslmode — заменяем на ssl."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        # asyncpg использует параметр ssl вместо sslmode
        url = url.replace("sslmode=", "ssl=")
        self.DATABASE_URL = url
        return self

    class Config:
        env_file = ".env"


# Глобальный экземпляр настроек, используется во всём приложении
settings = Settings()
