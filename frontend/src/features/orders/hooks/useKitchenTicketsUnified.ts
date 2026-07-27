import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../../services/order.service';
import { KitchenTicket } from '../../../types';

const kitchenTicketsQueryKey = ['orders', 'kitchen', 'tickets'];

export function useKitchenTicketsUnifiedQuery() {
  return useQuery({
    queryKey: kitchenTicketsQueryKey,
    queryFn: (): Promise<KitchenTicket[]> => orderService.getKitchenTickets(),
    refetchInterval: 10000,
  });
}
