import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { mapUser, mapTransaction, mapSubscription } from '../mappers';
import { queryKeys } from './keys';
import type { User, Transaction, Subscription } from '../../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BalanceInfo {
  balance: number;
  activeSubscriptions: Subscription[];
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Fetch the current user's profile. */
export function useProfile() {
  return useQuery<User>({
    queryKey: queryKeys.users.profile(),
    queryFn: async () => {
      const data = await apiClient.get<unknown>('/api/users/profile');
      return mapUser(data);
    },
  });
}

/** Fetch the current user's balance together with their active subscriptions. */
export function useBalance() {
  return useQuery<BalanceInfo>({
    queryKey: queryKeys.users.balance(),
    queryFn: async () => {
      const data = await apiClient.get<{
        balance: number;
        active_subscriptions: unknown[];
      }>('/api/users/balance');
      return {
        balance: data.balance,
        activeSubscriptions: data.active_subscriptions.map(mapSubscription),
      };
    },
  });
}

/** Fetch the current user's transaction history with pagination. */
export function useHistory(offset?: number, limit?: number) {
  return useQuery<Transaction[]>({
    queryKey: queryKeys.users.history(offset, limit),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (offset !== undefined) params.set('offset', String(offset));
      if (limit !== undefined) params.set('limit', String(limit));
      const qs = params.toString();
      const url = `/api/users/history${qs ? `?${qs}` : ''}`;
      const data = await apiClient.get<unknown[]>(url);
      return data.map(mapTransaction);
    },
  });
}
