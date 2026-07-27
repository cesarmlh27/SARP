import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';
import {
  Alert,
  Box,
  Button,
  Grid2,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dashboardService } from '../../../services/dashboard.service';
import { PaymentStatus, type Order, type Payment } from '../../../types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { useCategoriesQuery } from '../../categories/hooks/useCategories';
import { KpiCard } from '../../dashboard/components/KpiCard';
import { TopCategoriesChart } from '../../dashboard/components/TopCategoriesChart';
import { TopProductsChart } from '../../dashboard/components/TopProductsChart';
import { useOrdersQuery } from '../../orders/hooks/useOrders';
import { usePaymentsQuery } from '../../payments/hooks/usePayments';
import { useProductsQuery } from '../../products/hooks/useProducts';
import { useTablesQuery } from '../../tables/hooks/useTables';

type TimePreset = 'today' | '7d' | '30d' | 'thisMonth' | 'lastMonth' | 'custom';

const STATUS_COLORS = ['#0b7d63', '#6e93b5', '#d08937', '#8897aa', '#c45f5f', '#9ab9ac'];

function toInputDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function addDays(base: Date, days: number): Date {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function getRangeFromPreset(preset: Exclude<TimePreset, 'custom'>): { from: Date; to: Date } {
  const now = new Date();

  if (preset === 'today') {
    return { from: startOfDay(now), to: endOfDay(now) };
  }

  if (preset === '7d') {
    return { from: startOfDay(addDays(now, -6)), to: endOfDay(now) };
  }

  if (preset === '30d') {
    return { from: startOfDay(addDays(now, -29)), to: endOfDay(now) };
  }

  if (preset === 'thisMonth') {
    return {
      from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: endOfDay(now),
    };
  }

  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return {
    from: startOfDay(previousMonth),
    to: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)),
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactDate(value: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function isWithinRange(dateValue: string | undefined, from: Date, to: Date): boolean {
  if (!dateValue) {
    return false;
  }

  const value = new Date(dateValue);
  return value >= from && value <= to;
}

function periodLabel(preset: TimePreset): string {
  switch (preset) {
    case 'today':
      return 'Hoy';
    case '7d':
      return 'Ultimos 7 dias';
    case '30d':
      return 'Ultimos 30 dias';
    case 'thisMonth':
      return 'Mes actual';
    case 'lastMonth':
      return 'Mes anterior';
    case 'custom':
    default:
      return 'Rango personalizado';
  }
}

export function ReportsPage() {
  const { data: dashboardData, isLoading: isLoadingDashboard, isError: isDashboardError, error: dashboardError, refetch: refetchDashboard, isFetching: isFetchingDashboard } = useQuery({
    queryKey: ['dashboard', 'stats', 'reports'],
    queryFn: dashboardService.getStats,
  });

  const { data: orders = [], isLoading: isLoadingOrders, isError: isOrdersError, error: ordersError, refetch: refetchOrders } = useOrdersQuery();
  const { data: payments = [], isLoading: isLoadingPayments, isError: isPaymentsError, error: paymentsError, refetch: refetchPayments } = usePaymentsQuery();
  const { data: tables = [] } = useTablesQuery();
  const { data: products = [] } = useProductsQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const initialRange = getRangeFromPreset('7d');

  const [preset, setPreset] = useState<TimePreset>('7d');
  const [customStart, setCustomStart] = useState(toInputDate(initialRange.from));
  const [customEnd, setCustomEnd] = useState(toInputDate(initialRange.to));

  const range = useMemo(() => {
    if (preset !== 'custom') {
      return getRangeFromPreset(preset);
    }

    if (!customStart || !customEnd) {
      return initialRange;
    }

    return {
      from: startOfDay(new Date(customStart)),
      to: endOfDay(new Date(customEnd)),
    };
  }, [customEnd, customStart, initialRange, preset]);

  const hasInvalidCustomRange = range.from > range.to;

  const filteredOrders = useMemo(() => {
    if (hasInvalidCustomRange) {
      return [] as Order[];
    }

    return orders.filter((order) => isWithinRange(order.createdAt, range.from, range.to));
  }, [hasInvalidCustomRange, orders, range.from, range.to]);

  const filteredPayments = useMemo(() => {
    if (hasInvalidCustomRange) {
      return [] as Payment[];
    }

    return payments.filter((payment) => isWithinRange(payment.paidAt, range.from, range.to));
  }, [hasInvalidCustomRange, payments, range.from, range.to]);

  const completedPayments = useMemo(
    () => filteredPayments.filter((payment) => payment.status === PaymentStatus.COMPLETED),
    [filteredPayments],
  );

  const totalSales = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const ordersCount = filteredOrders.length;
  const paidOrdersCount = completedPayments.length;
  const avgTicket = paidOrdersCount > 0 ? totalSales / paidOrdersCount : 0;
  const activeOrdersCount = filteredOrders.filter((order) => order.status === 'PENDING' || order.status === 'IN_PROGRESS' || order.status === 'READY').length;
  const uniqueTablesServed = new Set(filteredOrders.map((order) => order.restaurantTable?.id).filter((tableId): tableId is number => typeof tableId === 'number')).size;
  const paymentRate = ordersCount > 0 ? (paidOrdersCount / ordersCount) * 100 : 0;

  const salesTrend = useMemo(() => {
    const buckets = new Map<string, number>();

    completedPayments.forEach((payment) => {
      const date = new Date(payment.paidAt);
      const key = toInputDate(date);
      buckets.set(key, (buckets.get(key) ?? 0) + payment.amount);
    });

    return Array.from(buckets.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, total]) => ({ date, label: formatCompactDate(date), total }));
  }, [completedPayments]);

  const salesByMethod = useMemo(() => {
    const buckets = new Map<string, { total: number; count: number }>();

    completedPayments.forEach((payment) => {
      const key = payment.method;
      const previous = buckets.get(key) ?? { total: 0, count: 0 };
      buckets.set(key, { total: previous.total + payment.amount, count: previous.count + 1 });
    });

    return Array.from(buckets.entries()).map(([method, value]) => ({
      method,
      total: value.total,
      count: value.count,
    }));
  }, [completedPayments]);

  const statusDistribution = useMemo(() => {
    const buckets = new Map<string, number>();
    filteredOrders.forEach((order) => {
      buckets.set(order.status, (buckets.get(order.status) ?? 0) + 1);
    });

    return Array.from(buckets.entries()).map(([status, count]) => ({ status, count }));
  }, [filteredOrders]);

  const topWaiters = useMemo(() => {
    const buckets = new Map<string, { orders: number; total: number }>();

    filteredOrders.forEach((order) => {
      const waiterName = `${order.user?.firstName ?? ''} ${order.user?.lastName ?? ''}`.trim() || 'Sin asignar';
      const previous = buckets.get(waiterName) ?? { orders: 0, total: 0 };
      buckets.set(waiterName, {
        orders: previous.orders + 1,
        total: previous.total + (order.total ?? 0),
      });
    });

    return Array.from(buckets.entries())
      .map(([waiter, stats]) => ({ waiter, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredOrders]);

  const recentOrders = useMemo(
    () => [...filteredOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6),
    [filteredOrders],
  );

  const isLoading = isLoadingDashboard || isLoadingOrders || isLoadingPayments;
  const hasError = isDashboardError || isOrdersError || isPaymentsError;

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.5}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <SummarizeRoundedIcon color="primary" />
          <Box>
            <Typography variant="h4" sx={{ letterSpacing: -0.3 }}>
              Dashboard y reportes
            </Typography>
            <Typography color="text.secondary">Vista unificada de ventas, pedidos, productividad y tendencias operativas.</Typography>
          </Box>
        </Stack>

        <Button variant="outlined" size="small" startIcon={<RefreshRoundedIcon />} onClick={() => {
          void refetchDashboard();
          void refetchOrders();
          void refetchPayments();
        }} disabled={isFetchingDashboard}>
          Actualizar
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" color="text.secondary">
            Periodo: {periodLabel(preset)}
          </Typography>

          <ToggleButtonGroup
            size="small"
            color="primary"
            value={preset}
            exclusive
            onChange={(_, value: TimePreset | null) => {
              if (value) {
                setPreset(value);
              }
            }}
          >
            <ToggleButton value="today">Hoy</ToggleButton>
            <ToggleButton value="7d">7 dias</ToggleButton>
            <ToggleButton value="30d">30 dias</ToggleButton>
            <ToggleButton value="thisMonth">Mes actual</ToggleButton>
            <ToggleButton value="lastMonth">Mes anterior</ToggleButton>
            <ToggleButton value="custom">Personalizado</ToggleButton>
          </ToggleButtonGroup>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
            <TextField
              size="small"
              type="date"
              label="Desde"
              value={customStart}
              onChange={(event) => {
                setCustomStart(event.target.value);
                setPreset('custom');
              }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              type="date"
              label="Hasta"
              value={customEnd}
              onChange={(event) => {
                setCustomEnd(event.target.value);
                setPreset('custom');
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {hasInvalidCustomRange && <Alert severity="warning">La fecha inicial no puede ser mayor que la final.</Alert>}
        </Stack>
      </Paper>

      {hasError && (
        <Alert severity="error">
          {getErrorMessage(dashboardError ?? ordersError ?? paymentsError, 'No fue posible cargar todas las metricas')}
        </Alert>
      )}

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <KpiCard label="Ventas del periodo" value={isLoading ? 'Cargando...' : formatCurrency(totalSales)} hint="Pagos completados" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <KpiCard label="Ticket promedio" value={isLoading ? 'Cargando...' : formatCurrency(avgTicket)} hint="Ingreso medio por pago" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <KpiCard label="Pedidos en periodo" value={isLoading ? 'Cargando...' : String(ordersCount)} hint="Ordenes registradas" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <KpiCard label="Mesas atendidas" value={isLoading ? 'Cargando...' : String(uniqueTablesServed)} hint="Mesas con actividad" />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <KpiCard label="Pedidos activos" value={isLoading ? 'Cargando...' : String(activeOrdersCount)} hint="Pendiente, en curso, listo" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <KpiCard label="Tasa de pago" value={isLoading ? 'Cargando...' : `${paymentRate.toFixed(1)}%`} hint="Pagos completados / pedidos" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <KpiCard label="Productos activos" value={String(products.filter((product) => product.active).length)} hint="Catalogo disponible" />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
          <KpiCard label="Capacidad de mesas" value={String(tables.reduce((sum, table) => sum + table.capacity, 0))} hint="Total de puestos" />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, xl: 8 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: 340 }}>
            <Stack spacing={0.4} mb={2}>
              <Typography variant="h6">Tendencia de ventas</Typography>
              <Typography variant="body2" color="text.secondary">
                Evolucion diaria de los pagos completados.
              </Typography>
            </Stack>

            <ResponsiveContainer width="100%" height={245}>
              <LineChart data={salesTrend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="total" stroke="#0b7d63" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, xl: 4 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: 340 }}>
            <Stack spacing={0.4} mb={2}>
              <Typography variant="h6">Estado de pedidos</Typography>
              <Typography variant="body2" color="text.secondary">
                Distribucion por fase del flujo.
              </Typography>
            </Stack>

            <ResponsiveContainer width="100%" height={245}>
              <PieChart>
                <Pie data={statusDistribution} dataKey="count" nameKey="status" innerRadius={50} outerRadius={84} paddingAngle={3}>
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`${entry.status}-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, xl: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: 340 }}>
            <Stack spacing={0.4} mb={2}>
              <Typography variant="h6">Ventas por metodo de pago</Typography>
              <Typography variant="body2" color="text.secondary">
                Ingreso acumulado por canal de cobro.
              </Typography>
            </Stack>

            <ResponsiveContainer width="100%" height={245}>
              <BarChart data={salesByMethod} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf0" />
                <XAxis dataKey="method" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#1c7ea4" radius={[8, 8, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, xl: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: 340 }}>
            <Stack spacing={0.4} mb={1.6}>
              <Typography variant="h6">Top meseros por facturacion</Typography>
              <Typography variant="body2" color="text.secondary">
                Rendimiento comercial por colaborador.
              </Typography>
            </Stack>

            <Stack spacing={1}>
              {topWaiters.length === 0 ? (
                <Alert severity="info">No hay actividad en el periodo seleccionado.</Alert>
              ) : (
                topWaiters.map((waiter) => (
                  <Box key={waiter.waiter} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{waiter.waiter}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {waiter.orders} pedidos
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700 }}>{formatCurrency(waiter.total)}</Typography>
                  </Box>
                ))
              )}
            </Stack>
          </Paper>
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, xl: 7 }}>
          <TopProductsChart items={dashboardData?.topProducts ?? []} />
        </Grid2>
        <Grid2 size={{ xs: 12, xl: 5 }}>
          <TopCategoriesChart items={dashboardData?.topCategories ?? []} />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, xl: 8 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack spacing={0.4} mb={1.4}>
              <Typography variant="h6">Actividad reciente</Typography>
              <Typography variant="body2" color="text.secondary">
                Ultimos pedidos creados dentro del periodo filtrado.
              </Typography>
            </Stack>

            <Stack spacing={1}>
              {recentOrders.length === 0 ? (
                <Alert severity="info">No hay pedidos para mostrar en este rango.</Alert>
              ) : (
                recentOrders.map((order) => (
                  <Box key={order.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        Pedido #{order.id} - Mesa {order.restaurantTable?.tableNumber ?? '-'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.user?.firstName} {order.user?.lastName} - {order.status}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 700 }}>{formatCurrency(order.total ?? 0)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(order.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Stack>
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, xl: 4 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack spacing={0.7}>
              <Typography variant="h6">Indicadores estructurales</Typography>
              <Typography variant="body2" color="text.secondary">
                Contexto general del negocio.
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Categorias activas</Typography>
                <Typography sx={{ fontWeight: 700 }}>{categories.filter((category) => category.active).length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Total categorias</Typography>
                <Typography sx={{ fontWeight: 700 }}>{categories.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Total productos</Typography>
                <Typography sx={{ fontWeight: 700 }}>{products.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Total mesas</Typography>
                <Typography sx={{ fontWeight: 700 }}>{tables.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Revenue historico</Typography>
                <Typography sx={{ fontWeight: 700 }}>{formatCurrency(dashboardData?.totalRevenue ?? 0)}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid2>
      </Grid2>

      <Alert severity="info">
        Los graficos de top productos y categorias usan consolidado global de /api/dashboard. El resto de metricas del panel respeta el filtro de periodo seleccionado.
      </Alert>
    </Stack>
  );
}
