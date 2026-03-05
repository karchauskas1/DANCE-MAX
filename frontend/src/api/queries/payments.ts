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

interface InvoiceResponse {
  invoice_url: string;
}

/** Создать инвойс Telegram Payments. Возвращает invoice_url для WebApp.openInvoice(). */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, CreateInvoiceParams>({
    mutationFn: async ({ planId, promoCode }) => {
      const body: Record<string, unknown> = { plan_id: planId };
      if (promoCode) body.promo_code = promoCode;
      const data = await apiClient.post<InvoiceResponse>(
        '/api/payments/create-invoice',
        body,
      );
      return data.invoice_url;
    },
    onSuccess: () => {
      // Инвалидируем баланс и историю — обновятся после оплаты
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.balance(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.history(),
      });
    },
  });
}
