"""
Реестр всех Pydantic-схем Dance Max.
"""

from app.schemas.auth import AuthResponse, TelegramAuthRequest
from app.schemas.booking import BookingCreateRequest, BookingResponse
from app.schemas.course import SpecialCourseResponse
from app.schemas.direction import DirectionListResponse, DirectionResponse
from app.schemas.lesson import LessonDetailResponse, LessonResponse
from app.schemas.promotion import (
    PromoValidateRequest,
    PromoValidateResponse,
    PromotionResponse,
)
from app.schemas.subscription import (
    PurchaseRequest,
    SubscriptionPlanResponse,
    SubscriptionResponse,
)
from app.schemas.teacher import TeacherListResponse, TeacherResponse
from app.schemas.transaction import TransactionResponse
from app.schemas.user import UserBalanceResponse, UserBase, UserResponse

__all__: list[str] = [
    "UserBase",
    "UserResponse",
    "UserBalanceResponse",
    "TelegramAuthRequest",
    "AuthResponse",
    "DirectionResponse",
    "DirectionListResponse",
    "TeacherResponse",
    "TeacherListResponse",
    "LessonResponse",
    "LessonDetailResponse",
    "BookingCreateRequest",
    "BookingResponse",
    "SubscriptionPlanResponse",
    "SubscriptionResponse",
    "PurchaseRequest",
    "TransactionResponse",
    "PromotionResponse",
    "PromoValidateRequest",
    "PromoValidateResponse",
    "SpecialCourseResponse",
]
