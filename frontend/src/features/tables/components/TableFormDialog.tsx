import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  tableNumber: z.number({ message: 'Ingresa numero de mesa' }).int().positive('Numero invalido'),
  capacity: z.number({ message: 'Ingresa capacidad' }).int().min(1, 'Minimo 1 persona').max(30, 'Maximo 30 personas'),
});

type FormValues = z.infer<typeof schema>;

interface InitialTable {
  id?: number;
  tableNumber: number;
  capacity: number;
}

interface TableFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValue?: InitialTable;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: FormValues) => Promise<void>;
}

export function TableFormDialog({ open, mode, initialValue, isSubmitting, onClose, onSubmit }: TableFormDialogProps) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tableNumber: initialValue?.tableNumber ?? 1,
      capacity: initialValue?.capacity ?? 4,
    },
  });

  useEffect(() => {
    reset({
      tableNumber: initialValue?.tableNumber ?? 1,
      capacity: initialValue?.capacity ?? 4,
    });
  }, [initialValue, reset, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Nueva mesa' : 'Editar mesa'}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 0.5 }}>
          <TextField
            label="Numero de mesa"
            type="number"
            error={Boolean(errors.tableNumber)}
            helperText={errors.tableNumber?.message}
            {...register('tableNumber', { valueAsNumber: true })}
          />
          <TextField
            label="Capacidad"
            type="number"
            error={Boolean(errors.capacity)}
            helperText={errors.capacity?.message}
            {...register('capacity', { valueAsNumber: true })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={isSubmitting}
          onClick={handleSubmit(async (values) => {
            await onSubmit(values);
          })}
        >
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : mode === 'create' ? 'Crear mesa' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
