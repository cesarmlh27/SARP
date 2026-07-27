import axiosInstance from '../api';
import { DashboardStats } from '../types';

type DashboardItemRaw = {
  id?: number | string;
  name?: string;
  totalSold?: number | string;
  total_sold?: number | string;
};

interface DashboardRawResponse {
  salesToday?: number;
  salesThisMonth?: number;
  totalRevenue?: number;
  activeOrders?: number;
  occupiedTables?: number;
  topProducts?: DashboardItemRaw[];
  topCategories?: DashboardItemRaw[];
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeItems(items: DashboardItemRaw[] | undefined) {
  return (items ?? []).map((item, index) => ({
    id: toNumber(item.id ?? index),
    name: item.name ?? 'Sin nombre',
    totalSold: toNumber(item.totalSold ?? item.total_sold),
  }));
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await axiosInstance.get<DashboardRawResponse>('/dashboard');

    return {
      salesToday: toNumber(data.salesToday),
      salesThisMonth: toNumber(data.salesThisMonth),
      totalRevenue: toNumber(data.totalRevenue),
      activeOrders: toNumber(data.activeOrders),
      occupiedTables: toNumber(data.occupiedTables),
      topProducts: normalizeItems(data.topProducts),
      topCategories: normalizeItems(data.topCategories),
    };
  },
};
