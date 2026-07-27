import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useAppSnackbar } from '../../../components/feedback/SnackbarProvider';
import { useAuth } from '../../../contexts/AuthContext';
import { type KitchenTicket, OrderStatus } from '../../../types';
import { canManageAll, normalizeRole } from '../../../utils/authorization';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { OrderTicketDialog } from '../components/OrderTicketDialog';
import { useKitchenTicketsUnifiedQuery } from '../hooks/useKitchenTicketsUnified';
import { useUpdateOrderStatusMutation } from '../hooks/useOrders';

function statusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Pendiente';
    case OrderStatus.IN_PROGRESS:
      return 'En preparacion';
    case OrderStatus.READY:
      return 'Listo para entrega';
    default:
      return status;
  }
}

function statusColor(status: OrderStatus): 'warning' | 'info' | 'success' {
  switch (status) {
    case OrderStatus.PENDING:
      return 'warning';
    case OrderStatus.IN_PROGRESS:
      return 'info';
    default:
      return 'success';
  }
}

function elapsedLabel(createdAt: string): string {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(0, Math.floor((now - created) / 60000));

  if (diffMinutes < 1) {
    return 'Ahora';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function groupByStatus(tickets: KitchenTicket[]) {
  return {
    pending: tickets.filter((ticket) => ticket.status === OrderStatus.PENDING),
    inProgress: tickets.filter((ticket) => ticket.status === OrderStatus.IN_PROGRESS),
    ready: tickets.filter((ticket) => ticket.status === OrderStatus.READY),
  };
}

function KitchenTicketCard({
  ticket,
  isSubmitting,
  onStart,
  onMarkReady,
  onEditTicket,
  canMarkReady,
}: {
  ticket: KitchenTicket;
  isSubmitting: boolean;
  onStart: (orderId: number) => Promise<void>;
  onMarkReady: (orderId: number) => Promise<void>;
  onEditTicket: (ticket: KitchenTicket) => void;
  canMarkReady: boolean;
}) {
  const canStart = ticket.items.length > 0;

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={1.2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Mesa {ticket.tableNumber}
            </Typography>
            <Stack direction="row" spacing={0.4} alignItems="center">
              <Tooltip title="Editar comanda">
                <IconButton size="small" onClick={() => onEditTicket(ticket)}>
                  <ReceiptRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Chip size="small" color={statusColor(ticket.status)} label={statusLabel(ticket.status)} />
            </Stack>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Pedido #{ticket.orderId} - Mesero: {ticket.waiterName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Enviado hace: {elapsedLabel(ticket.createdAt)}
          </Typography>

          <Divider />

          <Stack spacing={0.5}>
            {ticket.items.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Sin items aun.
              </Typography>
            ) : (
              ticket.items.map((item, idx) => (
                <Typography key={`${ticket.orderId}-${idx}`} variant="body2">
                  {item.quantity} x {item.productName}
                </Typography>
              ))
            )}
          </Stack>

          <Stack direction="row" spacing={1}>
            {ticket.status === OrderStatus.PENDING && (
              <Tooltip title={canStart ? 'Iniciar preparacion' : 'Agrega al menos un producto para iniciar'}>
                <span>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={isSubmitting || !canStart}
                    onClick={() => onStart(ticket.orderId)}
                  >
                    Iniciar
                  </Button>
                </span>
              </Tooltip>
            )}
            {ticket.status === OrderStatus.IN_PROGRESS && canMarkReady && (
              <Button
                size="small"
                variant="contained"
                color="success"
                disabled={isSubmitting}
                onClick={() => onMarkReady(ticket.orderId)}
              >
                Marcar listo
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function KitchenBoardPage({ embedded = false }: { embedded?: boolean }) {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const canManageModule = canManageAll(role);
  const canOperateKitchen = canManageModule || role === 'COCINA';

  const { data = [], isLoading, isError, error, refetch, isFetching } = useKitchenTicketsUnifiedQuery();
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const { showSnackbar } = useAppSnackbar();
  const [ticketTarget, setTicketTarget] = useState<KitchenTicket | null>(null);

  const grouped = useMemo(() => groupByStatus(data), [data]);

  const updateStatus = async (orderId: number, status: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: orderId, status });
      showSnackbar('Comanda actualizada', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo actualizar la comanda'), 'error');
    }
  };

  return (
    <Stack spacing={2}>
      {!embedded && (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" sx={{ letterSpacing: -0.3 }}>
              Comandas digitales
            </Typography>
            <Typography color="text.secondary">Panel de cocina para preparacion y despacho de pedidos.</Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
          >
            Actualizar
          </Button>
        </Stack>
      )}

      {embedded && (
        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
          >
            Actualizar comandas
          </Button>
        </Stack>
      )}

      {isError && <Alert severity="error">{getErrorMessage(error, 'No se pudieron cargar las comandas')}</Alert>}

      <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Stack spacing={1.2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Pendientes ({grouped.pending.length})
              </Typography>
              {grouped.pending.map((ticket) => (
                <KitchenTicketCard
                  key={ticket.orderId}
                  ticket={ticket}
                  isSubmitting={updateStatusMutation.isPending}
                  onStart={(orderId) => (canOperateKitchen ? updateStatus(orderId, OrderStatus.IN_PROGRESS) : Promise.resolve())}
                  onMarkReady={() => Promise.resolve()}
                  onEditTicket={setTicketTarget}
                  canMarkReady={canOperateKitchen}
                />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={1.2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                En preparacion ({grouped.inProgress.length})
              </Typography>
              {grouped.inProgress.map((ticket) => (
                <KitchenTicketCard
                  key={ticket.orderId}
                  ticket={ticket}
                  isSubmitting={updateStatusMutation.isPending}
                  onStart={() => Promise.resolve()}
                  onMarkReady={(orderId) => (canOperateKitchen ? updateStatus(orderId, OrderStatus.READY) : Promise.resolve())}
                  onEditTicket={setTicketTarget}
                  canMarkReady={canOperateKitchen}
                />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={1.2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Listas ({grouped.ready.length})
              </Typography>
              {grouped.ready.map((ticket) => (
                <KitchenTicketCard
                  key={ticket.orderId}
                  ticket={ticket}
                  isSubmitting={updateStatusMutation.isPending}
                  onStart={() => Promise.resolve()}
                  onMarkReady={() => Promise.resolve()}
                  onEditTicket={setTicketTarget}
                  canMarkReady={canManageModule}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <OrderTicketDialog
        open={ticketTarget != null}
        orderId={ticketTarget?.orderId ?? null}
        tableNumber={ticketTarget?.tableNumber}
        onClose={() => setTicketTarget(null)}
      />
    </Stack>
  );
}
