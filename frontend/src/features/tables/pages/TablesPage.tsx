import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
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
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSnackbar } from '../../../components/feedback/SnackbarProvider';
import { type RestaurantTable, TableStatus } from '../../../types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { useCreateOrderMutation } from '../../orders/hooks/useOrders';
import { DeleteTableDialog } from '../components/DeleteTableDialog';
import { TableFormDialog } from '../components/TableFormDialog';
import { TableStatusChip } from '../components/TableStatusChip';
import { TableStatusDialog } from '../components/TableStatusDialog';
import {
  SaveTablePayload,
  useChangeTableStatusMutation,
  useCreateTableMutation,
  useDeleteTableMutation,
  useTablesQuery,
  useUpdateTableMutation,
} from '../hooks/useTables';

function TablesToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1 }}>
      <GridToolbarQuickFilter placeholder="Buscar mesa por numero o estado" debounceMs={300} />
    </GridToolbarContainer>
  );
}

export function TablesPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError, error, refetch } = useTablesQuery();
  const createTableMutation = useCreateTableMutation();
  const updateTableMutation = useUpdateTableMutation();
  const deleteTableMutation = useDeleteTableMutation();
  const changeTableStatusMutation = useChangeTableStatusMutation();
  const createOrderMutation = useCreateOrderMutation();
  const { showSnackbar } = useAppSnackbar();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RestaurantTable | null>(null);
  const [statusTarget, setStatusTarget] = useState<RestaurantTable | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const columns: GridColDef<RestaurantTable>[] = useMemo(
    () => [
      { field: 'id', headerName: '#', width: 80 },
      { field: 'tableNumber', headerName: 'Mesa', minWidth: 130, flex: 0.9 },
      { field: 'capacity', headerName: 'Capacidad', minWidth: 130, flex: 0.9 },
      {
        field: 'status',
        headerName: 'Estado',
        minWidth: 150,
        flex: 1,
        renderCell: (params: GridRenderCellParams<RestaurantTable, TableStatus>) => (
          <TableStatusChip status={params.value ?? TableStatus.AVAILABLE} />
        ),
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 188,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<RestaurantTable>) => (
          <Stack direction="row" spacing={0.3}>
            <Tooltip title="Abrir mesa y crear comanda">
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  disabled={params.row.status !== TableStatus.AVAILABLE || createOrderMutation.isPending}
                  onClick={async () => {
                    try {
                      const createdOrder = await createOrderMutation.mutateAsync(params.row.id);
                      showSnackbar(`Mesa ${params.row.tableNumber} abierta para pedido #${createdOrder.id}`, 'success');
                      navigate(`/orders?openOrderId=${createdOrder.id}`);
                    } catch (mutationError) {
                      showSnackbar(getErrorMessage(mutationError, 'No se pudo abrir la mesa para pedido'), 'error');
                    }
                  }}
                >
                  <ReceiptLongRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Editar mesa">
              <IconButton size="small" onClick={() => setEditTarget(params.row)}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cambiar estado">
              <IconButton size="small" onClick={() => setStatusTarget(params.row)}>
                <RestartAltRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar mesa">
              <IconButton size="small" color="error" onClick={() => setDeleteTargetId(params.row.id)}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [],
  );

  const handleCreateTable = async (payload: SaveTablePayload) => {
    try {
      await createTableMutation.mutateAsync(payload);
      setIsCreateDialogOpen(false);
      showSnackbar('Mesa creada correctamente', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo crear la mesa'), 'error');
    }
  };

  const handleUpdateTable = async (payload: SaveTablePayload) => {
    if (!editTarget) {
      return;
    }

    try {
      await updateTableMutation.mutateAsync({ id: editTarget.id, payload });
      setEditTarget(null);
      showSnackbar('Mesa actualizada', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo actualizar la mesa'), 'error');
    }
  };

  const handleDeleteTable = async (id: number) => {
    try {
      await deleteTableMutation.mutateAsync(id);
      setDeleteTargetId(null);
      showSnackbar('Mesa eliminada', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo eliminar la mesa'), 'error');
    }
  };

  const handleChangeStatus = async (payload: { id: number; status: TableStatus }) => {
    try {
      await changeTableStatusMutation.mutateAsync(payload);
      setStatusTarget(null);
      showSnackbar('Estado de mesa actualizado', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo cambiar el estado de la mesa'), 'error');
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" sx={{ letterSpacing: -0.3 }}>
            Mesas
          </Typography>
          <Typography color="text.secondary">Control de mesas, capacidad y estado operativo.</Typography>
        </Box>

        <Button startIcon={<AddRoundedIcon />} variant="contained" onClick={() => setIsCreateDialogOpen(true)}>
          Nueva mesa
        </Button>
      </Stack>

      {isError && <Alert severity="error">{getErrorMessage(error, 'No se pudieron cargar las mesas')}</Alert>}

      <Paper variant="outlined" sx={{ borderRadius: 2.5 }}>
        <DataGrid
          autoHeight
          rows={data}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          slots={{ toolbar: TablesToolbar }}
          sx={{ border: 0 }}
        />
      </Paper>

      <TableFormDialog
        open={isCreateDialogOpen}
        mode="create"
        isSubmitting={createTableMutation.isPending}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateTable}
      />

      <TableFormDialog
        open={editTarget != null}
        mode="edit"
        initialValue={
          editTarget
            ? { id: editTarget.id, tableNumber: editTarget.tableNumber, capacity: editTarget.capacity }
            : undefined
        }
        isSubmitting={updateTableMutation.isPending}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdateTable}
      />

      <TableStatusDialog
        open={statusTarget != null}
        tableId={statusTarget?.id ?? null}
        currentStatus={statusTarget?.status ?? TableStatus.AVAILABLE}
        isSubmitting={changeTableStatusMutation.isPending}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleChangeStatus}
      />

      <DeleteTableDialog
        open={deleteTargetId != null}
        tableId={deleteTargetId}
        isSubmitting={deleteTableMutation.isPending}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteTable}
      />

      {isError && (
        <Button variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => refetch()}>
          Reintentar
        </Button>
      )}
    </Stack>
  );
}
