import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
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
import { ActiveChip } from '../../../components/data/ActiveChip';
import { useAppSnackbar } from '../../../components/feedback/SnackbarProvider';
import { type Role, type User } from '../../../types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { useRolesQuery } from '../../roles/hooks/useRoles';
import { DeleteUserDialog } from '../components/DeleteUserDialog';
import { UserFormDialog } from '../components/UserFormDialog';
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from '../hooks/useUsers';

function UsersToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1 }}>
      <GridToolbarQuickFilter placeholder="Buscar usuario o correo" debounceMs={300} />
    </GridToolbarContainer>
  );
}

function findRoleName(roleId: number, roles: Role[]): string {
  return roles.find((role) => role.id === roleId)?.name ?? '';
}

export function UsersPage() {
  const { data: users = [], isLoading, isError, error, refetch } = useUsersQuery();
  const { data: roles = [] } = useRolesQuery();
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();
  const { showSnackbar } = useAppSnackbar();

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const columns: GridColDef<User>[] = useMemo(
    () => [
      { field: 'id', headerName: '#', width: 80 },
      {
        field: 'fullName',
        headerName: 'Usuario',
        minWidth: 200,
        flex: 1,
        valueGetter: (_, row) => `${row.firstName} ${row.lastName}`,
      },
      { field: 'email', headerName: 'Correo', minWidth: 220, flex: 1.2 },
      {
        field: 'role',
        headerName: 'Rol',
        minWidth: 150,
        flex: 0.8,
        valueGetter: (_, row) => row.role?.name ?? '-',
      },
      {
        field: 'enabled',
        headerName: 'Estado',
        minWidth: 120,
        flex: 0.7,
        renderCell: (params: GridRenderCellParams<User, boolean>) => <ActiveChip active={Boolean(params.value)} />,
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<User>) => (
          <Stack direction="row" spacing={0.3}>
            <Tooltip title="Editar usuario">
              <IconButton size="small" onClick={() => setEditTarget(params.row)}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar usuario">
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

  const handleCreateUser = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    roleId: number;
    enabled: boolean;
  }) => {
    try {
      await createMutation.mutateAsync({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password ?? 'TempPass123!',
        roleName: findRoleName(payload.roleId, roles),
      });
      setOpenCreateDialog(false);
      showSnackbar('Usuario creado correctamente', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo crear el usuario'), 'error');
    }
  };

  const handleUpdateUser = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    roleId: number;
    enabled: boolean;
  }) => {
    if (!editTarget) {
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: editTarget.id, payload });
      setEditTarget(null);
      showSnackbar('Usuario actualizado', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo actualizar el usuario'), 'error');
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteTargetId(null);
      showSnackbar('Usuario eliminado', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo eliminar el usuario'), 'error');
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" sx={{ letterSpacing: -0.3 }}>
            Usuarios
          </Typography>
          <Typography color="text.secondary">Administracion de empleados internos y accesos del sistema.</Typography>
        </Box>
        <Button
          startIcon={<AddRoundedIcon />}
          variant="contained"
          onClick={() => setOpenCreateDialog(true)}
          disabled={roles.length === 0}
        >
          Nuevo usuario
        </Button>
      </Stack>

      {roles.length === 0 && (
        <Alert severity="warning">Debes crear al menos un rol antes de registrar usuarios.</Alert>
      )}

      {isError && <Alert severity="error">{getErrorMessage(error, 'No se pudieron cargar los usuarios')}</Alert>}

      <Paper variant="outlined" sx={{ borderRadius: 2.5 }}>
        <DataGrid
          autoHeight
          rows={users}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          slots={{ toolbar: UsersToolbar }}
          sx={{ border: 0 }}
        />
      </Paper>

      <UserFormDialog
        open={openCreateDialog}
        mode="create"
        roles={roles}
        isSubmitting={createMutation.isPending}
        onClose={() => setOpenCreateDialog(false)}
        onSubmit={handleCreateUser}
      />

      <UserFormDialog
        open={editTarget != null}
        mode="edit"
        roles={roles}
        initialValue={
          editTarget
            ? {
                firstName: editTarget.firstName,
                lastName: editTarget.lastName,
                email: editTarget.email,
                roleId: editTarget.role?.id ?? 0,
                enabled: editTarget.enabled,
              }
            : undefined
        }
        isSubmitting={updateMutation.isPending}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdateUser}
      />

      <DeleteUserDialog
        open={deleteTargetId != null}
        userId={deleteTargetId}
        isSubmitting={deleteMutation.isPending}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteUser}
      />

      {isError && (
        <Button variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => refetch()}>
          Reintentar
        </Button>
      )}
    </Stack>
  );
}
