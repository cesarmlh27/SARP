import axiosInstance from '../api';
import { Product } from '../types';

export interface SaveProductPayload {
  name: string;
  description: string;
  price: number;
  active: boolean;
  categoryId: number;
}

function toProductRequestPayload(payload: SaveProductPayload) {
  return {
    name: payload.name,
    description: payload.description,
    price: payload.price,
    active: payload.active,
    category: {
      id: payload.categoryId,
    },
  };
}

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await axiosInstance.get<Product[]>('/products');
    return data;
  },

  getById: async (id: number): Promise<Product> => {
    const { data } = await axiosInstance.get<Product>(`/products/${id}`);
    return data;
  },

  create: async (payload: SaveProductPayload): Promise<Product> => {
    const { data } = await axiosInstance.post<Product>('/products', toProductRequestPayload(payload));
    return data;
  },

  update: async (id: number, payload: SaveProductPayload): Promise<Product> => {
    const { data } = await axiosInstance.put<Product>(`/products/${id}`, toProductRequestPayload(payload));
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`);
  },

  uploadImage: async (id: number, file: File): Promise<Product> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await axiosInstance.post<Product>(`/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  getImage: (id: number, imagePath?: string): string => {
    const version = imagePath ? encodeURIComponent(imagePath) : Date.now().toString();
    return `${axiosInstance.defaults.baseURL}/products/${id}/image?v=${version}`;
  },
};
