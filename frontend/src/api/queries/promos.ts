import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../client';
import { mapPromotion } from '../mappers';
import { queryKeys } from './keys';
import type { Promotion } from '../../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidatePromoParams {
  code: string;
  planId: number;
}

export interface ValidatePromoResult {
  valid: boolean;
  discountPercent?: number;
  discountAmount?: number;
  message?: string;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all active promotions. */
export function usePromotions() {
  return useQuery<Promotion[]>({
    queryKey: queryKeys.promos.list(),
    queryFn: async () => {
      const data = await apiClient.get<unknown[]>('/api/promos');
      return data.map(mapPromotion);
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Validate a promo code against a specific plan. */
export function useValidatePromo() {
  return useMutation<ValidatePromoResult, Error, ValidatePromoParams>({
    mutationFn: async ({ code, planId }) => {
      const data = await apiClient.post<{
        valid: boolean;
        discount_percent?: number;
        discount_amount?: number;
        message?: string;
      }>('/api/promos/validate', {
        code,
        plan_id: planId,
      });
      return {
        valid: data.valid,
        discountPercent: data.discount_percent,
        discountAmount: data.discount_amount,
        message: data.message,
      };
    },
  });
}
