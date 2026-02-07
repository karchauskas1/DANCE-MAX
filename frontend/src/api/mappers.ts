/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Direction,
  Teacher,
  Lesson,
  Booking,
  User,
  Transaction,
  SubscriptionPlan,
  Subscription,
  SpecialCourse,
  Promotion,
} from '../types';

// ---------------------------------------------------------------------------
// Direction
// ---------------------------------------------------------------------------

/**
 * Maps a backend direction response (both list and full variants) to the
 * frontend `Direction` type. Fields that are absent in the list variant
 * (`description`, `imageUrl`, `isActive`, `sortOrder`) are filled with
 * sensible defaults.
 */
export function mapDirection(data: any): Direction {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description ?? '',
    shortDescription: data.short_description ?? '',
    imageUrl: data.image_url ?? undefined,
    color: data.color ?? '',
    icon: data.icon ?? '',
    isActive: data.is_active ?? true,
    sortOrder: data.sort_order ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Teacher
// ---------------------------------------------------------------------------

/**
 * Maps a backend teacher response (both list and full variants) to the
 * frontend `Teacher` type. Fields absent in the list variant (`bio`,
 * `isActive`, `directions`) are filled with defaults.
 */
export function mapTeacher(data: any): Teacher {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    bio: data.bio ?? '',
    photoUrl: data.photo_url ?? undefined,
    specializations: data.specializations ?? [],
    experienceYears: data.experience_years ?? 0,
    isActive: data.is_active ?? true,
    directions: Array.isArray(data.directions)
      ? data.directions.map(mapDirection)
      : [],
  };
}

// ---------------------------------------------------------------------------
// Lesson
// ---------------------------------------------------------------------------

export function mapLesson(data: any): Lesson {
  return {
    id: data.id,
    direction: mapDirection(data.direction),
    teacher: mapTeacher(data.teacher),
    date: data.date,
    startTime: data.start_time,
    endTime: data.end_time,
    room: data.room ?? '',
    maxSpots: data.max_spots ?? 0,
    currentSpots: data.current_spots ?? 0,
    level: data.level ?? 'all',
    isCancelled: data.is_cancelled ?? false,
    cancelReason: data.cancel_reason ?? undefined,
    isBooked: data.is_booked ?? false,
    bookingId: data.booking_id ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Booking
// ---------------------------------------------------------------------------

export function mapBooking(data: any): Booking {
  return {
    id: data.id,
    lessonId: data.lesson_id ?? data.lesson?.id ?? 0,
    lesson: mapLesson(data.lesson),
    status: data.status,
    bookedAt: data.booked_at,
    cancelledAt: data.cancelled_at ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export function mapUser(data: any): User {
  return {
    id: data.id,
    telegramId: data.telegram_id,
    firstName: data.first_name,
    lastName: data.last_name ?? undefined,
    username: data.username ?? undefined,
    phone: data.phone ?? undefined,
    photoUrl: data.photo_url ?? undefined,
    balance: data.balance ?? 0,
    isAdmin: data.is_admin ?? false,
  };
}

// ---------------------------------------------------------------------------
// Transaction
// ---------------------------------------------------------------------------

export function mapTransaction(data: any): Transaction {
  return {
    id: data.id,
    type: data.type,
    amount: data.amount,
    description: data.description ?? '',
    createdAt: data.created_at,
  };
}

// ---------------------------------------------------------------------------
// SubscriptionPlan
// ---------------------------------------------------------------------------

export function mapSubscriptionPlan(data: any): SubscriptionPlan {
  return {
    id: data.id,
    name: data.name,
    lessonsCount: data.lessons_count,
    validityDays: data.validity_days,
    price: data.price,
    description: data.description ?? undefined,
    isPopular: data.is_popular ?? undefined,
    isActive: data.is_active ?? true,
  };
}

/**
 * Extended plan type that includes the computed `pricePerLesson` field
 * returned by the payments/plans endpoint.
 */
export interface SubscriptionPlanWithPrice extends SubscriptionPlan {
  pricePerLesson: number;
}

export function mapSubscriptionPlanWithPrice(
  data: any,
): SubscriptionPlanWithPrice {
  return {
    ...mapSubscriptionPlan(data),
    pricePerLesson: data.price_per_lesson ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

export function mapSubscription(data: any): Subscription {
  return {
    id: data.id,
    plan: mapSubscriptionPlan(data.plan),
    lessonsRemaining: data.lessons_remaining,
    startsAt: data.starts_at,
    expiresAt: data.expires_at,
    isActive: data.is_active ?? true,
  };
}

// ---------------------------------------------------------------------------
// SpecialCourse
// ---------------------------------------------------------------------------

export function mapCourse(data: any): SpecialCourse {
  return {
    id: data.id,
    name: data.name,
    description: data.description ?? '',
    direction: data.direction ? mapDirection(data.direction) : undefined,
    teacher: data.teacher ? mapTeacher(data.teacher) : undefined,
    price: data.price,
    lessonsCount: data.lessons_count,
    startDate: data.start_date,
    imageUrl: data.image_url ?? undefined,
    maxParticipants: data.max_participants ?? 0,
    currentParticipants: data.current_participants ?? 0,
    spotsLeft: data.spots_left ?? 0,
    isActive: data.is_active ?? true,
  };
}

// ---------------------------------------------------------------------------
// Promotion
// ---------------------------------------------------------------------------

export function mapPromotion(data: any): Promotion {
  return {
    id: data.id,
    title: data.title,
    description: data.description ?? '',
    imageUrl: data.image_url ?? undefined,
    promoCode: data.promo_code ?? undefined,
    discountPercent: data.discount_percent ?? undefined,
    discountAmount: data.discount_amount ?? undefined,
    validFrom: data.valid_from,
    validUntil: data.valid_until,
    isActive: data.is_active ?? true,
  };
}
