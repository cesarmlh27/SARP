import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../../services/order.service';
import type { OrderStatus } from '../../../types';

const ordersQueryKey = ['orders', 'list'];

export function useOrdersQuery(options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: ordersQueryKey,
    queryFn: orderService.getAll,
    refetchInterval: options?.refetchInterval,
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tableId: number) => orderService.create(tableId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['orders', 'kitchen', 'tickets'] });
      await queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => orderService.updateStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['orders', 'kitchen', 'tickets'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useDeleteOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => orderService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['orders', 'kitchen', 'tickets'] });
      await queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}
