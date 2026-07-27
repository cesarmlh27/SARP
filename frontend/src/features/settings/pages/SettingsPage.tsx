import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import { Alert, Grid2, Paper, Stack, Typography } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ letterSpacing: -0.3 }}>
        Configuracion
      </Typography>

      <Alert severity="info">
        El backend actual no expone endpoints de configuracion general. Esta vista muestra informacion operativa disponible.
      </Alert>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5 }}>
            <Stack direction="row" spacing={1.2} alignItems="center" mb={1}>
              <SecurityRoundedIcon color="primary" />
              <Typography variant="h6">Sesion actual</Typography>
            </Stack>
            <Typography color="text.secondary">Usuario: {user?.firstName} {user?.lastName}</Typography>
            <Typography color="text.secondary">Correo: {user?.email}</Typography>
            <Typography color="text.secondary">Rol: {user?.role}</Typography>
          </Paper>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5 }}>
            <Stack direction="row" spacing={1.2} alignItems="center" mb={1}>
              <BuildRoundedIcon color="primary" />
              <Typography variant="h6">Estado del sistema</Typography>
            </Stack>
            <Typography color="text.secondary">Version UI: 1.0.0</Typography>
            <Typography color="text.secondary">Modo: Produccion administrativa</Typography>
            <Typography color="text.secondary">Integracion: API REST SAPR</Typography>
          </Paper>
        </Grid2>
      </Grid2>
    </Stack>
  );
}
