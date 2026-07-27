import axiosInstance from '../api';
import type { User } from '../types';

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleName: string;
}

interface UpdatePayload {
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  roleId: number;
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await axiosInstance.get<User[]>('/users');
    return data;
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    const { data } = await axiosInstance.post<User>('/auth/register', payload);
    return data;
  },

  update: async (id: number, payload: UpdatePayload): Promise<User> => {
    const { data } = await axiosInstance.put<User>(`/users/${id}`, {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      enabled: payload.enabled,
      role: { id: payload.roleId },
    });
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },
};
