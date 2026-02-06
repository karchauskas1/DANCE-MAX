import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { mapTeacher, mapLesson } from '../mappers';
import { queryKeys } from './keys';
import type { Teacher, Lesson } from '../../types';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Fetch the list of all teachers. */
export function useTeachers() {
  return useQuery<Teacher[]>({
    queryKey: queryKeys.teachers.list(),
    queryFn: async () => {
      const data = await apiClient.get<unknown[]>('/api/teachers');
      return data.map(mapTeacher);
    },
  });
}

/** Returned shape for a single teacher page. */
export interface TeacherDetail {
  teacher: Teacher;
  schedule: Lesson[];
}

/** Fetch a single teacher by slug together with their schedule. */
export function useTeacher(slug: string) {
  return useQuery<TeacherDetail>({
    queryKey: queryKeys.teachers.detail(slug),
    queryFn: async () => {
      const data = await apiClient.get<{
        teacher: unknown;
        schedule: unknown[];
      }>(`/api/teachers/${slug}`);
      return {
        teacher: mapTeacher(data.teacher),
        schedule: data.schedule.map(mapLesson),
      };
    },
    enabled: !!slug,
  });
}
