import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { useAppSnackbar } from '../../../components/feedback/SnackbarProvider';
import { PaymentMethod, PaymentStatus, type Payment } from '../../../types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { useOrdersQuery } from '../../orders/hooks/useOrders';
import { PaymentFormDialog } from '../components/PaymentFormDialog';
import { useCreatePaymentMutation, usePaymentsQuery } from '../hooks/usePayments';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function methodLabel(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.CARD:
      return 'Tarjeta';
    case PaymentMethod.NEQUI:
      return 'Nequi';
    case PaymentMethod.DAVIPLATA:
      return 'Daviplata';
    case PaymentMethod.EFFECTIVE:
    default:
      return 'Efectivo';
  }
}

function statusColor(status: PaymentStatus): 'success' | 'warning' | 'default' {
  switch (status) {
    case PaymentStatus.COMPLETED:
      return 'success';
    case PaymentStatus.PENDING:
      return 'warning';
    default:
      return 'default';
  }
}

function PaymentsToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1 }}>
      <GridToolbarQuickFilter placeholder="Buscar pago" debounceMs={300} />
    </GridToolbarContainer>
  );
}

export function PaymentsPage() {
  const { data: payments = [], isLoading, isError, error, refetch } = usePaymentsQuery();
  const { data: orders = [] } = useOrdersQuery();
  const createMutation = useCreatePaymentMutation();
  const { showSnackbar } = useAppSnackbar();

  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const columns: GridColDef<Payment>[] = useMemo(
    () => [
      { field: 'id', headerName: '#', width: 80 },
      {
        field: 'order',
        headerName: 'Pedido',
        minWidth: 120,
        flex: 0.7,
        valueGetter: (_, row) => `#${row.order?.id ?? '-'}`,
      },
      {
        field: 'table',
        headerName: 'Mesa',
        minWidth: 110,
        flex: 0.6,
        valueGetter: (_, row) => row.order?.restaurantTable?.tableNumber ?? '-',
      },
      {
        field: 'method',
        headerName: 'Metodo',
        minWidth: 130,
        flex: 0.8,
        valueGetter: (_, row) => methodLabel(row.method),
      },
      {
        field: 'status',
        headerName: 'Estado',
        minWidth: 130,
        flex: 0.7,
        renderCell: (params) => <Chip label={params.row.status} color={statusColor(params.row.status)} variant="outlined" size="small" />,
      },
      {
        field: 'amount',
        headerName: 'Monto',
        minWidth: 130,
        flex: 0.8,
        valueFormatter: (value?: number) => formatCurrency(value ?? 0),
      },
      {
        field: 'paidAt',
        headerName: 'Fecha de pago',
        minWidth: 180,
        flex: 1,
        valueFormatter: (value?: string) => formatDate(value ?? ''),
      },
    ],
    [],
  );

  const handleCreatePayment = async (payload: { orderId: number; method: PaymentMethod }) => {
    try {
      await createMutation.mutateAsync(payload);
      setOpenCreateDialog(false);
      showSnackbar('Pago registrado correctamente', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo registrar el pago'), 'error');
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" sx={{ letterSpacing: -0.3 }}>
            Pagos
          </Typography>
          <Typography color="text.secondary">Registro de pagos y conciliacion por pedido.</Typography>
        </Box>
        <Button startIcon={<AddRoundedIcon />} variant="contained" onClick={() => setOpenCreateDialog(true)}>
          Registrar pago
        </Button>
      </Stack>

      {isError && <Alert severity="error">{getErrorMessage(error, 'No se pudieron cargar los pagos')}</Alert>}

      <Paper variant="outlined" sx={{ borderRadius: 2.5 }}>
        <DataGrid
          autoHeight
          rows={payments}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          slots={{ toolbar: PaymentsToolbar }}
          sx={{ border: 0 }}
        />
      </Paper>

      <PaymentFormDialog
        open={openCreateDialog}
        orders={orders}
        isSubmitting={createMutation.isPending}
        onClose={() => setOpenCreateDialog(false)}
        onSubmit={handleCreatePayment}
      />

      {isError && (
        <Button variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => refetch()}>
          Reintentar
        </Button>
      )}
    </Stack>
  );
}
