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
import { TableStatus } from '../../../types';

const statusOptions: Array<{ value: TableStatus; label: string }> = [
  { value: TableStatus.AVAILABLE, label: 'Disponible' },
  { value: TableStatus.OCCUPIED, label: 'Ocupada' },
  { value: TableStatus.RESERVED, label: 'Reservada' },
];

interface TableStatusDialogProps {
  open: boolean;
  tableId: number | null;
  currentStatus: TableStatus;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (payload: { id: number; status: TableStatus }) => Promise<void>;
}

export function TableStatusDialog({
  open,
  tableId,
  currentStatus,
  isSubmitting,
  onClose,
  onConfirm,
}: TableStatusDialogProps) {
  const [nextStatus, setNextStatus] = useState<TableStatus>(currentStatus);

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
      <DialogTitle>Cambiar estado de mesa</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          label="Estado"
          margin="normal"
          value={nextStatus}
          onChange={(event) => setNextStatus(event.target.value as TableStatus)}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
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
          disabled={isSubmitting || tableId == null || nextStatus === currentStatus}
          onClick={async () => {
            if (tableId != null) {
              await onConfirm({ id: tableId, status: nextStatus });
            }
          }}
        >
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Guardar cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
