import type { User } from './index';

// --- Базовые типы ответов API ---

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  page: number;
  perPage: number;
}

// --- Авторизация ---

export interface AuthRequest {
  initData: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// --- Бронирование занятий ---

export interface BookingCreateRequest {
  lessonId: number;
}

// --- Фильтры расписания ---

export interface ScheduleQuery {
  date?: string;
  directionId?: number;
  teacherId?: number;
  level?: string;
}

// --- Валидация промокодов ---

export interface PromoValidateRequest {
  code: string;
  planId: number;
}

export interface PromoValidateResponse {
  valid: boolean;
  discountPercent?: number;
  discountAmount?: number;
}
