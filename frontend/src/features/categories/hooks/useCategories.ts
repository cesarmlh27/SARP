import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService, type SaveCategoryPayload } from '../../../services/category.service';

const categoriesQueryKey = ['categories', 'list'];

export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: categoryService.getAll,
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveCategoryPayload) => categoryService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SaveCategoryPayload }) => categoryService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}
