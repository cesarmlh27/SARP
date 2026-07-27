import { zodResolver } from '@hookform/resolvers/zod';
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAvailableTablesQuery } from '../../tables/hooks/useTables';

const schema = z.object({
  tableId: z.number({ message: 'Selecciona una mesa' }).int().positive('Selecciona una mesa'),
});

type FormValues = z.infer<typeof schema>;

interface OrderFormDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (tableId: number) => Promise<void>;
}

export function OrderFormDialog({ open, isSubmitting, onClose, onSubmit }: OrderFormDialogProps) {
  const { data: availableTables = [], isLoading } = useAvailableTablesQuery(open);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tableId: 0,
    },
  });

  const closeAndReset = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={closeAndReset} maxWidth="xs" fullWidth>
      <DialogTitle>Nuevo pedido</DialogTitle>
      <DialogContent>
        <TextField
          select
          label="Mesa"
          fullWidth
          margin="normal"
          defaultValue={0}
          error={Boolean(errors.tableId)}
          helperText={errors.tableId?.message ?? 'Selecciona una mesa disponible'}
          disabled={isLoading || isSubmitting}
          {...register('tableId', { valueAsNumber: true })}
        >
          <MenuItem value={0} disabled>
            Seleccionar mesa
          </MenuItem>
          {availableTables.map((table) => (
            <MenuItem key={table.id} value={table.id}>
              Mesa {table.tableNumber} - Capacidad {table.capacity}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeAndReset} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={isSubmitting || isLoading}
          onClick={handleSubmit(async (values) => {
            await onSubmit(values.tableId);
            reset();
          })}
        >
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Crear pedido'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
