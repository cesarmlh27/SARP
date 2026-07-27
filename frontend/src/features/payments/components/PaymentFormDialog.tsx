import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { OrderStatus, PaymentMethod, type Order } from '../../../types';

const schema = z.object({
  orderId: z.number({ message: 'Selecciona pedido' }).int().positive('Selecciona pedido'),
  method: z.nativeEnum(PaymentMethod),
});

type FormValues = z.infer<typeof schema>;

const methodOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: PaymentMethod.EFFECTIVE, label: 'Efectivo' },
  { value: PaymentMethod.CARD, label: 'Tarjeta' },
  { value: PaymentMethod.NEQUI, label: 'Nequi' },
  { value: PaymentMethod.DAVIPLATA, label: 'Daviplata' },
];

interface PaymentFormDialogProps {
  open: boolean;
  orders: Order[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { orderId: number; method: PaymentMethod }) => Promise<void>;
}

export function PaymentFormDialog({ open, orders, isSubmitting, onClose, onSubmit }: PaymentFormDialogProps) {
  const payableOrders = orders.filter((order) => order.status !== OrderStatus.PAID);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      orderId: 0,
      method: PaymentMethod.EFFECTIVE,
    },
  });

  useEffect(() => {
    if (open) {
      reset({ orderId: 0, method: PaymentMethod.EFFECTIVE });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar pago</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 0.5 }}>
          <TextField
            select
            label="Pedido"
            defaultValue={0}
            error={Boolean(errors.orderId)}
            helperText={errors.orderId?.message ?? 'Selecciona un pedido pendiente de pago'}
            {...register('orderId', { valueAsNumber: true })}
          >
            <MenuItem value={0} disabled>
              Seleccionar pedido
            </MenuItem>
            {payableOrders.map((order) => (
              <MenuItem key={order.id} value={order.id}>
                Pedido #{order.id} - Mesa {order.restaurantTable?.tableNumber ?? '-'} - Total {order.total}
              </MenuItem>
            ))}
          </TextField>

          <TextField select label="Metodo" defaultValue={PaymentMethod.EFFECTIVE} {...register('method')}>
            {methodOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {payableOrders.length === 0 && (
            <Typography variant="body2" color="warning.main">
              No hay pedidos pendientes para registrar pago.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={isSubmitting || payableOrders.length === 0}
          onClick={handleSubmit(async (values) => {
            await onSubmit(values);
          })}
        >
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Registrar pago'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
