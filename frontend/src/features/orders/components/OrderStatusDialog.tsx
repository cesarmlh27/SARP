import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { OrderStatus } from '../../../types';
import { AppRole } from '../../../utils/authorization';

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pendiente',
  [OrderStatus.IN_PROGRESS]: 'En preparacion',
  [OrderStatus.READY]: 'Listo',
  [OrderStatus.DELIVERED]: 'Entregado',
  [OrderStatus.CANCELLED]: 'Cancelado',
  [OrderStatus.PAID]: 'Pagado',
};

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PENDING, OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.IN_PROGRESS, OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.READY, OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.DELIVERED, OrderStatus.PAID],
  [OrderStatus.CANCELLED]: [OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.PAID],
};

interface OrderStatusDialogProps {
  open: boolean;
  orderId: number | null;
  currentStatus: OrderStatus;
  role: AppRole;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (payload: { id: number; status: OrderStatus }) => Promise<void>;
}

function statusOptionsByRole(currentStatus: OrderStatus, role: AppRole): OrderStatus[] {
  if (role === 'COCINA') {
    if (currentStatus === OrderStatus.PENDING) {
      return [OrderStatus.PENDING, OrderStatus.IN_PROGRESS];
    }
    if (currentStatus === OrderStatus.IN_PROGRESS) {
      return [OrderStatus.IN_PROGRESS, OrderStatus.READY];
    }
    return [currentStatus];
  }

  if (role === 'MESERO') {
    if (currentStatus === OrderStatus.PENDING || currentStatus === OrderStatus.IN_PROGRESS) {
      return [currentStatus, OrderStatus.CANCELLED];
    }
    if (currentStatus === OrderStatus.READY) {
      return [OrderStatus.READY, OrderStatus.DELIVERED];
    }
    return [currentStatus];
  }

  return validTransitions[currentStatus];
}

export function OrderStatusDialog({
  open,
  orderId,
  currentStatus,
  role,
  isSubmitting,
  onClose,
  onConfirm,
}: OrderStatusDialogProps) {
  const [nextStatus, setNextStatus] = useState<OrderStatus>(currentStatus);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        transition: {
          onEnter: () => setNextStatus(currentStatus),
        },
      }}
    >
      <DialogTitle>Cambiar estado del pedido</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          label="Estado"
          margin="normal"
          value={nextStatus}
          onChange={(event) => setNextStatus(event.target.value as OrderStatus)}
        >
          {statusOptionsByRole(currentStatus, role).map((status) => (
            <MenuItem key={status} value={status}>
              {statusLabels[status]}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={isSubmitting || orderId == null || nextStatus === currentStatus}
          onClick={async () => {
            if (orderId != null) {
              await onConfirm({ id: orderId, status: nextStatus });
            }
          }}
        >
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Guardar cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
