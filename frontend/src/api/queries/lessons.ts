import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { mapLesson } from '../mappers';
import { queryKeys } from './keys';
import type { Lesson } from '../../types';

// ---------------------------------------------------------------------------
// Params
// ---------------------------------------------------------------------------

export interface LessonsParams {
  date?: string;
  directionId?: number;
  teacherId?: number;
  level?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildLessonsQueryString(params: LessonsParams): string {
  const searchParams = new URLSearchParams();
  if (params.date) searchParams.set('date', params.date);
  if (params.directionId)
    searchParams.set('direction_id', String(params.directionId));
  if (params.teacherId)
    searchParams.set('teacher_id', String(params.teacherId));
  if (params.level) searchParams.set('level', params.level);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Fetch today's lessons. */
export function useTodayLessons() {
  return useQuery<Lesson[]>({
    queryKey: queryKeys.lessons.today(),
    queryFn: async () => {
      const data = await apiClient.get<unknown[]>('/api/lessons/today');
      return data.map(mapLesson);
    },
  });
}

/** Fetch lessons with optional filters (date, direction, teacher, level). */
export function useLessons(params: LessonsParams = {}) {
  return useQuery<Lesson[]>({
    queryKey: queryKeys.lessons.list(params as Record<string, unknown>),
    queryFn: async () => {
      const qs = buildLessonsQueryString(params);
      const data = await apiClient.get<unknown[]>(`/api/lessons${qs}`);
      return data.map(mapLesson);
    },
  });
}

/** Fetch a single lesson by its ID (includes full direction & teacher data). */
export function useLessonDetail(id: number) {
  return useQuery<Lesson>({
    queryKey: queryKeys.lessons.detail(id),
    queryFn: async () => {
      const data = await apiClient.get<unknown>(`/api/lessons/${id}`);
      return mapLesson(data);
    },
    enabled: !!id,
  });
}
