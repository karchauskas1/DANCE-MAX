import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { mapDirection, mapLesson } from '../mappers';
import { queryKeys } from './keys';
import type { Direction, Lesson } from '../../types';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Fetch the list of all dance directions. */
export function useDirections() {
  return useQuery<Direction[]>({
    queryKey: queryKeys.directions.list(),
    queryFn: async () => {
      const data = await apiClient.get<unknown[]>('/api/directions');
      return data.map(mapDirection);
    },
  });
}

/** Returned shape for a single direction page. */
export interface DirectionDetail {
  direction: Direction;
  upcomingLessons: Lesson[];
}

/** Fetch a single direction by slug together with its upcoming lessons. */
export function useDirection(slug: string) {
  return useQuery<DirectionDetail>({
    queryKey: queryKeys.directions.detail(slug),
    queryFn: async () => {
      const data = await apiClient.get<{
        direction: unknown;
        upcoming_lessons: unknown[];
      }>(`/api/directions/${slug}`);
      return {
        direction: mapDirection(data.direction),
        upcomingLessons: data.upcoming_lessons.map(mapLesson),
      };
    },
    enabled: !!slug,
  });
}
