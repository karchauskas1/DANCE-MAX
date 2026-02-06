import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import {
  mapSubscriptionPlanWithPrice,
  mapSubscription,
  type SubscriptionPlanWithPrice,
} from '../mappers';
import { queryKeys } from './keys';
import type { Subscription } from '../../types';

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all available subscription plans (includes computed pricePerLesson). */
export function usePaymentPlans() {
  return useQuery<SubscriptionPlanWithPrice[]>({
    queryKey: queryKeys.payments.plans(),
    queryFn: async () => {
      const data = await apiClient.get<unknown[]>('/api/payments/plans');
      return data.map(mapSubscriptionPlanWithPrice);
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export interface PurchaseParams {
  planId: number;
  promoCode?: string;
}

/** Purchase a subscription plan. Invalidates balance and history caches. */
export function usePurchase() {
  const queryClient = useQueryClient();

  return useMutation<Subscription, Error, PurchaseParams>({
    mutationFn: async ({ planId, promoCode }) => {
      const body: Record<string, unknown> = { plan_id: planId };
      if (promoCode) body.promo_code = promoCode;
      const data = await apiClient.post<unknown>(
        '/api/payments/create',
        body,
      );
      return mapSubscription(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.balance(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.history(),
      });
    },
  });
}
