import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderDetailService } from '../../../services/orderDetail.service';

function orderDetailsKey(orderId: number) {
  return ['orders', 'details', orderId] as const;
}

export function useOrderDetailsQuery(orderId: number | null, enabled: boolean) {
  return useQuery({
    queryKey: orderId != null ? orderDetailsKey(orderId) : ['orders', 'details', 'empty'],
    queryFn: () => orderDetailService.getByOrder(orderId as number),
    enabled: enabled && orderId != null,
  });
}

export function useAddOrderDetailMutation(orderId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      orderDetailService.create({ orderId: orderId as number, productId, quantity }),
    onSuccess: async () => {
      if (orderId != null) {
        await queryClient.invalidateQueries({ queryKey: orderDetailsKey(orderId) });
      }
      await queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
      await queryClient.invalidateQueries({ queryKey: ['orders', 'kitchen', 'tickets'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useRemoveOrderDetailMutation(orderId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (detailId: number) => orderDetailService.remove(detailId),
    onSuccess: async () => {
      if (orderId != null) {
        await queryClient.invalidateQueries({ queryKey: orderDetailsKey(orderId) });
      }
      await queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
      await queryClient.invalidateQueries({ queryKey: ['orders', 'kitchen', 'tickets'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}
