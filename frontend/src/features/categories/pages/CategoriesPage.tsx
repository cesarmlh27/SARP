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
import { type Category } from '../../../types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { CategoryFormDialog } from '../components/CategoryFormDialog';
import { DeleteCategoryDialog } from '../components/DeleteCategoryDialog';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '../hooks/useCategories';

function CategoriesToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1 }}>
      <GridToolbarQuickFilter placeholder="Buscar categoria" debounceMs={300} />
    </GridToolbarContainer>
  );
}

export function CategoriesPage() {
  const { data = [], isLoading, isError, error, refetch } = useCategoriesQuery();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();
  const { showSnackbar } = useAppSnackbar();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const columns: GridColDef<Category>[] = useMemo(
    () => [
      { field: 'id', headerName: '#', width: 80 },
      { field: 'name', headerName: 'Nombre', minWidth: 180, flex: 1 },
      {
        field: 'description',
        headerName: 'Descripcion',
        minWidth: 300,
        flex: 1.8,
        valueGetter: (_, row) => row.description || '-',
      },
      {
        field: 'active',
        headerName: 'Estado',
        minWidth: 130,
        flex: 0.8,
        renderCell: (params: GridRenderCellParams<Category, boolean>) => <ActiveChip active={Boolean(params.value)} />,
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<Category>) => (
          <Stack direction="row" spacing={0.3}>
            <Tooltip title="Editar categoria">
              <IconButton size="small" onClick={() => setEditTarget(params.row)}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar categoria">
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

  const handleCreate = async (values: { name: string; description: string; active: boolean }) => {
    try {
      await createMutation.mutateAsync(values);
      setCreateOpen(false);
      showSnackbar('Categoria creada correctamente', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo crear la categoria'), 'error');
    }
  };

  const handleUpdate = async (values: { name: string; description: string; active: boolean }) => {
    if (!editTarget) {
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: editTarget.id, payload: values });
      setEditTarget(null);
      showSnackbar('Categoria actualizada', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo actualizar la categoria'), 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteTargetId(null);
      showSnackbar('Categoria eliminada', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo eliminar la categoria'), 'error');
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" sx={{ letterSpacing: -0.3 }}>
            Categorias
          </Typography>
          <Typography color="text.secondary">Gestion de categorias para organizar el menu.</Typography>
        </Box>

        <Button startIcon={<AddRoundedIcon />} variant="contained" onClick={() => setCreateOpen(true)}>
          Nueva categoria
        </Button>
      </Stack>

      {isError && <Alert severity="error">{getErrorMessage(error, 'No se pudieron cargar las categorias')}</Alert>}

      <Paper variant="outlined" sx={{ borderRadius: 2.5 }}>
        <DataGrid
          autoHeight
          rows={data}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          slots={{ toolbar: CategoriesToolbar }}
          sx={{ border: 0 }}
        />
      </Paper>

      <CategoryFormDialog
        open={createOpen}
        mode="create"
        isSubmitting={createMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <CategoryFormDialog
        open={editTarget != null}
        mode="edit"
        initialValue={
          editTarget
            ? {
                name: editTarget.name,
                description: editTarget.description ?? '',
                active: editTarget.active,
              }
            : undefined
        }
        isSubmitting={updateMutation.isPending}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
      />

      <DeleteCategoryDialog
        open={deleteTargetId != null}
        categoryId={deleteTargetId}
        isSubmitting={deleteMutation.isPending}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
      />

      {isError && (
        <Button variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => refetch()}>
          Reintentar
        </Button>
      )}
    </Stack>
  );
}
