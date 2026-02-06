import { ReactNode } from 'react';

// --- Направления танцев ---

export interface Direction {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  imageUrl?: string;
  color: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

// --- Преподаватели ---

export interface Teacher {
  id: number;
  name: string;
  slug: string;
  bio: string;
  photoUrl?: string;
  specializations: string[];
  experienceYears: number;
  isActive: boolean;
  directions: Direction[];
}

// --- Занятия и расписание ---

export type LessonLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';

export interface Lesson {
  id: number;
  direction: Direction;
  teacher: Teacher;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  maxSpots: number;
  currentSpots: number;
  level: LessonLevel;
  isCancelled: boolean;
  cancelReason?: string;
}

export type LessonStatus = 'available' | 'booked' | 'full' | 'past';

// --- Бронирования ---

export type BookingStatus = 'active' | 'cancelled' | 'attended' | 'missed';

export interface Booking {
  id: number;
  lessonId: number;
  lesson: Lesson;
  status: BookingStatus;
  bookedAt: string;
  cancelledAt?: string;
}

// --- Абонементы ---

export interface SubscriptionPlan {
  id: number;
  name: string;
  lessonsCount: number;
  validityDays: number;
  /** Цена в копейках */
  price: number;
  description?: string;
  isPopular?: boolean;
  isActive: boolean;
}

export interface Subscription {
  id: number;
  plan: SubscriptionPlan;
  lessonsRemaining: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

// --- Финансовые операции ---

export type TransactionType = 'purchase' | 'deduction' | 'refund' | 'manual';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: string;
}

// --- Акции и промокоды ---

export interface Promotion {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  promoCode?: string;
  discountPercent?: number;
  discountAmount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

// --- Специальные курсы ---

export interface SpecialCourse {
  id: number;
  name: string;
  description: string;
  direction?: Direction;
  teacher?: Teacher;
  price: number;
  lessonsCount: number;
  startDate: string;
  imageUrl?: string;
  maxParticipants: number;
  currentParticipants: number;
  isActive: boolean;
}

// --- Пользователь ---

export interface User {
  id: number;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  phone?: string;
  photoUrl?: string;
  /** Баланс в копейках */
  balance: number;
}

// --- Навигация ---

export interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
}
