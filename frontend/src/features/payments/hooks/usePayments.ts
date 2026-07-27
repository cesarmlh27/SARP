import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../../../services/payment.service';
import { type PaymentMethod } from '../../../types';

const paymentsQueryKey = ['payments', 'list'];

export function usePaymentsQuery() {
  return useQuery({
    queryKey: paymentsQueryKey,
    queryFn: paymentService.getAll,
  });
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { orderId: number; method: PaymentMethod }) => paymentService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: paymentsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
      await queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}
