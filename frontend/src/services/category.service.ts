import axiosInstance from '../api';
import type { Category } from '../types';

export interface SaveCategoryPayload {
  name: string;
  description: string;
  active: boolean;
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await axiosInstance.get<Category[]>('/categories');
    return data;
  },

  getById: async (id: number): Promise<Category> => {
    const { data } = await axiosInstance.get<Category>(`/categories/${id}`);
    return data;
  },

  create: async (payload: SaveCategoryPayload): Promise<Category> => {
    const { data } = await axiosInstance.post<Category>('/categories', payload);
    return data;
  },

  update: async (id: number, payload: SaveCategoryPayload): Promise<Category> => {
    const { data } = await axiosInstance.put<Category>(`/categories/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/categories/${id}`);
  },
};
