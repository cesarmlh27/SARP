import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
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
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Role } from '../../../types';
import logoInicio from '../../../../Image/Logotipo inicio.png';

const createSchema = z.object({
  firstName: z.string().trim().min(2, 'Minimo 2 caracteres'),
  lastName: z.string().trim().min(2, 'Minimo 2 caracteres'),
  email: z.string().email('Correo invalido'),
  password: z.string().min(8, 'Minimo 8 caracteres'),
  roleId: z.number({ message: 'Selecciona rol' }).int().positive('Selecciona rol'),
  enabled: z.boolean().default(true),
});

const editSchema = z.object({
  firstName: z.string().trim().min(2, 'Minimo 2 caracteres'),
  lastName: z.string().trim().min(2, 'Minimo 2 caracteres'),
  email: z.string().email('Correo invalido'),
  roleId: z.number({ message: 'Selecciona rol' }).int().positive('Selecciona rol'),
  enabled: z.boolean(),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  enabled: boolean;
  password?: string;
};

interface UserFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  roles: Role[];
  initialValue?: UserFormValues;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: UserFormValues) => Promise<void>;
}

export function UserFormDialog({ open, mode, roles, initialValue, isSubmitting, onClose, onSubmit }: UserFormDialogProps) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserFormValues>({
    resolver: zodResolver(mode === 'create' ? createSchema : editSchema),
    defaultValues: {
      firstName: initialValue?.firstName ?? '',
      lastName: initialValue?.lastName ?? '',
      email: initialValue?.email ?? '',
      roleId: initialValue?.roleId ?? 0,
      enabled: initialValue?.enabled ?? true,
      password: '',
    },
  });

  useEffect(() => {
    reset({
      firstName: initialValue?.firstName ?? '',
      lastName: initialValue?.lastName ?? '',
      email: initialValue?.email ?? '',
      roleId: initialValue?.roleId ?? 0,
      enabled: initialValue?.enabled ?? true,
      password: '',
    });
  }, [initialValue, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}</DialogTitle>
      <DialogContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ mt: 0.5, alignItems: 'stretch' }}>
          <Box
            sx={{
              width: { xs: '100%', md: 210 },
              flexShrink: 0,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8fbf2',
              gap: 1,
            }}
          >
            <Box
              component="img"
              src={logoInicio}
              alt="Logo inicio SAPR"
              sx={{ width: '100%', maxWidth: 170, height: 'auto', borderRadius: 1.2 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              Registro de usuarios
            </Typography>
          </Box>

          <Stack spacing={1.5} sx={{ flex: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                label="Nombres"
                fullWidth
                error={Boolean(errors.firstName)}
                helperText={errors.firstName?.message}
                {...register('firstName')}
              />
              <TextField
                label="Apellidos"
                fullWidth
                error={Boolean(errors.lastName)}
                helperText={errors.lastName?.message}
                {...register('lastName')}
              />
            </Stack>

            <TextField
              label="Correo"
              type="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register('email')}
            />

            {mode === 'create' && (
              <TextField
                label="Contrasena temporal"
                type="password"
                error={Boolean(errors.password)}
                helperText={errors.password?.message ?? 'Minimo 8 caracteres'}
                {...register('password')}
              />
            )}

            <TextField
              select
              label="Rol"
              defaultValue={0}
              error={Boolean(errors.roleId)}
              helperText={errors.roleId?.message}
              {...register('roleId', { valueAsNumber: true })}
            >
              <MenuItem value={0} disabled>
                Seleccionar rol
              </MenuItem>
              {roles
                .filter((role) => role.name !== 'ADMIN')
                .map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
                ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={watch('enabled')}
                  onChange={(event) => setValue('enabled', event.target.checked, { shouldDirty: true })}
                />
              }
              label={watch('enabled') ? 'Usuario habilitado' : 'Usuario deshabilitado'}
            />
          </Stack>
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
            await onSubmit({
              ...values,
              firstName: values.firstName.trim(),
              lastName: values.lastName.trim(),
              email: values.email.trim().toLowerCase(),
            });
          })}
        >
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : mode === 'create' ? 'Crear usuario' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
