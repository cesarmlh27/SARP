import axiosInstance from '../api';
import { KitchenTicket, Order, OrderStatus } from '../types';

export const orderService = {
  getAll: async (): Promise<Order[]> => {
    const { data } = await axiosInstance.get<Order[]>('/orders');
    return data;
  },

  getById: async (id: number): Promise<Order> => {
    const { data } = await axiosInstance.get<Order>(`/orders/${id}`);
    return data;
  },

  create: async (tableId: number): Promise<Order> => {
    const { data } = await axiosInstance.post<Order>('/orders', { tableId });
    return data;
  },

  updateStatus: async (id: number, status: OrderStatus): Promise<Order> => {
    const { data } = await axiosInstance.patch<Order>(`/orders/${id}/status`, null, {
      params: { status },
    });
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/orders/${id}`);
  },

  getByStatus: async (status: OrderStatus): Promise<Order[]> => {
    const { data } = await axiosInstance.get<Order[]>(`/orders/status/${status}`);
    return data;
  },

  getByTable: async (tableId: number): Promise<Order[]> => {
    const { data } = await axiosInstance.get<Order[]>(`/orders/table/${tableId}`);
    return data;
  },

  getKitchenTickets: async (): Promise<KitchenTicket[]> => {
    const { data } = await axiosInstance.get<KitchenTicket[]>('/orders/kitchen/tickets');
    return data;
  },
};
