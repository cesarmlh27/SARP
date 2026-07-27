import axiosInstance from '../api';
import type { OrderDetail } from '../types';

interface CreateOrderDetailPayload {
  orderId: number;
  productId: number;
  quantity: number;
}

export const orderDetailService = {
  getByOrder: async (orderId: number): Promise<OrderDetail[]> => {
    const { data } = await axiosInstance.get<OrderDetail[]>(`/order-details/order/${orderId}`);
    return data;
  },

  create: async (payload: CreateOrderDetailPayload): Promise<OrderDetail> => {
    const { data } = await axiosInstance.post<OrderDetail>('/order-details', payload);
    return data;
  },

  remove: async (detailId: number): Promise<void> => {
    await axiosInstance.delete(`/order-details/${detailId}`);
  },
};
