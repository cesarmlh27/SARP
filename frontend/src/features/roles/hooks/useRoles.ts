import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../../../services/role.service';

const rolesQueryKey = ['roles', 'list'];

export function useRolesQuery() {
  return useQuery({
    queryKey: rolesQueryKey,
    queryFn: roleService.getAll,
  });
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string }) => roleService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rolesQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
}
