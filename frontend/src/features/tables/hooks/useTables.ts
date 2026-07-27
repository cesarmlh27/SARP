import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tableService } from '../../../services/table.service';
import { TableStatus, type RestaurantTable } from '../../../types';

export interface SaveTablePayload {
  tableNumber: number;
  capacity: number;
}

const tablesQueryKey = ['tables', 'list'];

export function useTablesQuery() {
  return useQuery({
    queryKey: tablesQueryKey,
    queryFn: tableService.getAll,
  });
}

export function useCreateTableMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveTablePayload) => tableService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tablesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useUpdateTableMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SaveTablePayload }) => tableService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tablesQueryKey });
    },
  });
}

export function useDeleteTableMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tableService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tablesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useChangeTableStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TableStatus }) => tableService.changeStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tablesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useAvailableTablesQuery(enabled: boolean) {
  return useQuery<RestaurantTable[]>({
    queryKey: ['tables', 'available'],
    queryFn: () => tableService.getByStatus(TableStatus.AVAILABLE),
    enabled,
  });
}
