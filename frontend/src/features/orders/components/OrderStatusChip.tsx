import { Chip } from '@mui/material';
import { OrderStatus } from '../../../types';

interface StatusConfig {
  label: string;
  color: 'default' | 'warning' | 'success' | 'error' | 'info';
}

const statusConfig: Record<OrderStatus, StatusConfig> = {
  [OrderStatus.PENDING]: { label: 'Pendiente', color: 'warning' },
  [OrderStatus.IN_PROGRESS]: { label: 'En preparacion', color: 'info' },
  [OrderStatus.READY]: { label: 'Listo', color: 'success' },
  [OrderStatus.DELIVERED]: { label: 'Entregado', color: 'default' },
  [OrderStatus.CANCELLED]: { label: 'Cancelado', color: 'error' },
  [OrderStatus.PAID]: { label: 'Pagado', color: 'success' },
};

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];

  return <Chip label={config.label} color={config.color} variant="outlined" size="small" />;
}
