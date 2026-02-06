/**
 * Centralised query-key factory for TanStack React Query.
 *
 * Every key is a readonly tuple so that `queryClient.invalidateQueries` can
 * match by prefix. For example, invalidating `queryKeys.lessons.all` will
 * also invalidate `queryKeys.lessons.today()` and `queryKeys.lessons.list(...)`.
 */
export const queryKeys = {
  // ---- Lessons ----
  lessons: {
    all: ['lessons'] as const,
    today: () => ['lessons', 'today'] as const,
    list: (params: Record<string, unknown>) =>
      ['lessons', 'list', params] as const,
    detail: (id: number) => ['lessons', 'detail', id] as const,
  },

  // ---- Directions ----
  directions: {
    all: ['directions'] as const,
    list: () => ['directions', 'list'] as const,
    detail: (slug: string) => ['directions', 'detail', slug] as const,
  },

  // ---- Teachers ----
  teachers: {
    all: ['teachers'] as const,
    list: () => ['teachers', 'list'] as const,
    detail: (slug: string) => ['teachers', 'detail', slug] as const,
  },

  // ---- Courses ----
  courses: {
    all: ['courses'] as const,
    list: () => ['courses', 'list'] as const,
    detail: (id: number) => ['courses', 'detail', id] as const,
  },

  // ---- Bookings ----
  bookings: {
    all: ['bookings'] as const,
    my: (status?: string) => ['bookings', 'my', { status }] as const,
  },

  // ---- Users ----
  users: {
    profile: () => ['users', 'profile'] as const,
    balance: () => ['users', 'balance'] as const,
    history: (offset?: number, limit?: number) =>
      ['users', 'history', { offset, limit }] as const,
  },

  // ---- Payments ----
  payments: {
    plans: () => ['payments', 'plans'] as const,
  },

  // ---- Promos ----
  promos: {
    all: ['promos'] as const,
    list: () => ['promos', 'list'] as const,
  },
} as const;
