import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { mapUser, mapTransaction, mapSubscription } from '../mappers';
import { queryKeys } from './keys';
import { useAuthStore } from '../../store/auth';
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

export interface SetRealNamePayload {
  realLastName:  string;
  realFirstName: string;
  realPatronymic: string;
}

/** Установить настоящее ФИО (один раз, без возможности изменения). */
export function useSetRealName() {
  const queryClient = useQueryClient();
  // Явно указываем полный generic <User, Error, SetRealNamePayload>,
  // иначе TypeScript оставит старый <User, Error, string> и выдаст ошибку типов
  return useMutation<User, Error, SetRealNamePayload>({
    mutationFn: async (payload) => {
      const data = await apiClient.put<unknown>('/api/users/real-name', {
        real_last_name:  payload.realLastName,
        real_first_name: payload.realFirstName,
        real_patronymic: payload.realPatronymic,
      });
      return mapUser(data);
    },
    onSuccess: (updatedUser) => {
      // Инвалидируем TanStack Query кэш профиля
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      // КРИТИЧНО: обновляем Zustand auth store напрямую.
      // AppShell читает user.realName из Zustand, а не из TanStack Query.
      // Без этого AppShell зациклится на редиректе /register-name → 409 → loop.
      // Навигация на '/' происходит в компоненте RegisterName (не здесь),
      // чтобы хук не был связан с маршрутизацией.
      const token = useAuthStore.getState().token!;
      useAuthStore.getState().setAuth(updatedUser, token);
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
