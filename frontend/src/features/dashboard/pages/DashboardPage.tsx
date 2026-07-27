import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Alert, Button, Grid2, Paper, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../../services/dashboard.service';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { KpiCard } from '../components/KpiCard';
import { TopCategoriesChart } from '../components/TopCategoriesChart';
import { TopProductsChart } from '../components/TopProductsChart';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5 }}>
        <Stack spacing={2}>
          <Alert severity="error">{getErrorMessage(error, 'No fue posible cargar el dashboard')}</Alert>
          <Button onClick={() => refetch()} variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }}>
            Reintentar
          </Button>
        </Stack>
      </Paper>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack spacing={0.3}>
          <Typography variant="h4" sx={{ letterSpacing: -0.3 }}>
            Dashboard
          </Typography>
          <Typography color="text.secondary">Resumen operativo del restaurante en tiempo real.</Typography>
        </Stack>

        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshRoundedIcon />}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Actualizar
        </Button>
      </Stack>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <KpiCard label="Ventas del dia" value={formatCurrency(data.salesToday)} hint="Cierre parcial del dia" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <KpiCard label="Ventas del mes" value={formatCurrency(data.salesThisMonth)} hint="Acumulado mensual" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <KpiCard label="Pedidos activos" value={String(data.activeOrders)} hint="Pedidos en curso" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <KpiCard label="Mesas ocupadas" value={String(data.occupiedTables)} hint="Estado actual del salon" />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, xl: 7 }}>
          <TopProductsChart items={data.topProducts} />
        </Grid2>
        <Grid2 size={{ xs: 12, xl: 5 }}>
          <TopCategoriesChart items={data.topCategories} />
        </Grid2>
      </Grid2>
    </Stack>
  );
}
