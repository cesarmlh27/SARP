import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import logoInicio from '../../../../Image/Logotipo inicio.png';
import { authService } from '../../../services/auth.service';
import { getErrorMessage } from '../../../utils/getErrorMessage';

const resetSchema = z
  .object({
    newPassword: z.string().min(8, 'Minimo 8 caracteres'),
    confirmPassword: z.string().min(8, 'Confirma tu contrasena'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (values: ResetFormData) => {
    if (!token) {
      setServerError('El enlace es invalido o no contiene token.');
      return;
    }

    setServerError('');
    setServerSuccess('');
    setIsSubmitting(true);

    try {
      await authService.resetPassword({ token, newPassword: values.newPassword });
      setServerSuccess('Contrasena actualizada. Ahora puedes iniciar sesion.');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (error) {
      setServerError(getErrorMessage(error, 'No fue posible restablecer la contrasena'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        backgroundColor: '#fff',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 2, sm: 4 },
          py: { xs: 4, lg: 3 },
          background:
            'radial-gradient(circle at 15% 20%, rgba(30, 64, 175, 0.06) 0px, transparent 220px), radial-gradient(circle at 90% 80%, rgba(15, 23, 42, 0.08) 0px, transparent 210px)',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 460,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
          }}
        >
          <Box sx={{ py: 2.4, px: 2.5, bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1f2937' }}>
              Restablecer contrasena
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Define una nueva contrasena para tu cuenta.
            </Typography>
          </Box>

          <Box sx={{ p: 2.5, bgcolor: '#fafafa' }}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={1.25}>
                {serverError && <Alert severity="error">{serverError}</Alert>}
                {serverSuccess && <Alert severity="success">{serverSuccess}</Alert>}

                <TextField
                  fullWidth
                  label="Nueva contrasena"
                  type="password"
                  {...register('newPassword')}
                  error={Boolean(errors.newPassword)}
                  helperText={errors.newPassword?.message}
                  disabled={isSubmitting}
                />

                <TextField
                  fullWidth
                  label="Confirmar nueva contrasena"
                  type="password"
                  {...register('confirmPassword')}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword?.message}
                  disabled={isSubmitting}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  startIcon={isSubmitting ? undefined : <LockResetRoundedIcon />}
                  disabled={isSubmitting || !token}
                  sx={{
                    height: 42,
                    fontWeight: 700,
                    bgcolor: '#8ad64a',
                    color: '#fff',
                    '&:hover': { bgcolor: '#75c23b' },
                  }}
                >
                  {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Guardar nueva contrasena'}
                </Button>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Volver a{' '}
                  <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
                    Iniciar sesion
                  </Link>
                </Typography>
              </Stack>
            </form>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ display: { xs: 'none', lg: 'flex' }, overflow: 'hidden', bgcolor: '#b8df5f' }}>
        <Box
          component="img"
          src={logoInicio}
          alt="Logotipo inicio SAPR"
          sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
      </Box>
    </Box>
  );
}
