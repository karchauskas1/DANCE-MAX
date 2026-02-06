import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { mapBooking } from '../mappers';
import { queryKeys } from './keys';
import type { Booking } from '../../types';

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch the current user's bookings, optionally filtered by status. */
export function useMyBookings(status?: string) {
  return useQuery<Booking[]>({
    queryKey: queryKeys.bookings.my(status),
    queryFn: async () => {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      const data = await apiClient.get<unknown[]>(
        `/api/bookings/my${qs}`,
      );
      return data.map(mapBooking);
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new booking for a lesson. Invalidates lessons, bookings and balance caches. */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, { lessonId: number }>({
    mutationFn: async ({ lessonId }) => {
      const data = await apiClient.post<unknown>('/api/bookings', {
        lesson_id: lessonId,
      });
      return mapBooking(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.balance(),
      });
    },
  });
}

/** Cancel an existing booking. Invalidates lessons, bookings and balance caches. */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, { bookingId: number }>({
    mutationFn: async ({ bookingId }) => {
      const data = await apiClient.delete<unknown>(
        `/api/bookings/${bookingId}`,
      );
      return mapBooking(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.balance(),
      });
    },
  });
}
