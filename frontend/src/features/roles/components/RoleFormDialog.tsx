import { zodResolver } from '@hookform/resolvers/zod';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(30, 'Maximo 30 caracteres')
    .regex(/^[A-Z_]+$/, 'Usa mayusculas y guion bajo, por ejemplo: SUPERVISOR'),
});

type FormValues = z.infer<typeof schema>;

interface RoleFormDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: FormValues) => Promise<void>;
}

export function RoleFormDialog({ open, isSubmitting, onClose, onSubmit }: RoleFormDialogProps) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ name: '' });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Nuevo rol</DialogTitle>
      <DialogContent>
        <TextField
          label="Nombre del rol"
          fullWidth
          margin="normal"
          error={Boolean(errors.name)}
          helperText={errors.name?.message ?? 'Ejemplo: ADMIN, MESERO, CAJERO'}
          {...register('name')}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={isSubmitting}
          onClick={handleSubmit(async (values) => {
            await onSubmit({ name: values.name.trim().toUpperCase() });
          })}
        >
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Crear rol'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
