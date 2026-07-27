import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../contexts/AuthContext';
import { normalizeRole } from '../../../utils/authorization';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import logoInicio from '../../../../Image/Logotipo inicio.png';

const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  rememberMe: z.boolean().default(true),
});

type LoginFormData = z.infer<typeof loginSchema>;

function defaultRouteByRole(role?: string): string {
  const normalized = normalizeRole(role);
  if (normalized === 'ADMIN' || normalized === 'CAJERO') {
    return '/dashboard';
  }
  return '/orders?tab=kitchen';
}

export function LoginPage() {
  const { user, login, isLoading, isAuthenticated, isBootstrapping } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname ?? null;
  }, [location.state]);

  const [serverError, setServerError] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');

    try {
      const loggedUser = await login(data.email, data.password, data.rememberMe);
      navigate(redirectPath ?? defaultRouteByRole(loggedUser.role), { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error, 'No fue posible iniciar sesion'));
    }
  };

  if (!isBootstrapping && isAuthenticated) {
    return <Navigate to={defaultRouteByRole(user?.role)} replace />;
  }

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
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
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
            maxWidth: 430,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2.4, px: 2.5, bgcolor: '#fff' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 2, color: '#1f2937' }}>
              SARP
            </Typography>
          </Box>

          <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#fafafa' }}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={1.25}>
                {serverError && <Alert severity="error">{serverError}</Alert>}

                <TextField
                  fullWidth
                  label="Usuario"
                  type="email"
                  {...register('email')}
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  disabled={isLoading}
                  sx={{ '& .MuiInputBase-input': { fontWeight: 600, letterSpacing: 0.3 } }}
                />

                <TextField
                  fullWidth
                  label="Contrasena"
                  type="password"
                  {...register('password')}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  disabled={isLoading}
                  sx={{ '& .MuiInputBase-input': { fontWeight: 600, letterSpacing: 0.3 } }}
                />

                <FormControlLabel
                  control={<Checkbox size="small" {...register('rememberMe')} />}
                  label={<Typography variant="body2">Recordarme</Typography>}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  startIcon={isLoading ? undefined : <LoginRoundedIcon />}
                  disabled={isLoading}
                  sx={{
                    height: 42,
                    fontWeight: 700,
                    bgcolor: '#8ad64a',
                    color: '#fff',
                    '&:hover': { bgcolor: '#75c23b' },
                  }}
                >
                  {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Ingresar'}
                </Button>
              </Stack>
            </form>
          </Box>
        </Paper>

        <Stack spacing={0.75} sx={{ mt: 2.5, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No puedes ingresar?{' '}
            <Link
              component={RouterLink}
              to="/recuperar-contrasena"
              underline="hover"
              color="primary.main"
              sx={{ fontWeight: 600 }}
            >
              Recuperar contrasena
            </Link>
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          overflow: 'hidden',
          bgcolor: '#b8df5f',
        }}
      >
        <Box
          component="img"
          src={logoInicio}
          alt="Logotipo inicio SAPR"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </Box>
    </Box>
  );
}
