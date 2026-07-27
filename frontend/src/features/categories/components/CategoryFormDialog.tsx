import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'Maximo 100 caracteres'),
  description: z.string().trim().max(255, 'Maximo 255 caracteres').default(''),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface CategoryFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValue?: FormValues;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
}

export function CategoryFormDialog({
  open,
  mode,
  initialValue,
  isSubmitting,
  onClose,
  onSubmit,
}: CategoryFormDialogProps) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValue?.name ?? '',
      description: initialValue?.description ?? '',
      active: initialValue?.active ?? true,
    },
  });

  useEffect(() => {
    reset({
      name: initialValue?.name ?? '',
      description: initialValue?.description ?? '',
      active: initialValue?.active ?? true,
    });
  }, [initialValue, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Nueva categoria' : 'Editar categoria'}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 0.5 }}>
          <TextField label="Nombre" error={Boolean(errors.name)} helperText={errors.name?.message} {...register('name')} />

          <TextField
            label="Descripcion"
            multiline
            minRows={3}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
            {...register('description')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={watch('active')}
                onChange={(event) => setValue('active', event.target.checked, { shouldDirty: true })}
              />
            }
            label={watch('active') ? 'Categoria activa' : 'Categoria inactiva'}
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
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : mode === 'create' ? 'Crear categoria' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
