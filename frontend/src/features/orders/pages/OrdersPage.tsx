import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSnackbar } from '../../../components/feedback/SnackbarProvider';
import { useAuth } from '../../../contexts/AuthContext';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { type Order, OrderStatus } from '../../../types';
import { canManageAll, normalizeRole } from '../../../utils/authorization';
import { DeleteOrderDialog } from '../components/DeleteOrderDialog';
import { OrderFormDialog } from '../components/OrderFormDialog';
import { OrderStatusChip } from '../components/OrderStatusChip';
import { OrderStatusDialog } from '../components/OrderStatusDialog';
import { OrderTicketDialog } from '../components/OrderTicketDialog';
import { KitchenBoardPage } from './KitchenBoardPage';
import {
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useOrdersQuery,
  useUpdateOrderStatusMutation,
} from '../hooks/useOrders';

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

function OrdersToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1 }}>
      <GridToolbarQuickFilter placeholder="Buscar pedido, mesero o mesa" debounceMs={300} />
    </GridToolbarContainer>
  );
}

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const canManageModule = canManageAll(role);

  const { data = [], isLoading, isError, error, refetch } = useOrdersQuery({
    refetchInterval: role === 'MESERO' ? 5000 : false,
  });
  const createOrderMutation = useCreateOrderMutation();
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const deleteOrderMutation = useDeleteOrderMutation();
  const { showSnackbar } = useAppSnackbar();
  const previousStatusesRef = useRef<Map<number, OrderStatus>>(new Map());

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<{ id: number; status: OrderStatus } | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [ticketTarget, setTicketTarget] = useState<Order | null>(null);

  const activeTab = role === 'COCINA' ? 'kitchen' : searchParams.get('tab') === 'kitchen' ? 'kitchen' : 'orders';
  const openOrderIdParam = Number(searchParams.get('openOrderId') ?? 0);

  const columns: GridColDef<Order>[] = useMemo(
    () => [
      { field: 'id', headerName: '#', width: 80 },
      {
        field: 'table',
        headerName: 'Mesa',
        minWidth: 110,
        flex: 0.5,
        valueGetter: (_, row) => row.restaurantTable?.tableNumber ?? '-',
      },
      {
        field: 'waiter',
        headerName: 'Mesero',
        minWidth: 180,
        flex: 1,
        valueGetter: (_, row) => `${row.user?.firstName ?? ''} ${row.user?.lastName ?? ''}`.trim(),
      },
      {
        field: 'status',
        headerName: 'Estado',
        minWidth: 170,
        flex: 0.9,
        renderCell: (params: GridRenderCellParams<Order, OrderStatus>) => <OrderStatusChip status={params.value ?? OrderStatus.PENDING} />,
      },
      {
        field: 'createdAt',
        headerName: 'Fecha',
        minWidth: 190,
        flex: 1,
        valueFormatter: (value?: string) => formatDate(value ?? ''),
      },
      {
        field: 'total',
        headerName: 'Total',
        minWidth: 140,
        flex: 0.8,
        valueFormatter: (value?: number) => formatCurrency(value ?? 0),
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 170,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<Order>) => (
          <Stack direction="row" spacing={0.3}>
            <Tooltip title="Abrir comanda">
              <IconButton size="small" onClick={() => setTicketTarget(params.row)}>
                <ReceiptRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cambiar estado">
              <IconButton size="small" onClick={() => setStatusTarget({ id: params.row.id, status: params.row.status })}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canManageModule && (
              <Tooltip title="Eliminar">
                <IconButton size="small" color="error" onClick={() => setDeleteTargetId(params.row.id)}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      },
    ],
    [canManageModule],
  );

  const handleCreateOrder = async (tableId: number) => {
    try {
      const createdOrder = await createOrderMutation.mutateAsync(tableId);
      setIsCreateDialogOpen(false);
      setTicketTarget(createdOrder);
      showSnackbar('Pedido creado correctamente', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo crear el pedido'), 'error');
    }
  };

  const handleChangeOrderStatus = async (payload: { id: number; status: OrderStatus }) => {
    try {
      await updateStatusMutation.mutateAsync(payload);
      setStatusTarget(null);
      showSnackbar('Estado actualizado', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo actualizar el estado'), 'error');
    }
  };

  const handleDeleteOrder = async (id: number) => {
    try {
      await deleteOrderMutation.mutateAsync(id);
      setDeleteTargetId(null);
      showSnackbar('Pedido eliminado', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo eliminar el pedido'), 'error');
    }
  };

  useEffect(() => {
    if (role !== 'MESERO') {
      previousStatusesRef.current = new Map();
      return;
    }

    const nextStatuses = new Map<number, OrderStatus>();

    data.forEach((order) => {
      const previousStatus = previousStatusesRef.current.get(order.id);
      if (previousStatus && previousStatus !== OrderStatus.READY && order.status === OrderStatus.READY) {
        showSnackbar(`Pedido #${order.id} (Mesa ${order.restaurantTable?.tableNumber ?? '-'}) listo para entregar`, 'info');
      }

      nextStatuses.set(order.id, order.status);
    });

    previousStatusesRef.current = nextStatuses;
  }, [data, role, showSnackbar]);

  useEffect(() => {
    if (!openOrderIdParam || activeTab !== 'orders') {
      return;
    }

    const orderToOpen = data.find((order) => order.id === openOrderIdParam);
    if (!orderToOpen) {
      return;
    }

    setTicketTarget(orderToOpen);

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('openOrderId');
    setSearchParams(nextSearchParams, { replace: true });
  }, [activeTab, data, openOrderIdParam, searchParams, setSearchParams]);

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" sx={{ letterSpacing: -0.3 }}>
            Pedidos y comandas
          </Typography>
          <Typography color="text.secondary">Gestion operativa del ciclo completo: salon, cocina y entrega.</Typography>
        </Box>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 0.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value: 'orders' | 'kitchen') => {
            if (role !== 'COCINA') {
              setSearchParams({ tab: value });
            }
          }}
          variant="fullWidth"
        >
          <Tab value="orders" label="Pedidos" disabled={role === 'COCINA'} />
          <Tab value="kitchen" label="Comandas de cocina" />
        </Tabs>
      </Paper>

      {activeTab === 'orders' && (
        <>
          <Stack direction="row" justifyContent="flex-end" alignItems="center">
            <Button startIcon={<AddRoundedIcon />} variant="contained" onClick={() => setIsCreateDialogOpen(true)} disabled={role === 'COCINA'}>
              Nuevo pedido
            </Button>
          </Stack>

          {isError && <Alert severity="error">{getErrorMessage(error, 'No se pudieron cargar los pedidos')}</Alert>}

          <Paper variant="outlined" sx={{ borderRadius: 2.5 }}>
            <DataGrid
              autoHeight
              rows={data}
              columns={columns}
              loading={isLoading}
              pageSizeOptions={[10, 20, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              disableRowSelectionOnClick
              slots={{ toolbar: OrdersToolbar }}
              sx={{ border: 0 }}
            />
          </Paper>
        </>
      )}

      {activeTab === 'kitchen' && <KitchenBoardPage embedded />}

      <OrderFormDialog
        open={isCreateDialogOpen}
        isSubmitting={createOrderMutation.isPending}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateOrder}
      />

      <OrderStatusDialog
        open={statusTarget != null}
        orderId={statusTarget?.id ?? null}
        currentStatus={statusTarget?.status ?? OrderStatus.PENDING}
        role={role}
        isSubmitting={updateStatusMutation.isPending}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleChangeOrderStatus}
      />

      <OrderTicketDialog
        open={ticketTarget != null}
        orderId={ticketTarget?.id ?? null}
        tableNumber={ticketTarget?.restaurantTable?.tableNumber}
        onClose={() => setTicketTarget(null)}
      />

      <DeleteOrderDialog
        open={canManageModule && deleteTargetId != null}
        orderId={deleteTargetId}
        isSubmitting={deleteOrderMutation.isPending}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteOrder}
      />

      {isError && (
        <Button variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => refetch()}>
          Reintentar
        </Button>
      )}
    </Stack>
  );
}
