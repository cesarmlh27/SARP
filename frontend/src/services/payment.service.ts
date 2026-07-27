import axiosInstance from '../api';
import type { Payment, PaymentMethod } from '../types';

export const paymentService = {
  getAll: async (): Promise<Payment[]> => {
    const { data } = await axiosInstance.get<Payment[]>('/payments');
    return data;
  },

  create: async (payload: { orderId: number; method: PaymentMethod }): Promise<Payment> => {
    const { data } = await axiosInstance.post<Payment>('/payments', payload);
    return data;
  },

  getByOrder: async (orderId: number): Promise<Payment> => {
    const { data } = await axiosInstance.get<Payment>(`/payments/order/${orderId}`);
    return data;
  },
};
