import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from './keys';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminDashboardStats {
  todayLessonsCount: number;
  todayStudentsCount: number;
  activeSubscriptionsCount: number;
  monthlyRevenue: number;
  recentBookings: Array<{
    id: number;
    studentName: string;
    directionName: string;
    teacherName: string;
    date: string;
    status: string;
  }>;
  todayLessons: Array<{
    id: number;
    directionName: string;
    directionColor: string;
    teacherName: string;
    startTime: string;
    currentSpots: number;
    maxSpots: number;
  }>;
}

export interface AdminStudent {
  id: number;
  name: string;
  username: string;
  phone: string;
  balance: number;
  totalLessons: number;
  lastVisit: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

/** Fetch admin dashboard stats. */
export function useAdminDashboard() {
  return useQuery<AdminDashboardStats>({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await apiClient.get<any>('/api/admin/dashboard');
      return {
        todayLessonsCount: data.today_lessons_count ?? 0,
        todayStudentsCount: data.today_students_count ?? 0,
        activeSubscriptionsCount: data.active_subscriptions_count ?? 0,
        monthlyRevenue: data.monthly_revenue ?? 0,
        recentBookings: (data.recent_bookings ?? []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (b: any) => ({
            id: b.id,
            studentName: b.student_name ?? '—',
            directionName: b.direction_name ?? '—',
            teacherName: b.teacher_name ?? '—',
            date: b.date ?? '—',
            status: b.status ?? 'active',
          }),
        ),
        todayLessons: (data.today_lessons ?? []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (l: any) => ({
            id: l.id,
            directionName: l.direction_name ?? '—',
            directionColor: l.direction_color ?? '#FF5C35',
            teacherName: l.teacher_name ?? '—',
            startTime: l.start_time ?? '—',
            currentSpots: l.current_spots ?? 0,
            maxSpots: l.max_spots ?? 0,
          }),
        ),
      };
    },
  });
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

/** Fetch the list of all students (admin endpoint). */
export function useAdminStudents() {
  return useQuery<AdminStudent[]>({
    queryKey: queryKeys.admin.students(),
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await apiClient.get<any[]>('/api/admin/students');
      return data.map((s) => ({
        id: s.id,
        name: `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || '—',
        username: s.username ? `@${s.username}` : '—',
        phone: s.phone ?? '—',
        balance: s.balance ?? 0,
        totalLessons: s.total_lessons ?? 0,
        lastVisit: s.last_visit ?? '—',
      }));
    },
  });
}

/** Adjust a student's balance. */
export function useAdjustBalance() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { studentId: number; amount: number; reason: string }
  >({
    mutationFn: async ({ studentId, amount, reason }) => {
      await apiClient.post(`/api/admin/students/${studentId}/balance`, {
        amount,
        reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.students() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.balance() });
    },
  });
}

// ---------------------------------------------------------------------------
// Directions CRUD
// ---------------------------------------------------------------------------

export interface DirectionPayload {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  is_active?: boolean;
  sort_order?: number;
}

export function useCreateDirection() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, DirectionPayload>({
    mutationFn: async (payload) => {
      return apiClient.post('/api/admin/directions', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.directions.all });
    },
  });
}

export function useUpdateDirection() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: number; payload: DirectionPayload }>({
    mutationFn: async ({ id, payload }) => {
      return apiClient.put(`/api/admin/directions/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.directions.all });
    },
  });
}

export function useDeleteDirection() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      return apiClient.delete(`/api/admin/directions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.directions.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Teachers CRUD
// ---------------------------------------------------------------------------

export interface TeacherPayload {
  name: string;
  bio: string;
  experience_years: number;
  photo_url?: string;
  direction_ids: number[];
  is_active?: boolean;
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, TeacherPayload>({
    mutationFn: async (payload) => {
      return apiClient.post('/api/admin/teachers', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: number; payload: TeacherPayload }>({
    mutationFn: async ({ id, payload }) => {
      return apiClient.put(`/api/admin/teachers/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      return apiClient.delete(`/api/admin/teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Courses CRUD
// ---------------------------------------------------------------------------

export interface CoursePayload {
  name: string;
  description: string;
  direction_id?: number;
  teacher_id?: number;
  start_date: string;
  end_date?: string;
  lessons_count: number;
  max_participants: number;
  price: number;
  is_active?: boolean;
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, CoursePayload>({
    mutationFn: async (payload) => {
      return apiClient.post('/api/admin/courses', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: number; payload: CoursePayload }>({
    mutationFn: async ({ id, payload }) => {
      return apiClient.put(`/api/admin/courses/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      return apiClient.delete(`/api/admin/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Promos CRUD
// ---------------------------------------------------------------------------

export interface PromoPayload {
  title: string;
  description: string;
  promo_code: string;
  discount_percent?: number;
  discount_amount?: number;
  valid_from: string;
  valid_until: string;
  is_active?: boolean;
}

export function useCreatePromo() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, PromoPayload>({
    mutationFn: async (payload) => {
      return apiClient.post('/api/admin/promos', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.promos.all });
    },
  });
}

export function useUpdatePromo() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: number; payload: PromoPayload }>({
    mutationFn: async ({ id, payload }) => {
      return apiClient.put(`/api/admin/promos/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.promos.all });
    },
  });
}

export function useDeletePromo() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      return apiClient.delete(`/api/admin/promos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.promos.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Subscriptions (Plans) CRUD
// ---------------------------------------------------------------------------

export interface SubscriptionPayload {
  name: string;
  description?: string;
  lessons_count: number;
  validity_days: number;
  price: number;
  is_popular?: boolean;
  is_active?: boolean;
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, SubscriptionPayload>({
    mutationFn: async (payload) => {
      return apiClient.post('/api/admin/subscriptions', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.plans() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.subscriptions.all,
      });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    Error,
    { id: number; payload: SubscriptionPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      return apiClient.put(`/api/admin/subscriptions/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.plans() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.subscriptions.all,
      });
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      return apiClient.delete(`/api/admin/subscriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.plans() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.subscriptions.all,
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Lessons (Schedule) CRUD
// ---------------------------------------------------------------------------

export interface LessonPayload {
  direction_id: number;
  teacher_id: number;
  date: string;
  start_time: string;
  end_time: string;
  level: string;
  max_spots: number;
}

export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, LessonPayload>({
    mutationFn: async (payload) => {
      return apiClient.post('/api/admin/lessons', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: number; payload: LessonPayload }>({
    mutationFn: async ({ id, payload }) => {
      return apiClient.put(`/api/admin/lessons/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      return apiClient.delete(`/api/admin/lessons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Bookings — Mark attendance
// ---------------------------------------------------------------------------

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { bookingId: number }>({
    mutationFn: async ({ bookingId }) => {
      return apiClient.post(`/api/admin/bookings/${bookingId}/attend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Broadcast
// ---------------------------------------------------------------------------

export interface BroadcastPayload {
  audience: 'all' | 'active_subs' | 'by_direction';
  direction_id?: number;
  message: string;
  schedule_at?: string;
}

export function useSendBroadcast() {
  return useMutation<unknown, Error, BroadcastPayload>({
    mutationFn: async (payload) => {
      return apiClient.post('/api/admin/broadcast', {
        message: payload.message,
        target: payload.audience,
        direction_id: payload.direction_id,
      });
    },
  });
}
