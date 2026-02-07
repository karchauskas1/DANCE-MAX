"""
Агрегация всех роутеров API.
Главный роутер подключает все модули и монтируется в приложение с префиксом /api.
"""

from fastapi import APIRouter

from app.api.routes.admin import router as admin_router
from app.api.routes.auth import router as auth_router
from app.api.routes.bookings import router as bookings_router
from app.api.routes.courses import router as courses_router
from app.api.routes.directions import router as directions_router
from app.api.routes.lessons import router as lessons_router
from app.api.routes.payments import router as payments_router
from app.api.routes.promos import router as promos_router
from app.api.routes.teachers import router as teachers_router
from app.api.routes.users import router as users_router
from app.api.routes.webhook import router as webhook_router

# Главный роутер API — объединяет все модули
api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(lessons_router)
api_router.include_router(bookings_router)
api_router.include_router(directions_router)
api_router.include_router(teachers_router)
api_router.include_router(users_router)
api_router.include_router(payments_router)
api_router.include_router(courses_router)
api_router.include_router(promos_router)
api_router.include_router(admin_router)
api_router.include_router(webhook_router)
