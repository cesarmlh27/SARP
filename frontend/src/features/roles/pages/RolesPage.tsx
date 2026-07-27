import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { useAppSnackbar } from '../../../components/feedback/SnackbarProvider';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import type { Role } from '../../../types';
import { RoleFormDialog } from '../components/RoleFormDialog';
import { useCreateRoleMutation, useRolesQuery } from '../hooks/useRoles';

function RolesToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1 }}>
      <GridToolbarQuickFilter placeholder="Buscar rol" debounceMs={300} />
    </GridToolbarContainer>
  );
}

export function RolesPage() {
  const { data = [], isLoading, isError, error, refetch } = useRolesQuery();
  const createMutation = useCreateRoleMutation();
  const { showSnackbar } = useAppSnackbar();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const columns: GridColDef<Role>[] = useMemo(
    () => [
      { field: 'id', headerName: '#', width: 90 },
      {
        field: 'name',
        headerName: 'Rol',
        minWidth: 220,
        flex: 1,
        renderCell: (params) => <Chip label={params.row.name} variant="outlined" size="small" />,
      },
    ],
    [],
  );

  const handleCreateRole = async (payload: { name: string }) => {
    try {
      await createMutation.mutateAsync(payload);
      setOpenCreateDialog(false);
      showSnackbar('Rol creado correctamente', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo crear el rol'), 'error');
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" sx={{ letterSpacing: -0.3 }}>
            Roles
          </Typography>
          <Typography color="text.secondary">Gestion de perfiles y permisos de acceso.</Typography>
        </Box>
        <Button startIcon={<AddRoundedIcon />} variant="contained" onClick={() => setOpenCreateDialog(true)}>
          Nuevo rol
        </Button>
      </Stack>

      {isError && <Alert severity="error">{getErrorMessage(error, 'No se pudieron cargar los roles')}</Alert>}

      <Paper variant="outlined" sx={{ borderRadius: 2.5 }}>
        <DataGrid
          autoHeight
          rows={data}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          slots={{ toolbar: RolesToolbar }}
          sx={{ border: 0 }}
        />
      </Paper>

      <Alert severity="info">
        El backend actual solo expone listar y crear roles. Edicion/eliminacion no estan disponibles por API.
      </Alert>

      <RoleFormDialog
        open={openCreateDialog}
        isSubmitting={createMutation.isPending}
        onClose={() => setOpenCreateDialog(false)}
        onSubmit={handleCreateRole}
      />

      {isError && (
        <Button variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => refetch()}>
          Reintentar
        </Button>
      )}
    </Stack>
  );
}
