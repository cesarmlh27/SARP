import axiosInstance from '../api';
import { RestaurantTable, TableStatus } from '../types';

export const tableService = {
  getAll: async (): Promise<RestaurantTable[]> => {
    const { data } = await axiosInstance.get<RestaurantTable[]>('/tables');
    return data;
  },

  getById: async (id: number): Promise<RestaurantTable> => {
    const { data } = await axiosInstance.get<RestaurantTable>(`/tables/${id}`);
    return data;
  },

  create: async (table: Omit<RestaurantTable, 'id' | 'status'>): Promise<RestaurantTable> => {
    const { data } = await axiosInstance.post<RestaurantTable>('/tables', table);
    return data;
  },

  update: async (id: number, table: Omit<RestaurantTable, 'id' | 'status'>): Promise<RestaurantTable> => {
    const { data } = await axiosInstance.put<RestaurantTable>(`/tables/${id}`, table);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/tables/${id}`);
  },

  changeStatus: async (id: number, status: TableStatus): Promise<RestaurantTable> => {
    const { data } = await axiosInstance.patch<RestaurantTable>(`/tables/${id}/status`, null, {
      params: { status },
    });
    return data;
  },

  getByStatus: async (status: TableStatus): Promise<RestaurantTable[]> => {
    const { data } = await axiosInstance.get<RestaurantTable[]>(`/tables/status/${status}`);
    return data;
  },
};
