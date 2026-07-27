import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productService, type SaveProductPayload } from '../../../services/product.service';

const productsQueryKey = ['products', 'list'];

export function useProductsQuery() {
  return useQuery({
    queryKey: productsQueryKey,
    queryFn: productService.getAll,
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveProductPayload) => productService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SaveProductPayload }) => productService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useUploadProductImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => productService.uploadImage(id, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
  });
}
