import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { mapCourse } from '../mappers';
import { queryKeys } from './keys';
import type { SpecialCourse } from '../../types';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Fetch all special courses. */
export function useCourses() {
  return useQuery<SpecialCourse[]>({
    queryKey: queryKeys.courses.list(),
    queryFn: async () => {
      const data = await apiClient.get<unknown[]>('/api/courses');
      return data.map(mapCourse);
    },
  });
}

/** Fetch a single special course by ID. */
export function useCourse(id: number) {
  return useQuery<SpecialCourse>({
    queryKey: queryKeys.courses.detail(id),
    queryFn: async () => {
      const data = await apiClient.get<unknown>(`/api/courses/${id}`);
      return mapCourse(data);
    },
    enabled: !!id,
  });
}
