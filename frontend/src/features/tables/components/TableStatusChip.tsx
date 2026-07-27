import { Chip } from '@mui/material';
import { TableStatus } from '../../../types';

interface StatusConfig {
  label: string;
  color: 'default' | 'warning' | 'success';
}

const statusConfig: Record<TableStatus, StatusConfig> = {
  [TableStatus.AVAILABLE]: { label: 'Disponible', color: 'success' },
  [TableStatus.OCCUPIED]: { label: 'Ocupada', color: 'warning' },
  [TableStatus.RESERVED]: { label: 'Reservada', color: 'default' },
};

export function TableStatusChip({ status }: { status: TableStatus }) {
  const config = statusConfig[status];

  return <Chip label={config.label} color={config.color} variant="outlined" size="small" />;
}
