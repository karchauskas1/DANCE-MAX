// Query keys
export { queryKeys } from './keys';

// Lessons
export { useTodayLessons, useLessons, useLessonDetail } from './lessons';
export type { LessonsParams } from './lessons';

// Directions
export { useDirections, useDirection } from './directions';
export type { DirectionDetail } from './directions';

// Teachers
export { useTeachers, useTeacher } from './teachers';
export type { TeacherDetail } from './teachers';

// Courses
export { useCourses, useCourse } from './courses';

// Bookings
export { useMyBookings, useCreateBooking, useCancelBooking } from './bookings';

// Users
export { useProfile, useBalance, useHistory } from './users';
export type { BalanceInfo } from './users';

// Payments
export { usePaymentPlans, usePurchase } from './payments';
export type { PurchaseParams } from './payments';

// Promos
export { usePromotions, useValidatePromo } from './promos';
export type { ValidatePromoParams, ValidatePromoResult } from './promos';

// Admin
export {
  // Dashboard
  useAdminDashboard,
  // Students
  useAdminStudents,
  useAdjustBalance,
  // Directions CRUD
  useCreateDirection,
  useUpdateDirection,
  useDeleteDirection,
  // Teachers CRUD
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
  // Courses CRUD
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  // Promos CRUD
  useCreatePromo,
  useUpdatePromo,
  useDeletePromo,
  // Subscriptions CRUD
  useCreateSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
  // Lessons (Schedule) CRUD
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  // Bookings
  useMarkAttendance,
  // Broadcast
  useSendBroadcast,
} from './admin';
export type {
  AdminDashboardStats,
  AdminStudent,
  DirectionPayload,
  TeacherPayload,
  CoursePayload,
  PromoPayload,
  SubscriptionPayload,
  LessonPayload,
  BroadcastPayload,
} from './admin';
