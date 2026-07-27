import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Category } from '../../../types';

const schema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'Maximo 100 caracteres'),
  description: z.string().trim().max(255, 'Maximo 255 caracteres').default(''),
  price: z.number({ message: 'Ingresa precio' }).positive('Debe ser mayor a 0'),
  active: z.boolean(),
  categoryId: z.number({ message: 'Selecciona categoria' }).int().positive('Selecciona categoria'),
});

type FormValues = z.infer<typeof schema>;

interface ProductFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  categories: Category[];
  initialValue?: FormValues;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
}

export function ProductFormDialog({
  open,
  mode,
  categories,
  initialValue,
  isSubmitting,
  onClose,
  onSubmit,
}: ProductFormDialogProps) {
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
      price: initialValue?.price ?? 0,
      active: initialValue?.active ?? true,
      categoryId: initialValue?.categoryId ?? 0,
    },
  });

  useEffect(() => {
    reset({
      name: initialValue?.name ?? '',
      description: initialValue?.description ?? '',
      price: initialValue?.price ?? 0,
      active: initialValue?.active ?? true,
      categoryId: initialValue?.categoryId ?? 0,
    });
  }, [initialValue, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Nuevo producto' : 'Editar producto'}</DialogTitle>
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

          <TextField
            label="Precio"
            type="number"
            fullWidth
            error={Boolean(errors.price)}
            helperText={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />

          <TextField
            select
            label="Categoria"
            defaultValue={0}
            error={Boolean(errors.categoryId)}
            helperText={errors.categoryId?.message}
            {...register('categoryId', { valueAsNumber: true })}
          >
            <MenuItem value={0} disabled>
              Seleccionar categoria
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={watch('active')}
                onChange={(event) => setValue('active', event.target.checked, { shouldDirty: true })}
              />
            }
            label={watch('active') ? 'Producto activo' : 'Producto inactivo'}
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
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : mode === 'create' ? 'Crear producto' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
