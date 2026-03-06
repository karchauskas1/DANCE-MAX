import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import {
  mapSubscriptionPlanWithPrice,
  type SubscriptionPlanWithPrice,
} from '../mappers';
import { queryKeys } from './keys';

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Получить все доступные тарифные планы (с вычисленной ценой за занятие). */
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

export interface CreateInvoiceParams {
  planId: number;
  promoCode?: string;
}

interface PaymentResponse {
  payment_url: string;
  payment_id: string;
}

/** Создать платёж через ЮКассу. Возвращает URL страницы оплаты. */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, CreateInvoiceParams>({
    mutationFn: async ({ planId, promoCode }) => {
      const body: Record<string, unknown> = { plan_id: planId };
      if (promoCode) body.promo_code = promoCode;
      const data = await apiClient.post<PaymentResponse>(
        '/api/payments/create-invoice',
        body,
      );
      return data.payment_url;
    },
    onSuccess: () => {
      // Инвалидируем баланс и историю — обновятся после оплаты через webhook
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.balance(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.history(),
      });
    },
  });
}
