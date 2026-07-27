import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../../services/user.service';

const usersQueryKey = ['users', 'list'];

interface RegisterUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleName: string;
}

interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  roleId: number;
}

export function useUsersQuery() {
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: userService.getAll,
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterUserPayload) => userService.register(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) => userService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}
