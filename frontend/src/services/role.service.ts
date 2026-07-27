import axiosInstance from '../api';
import type { Role } from '../types';

export const roleService = {
  getAll: async (): Promise<Role[]> => {
    const { data } = await axiosInstance.get<Role[]>('/roles');
    return data;
  },

  create: async (payload: { name: string }): Promise<Role> => {
    const { data } = await axiosInstance.post<Role>('/roles', payload);
    return data;
  },
};
