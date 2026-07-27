import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import {
  Alert,
  Avatar,
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
import { productService } from '../../../services/product.service';
import { type Category, type Product } from '../../../types';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { useCategoriesQuery } from '../../categories/hooks/useCategories';
import { DeleteProductDialog } from '../components/DeleteProductDialog';
import { ProductFormDialog } from '../components/ProductFormDialog';
import { ProductImageDialog } from '../components/ProductImageDialog';
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useProductsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from '../hooks/useProducts';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function ProductsToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1 }}>
      <GridToolbarQuickFilter placeholder="Buscar producto o categoria" debounceMs={300} />
    </GridToolbarContainer>
  );
}

export function ProductsPage() {
  const { data: products = [], isLoading, isError, error, refetch } = useProductsQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();
  const uploadImageMutation = useUploadProductImageMutation();
  const { showSnackbar } = useAppSnackbar();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [imageTargetId, setImageTargetId] = useState<number | null>(null);

  const columns: GridColDef<Product>[] = useMemo(
    () => [
      {
        field: 'imagePath',
        headerName: 'Imagen',
        width: 92,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<Product>) => {
          const imageUrl = params.row.imagePath ? productService.getImage(params.row.id, params.row.imagePath) : '';

          return (
            <Avatar
              variant="rounded"
              src={imageUrl || undefined}
              alt={params.row.name}
              sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'grey.100' }}
            >
              {params.row.name.slice(0, 1).toUpperCase()}
            </Avatar>
          );
        },
      },
      { field: 'name', headerName: 'Producto', minWidth: 200, flex: 1 },
      {
        field: 'category',
        headerName: 'Categoria',
        minWidth: 160,
        flex: 0.9,
        valueGetter: (_, row) => row.category?.name ?? '-',
      },
      {
        field: 'price',
        headerName: 'Precio',
        minWidth: 130,
        flex: 0.8,
        valueFormatter: (value?: number) => formatCurrency(value ?? 0),
      },
      {
        field: 'active',
        headerName: 'Estado',
        minWidth: 130,
        flex: 0.8,
        renderCell: (params: GridRenderCellParams<Product, boolean>) => <ActiveChip active={Boolean(params.value)} />,
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 150,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<Product>) => (
          <Stack direction="row" spacing={0.2}>
            <Tooltip title="Editar producto">
              <IconButton size="small" onClick={() => setEditTarget(params.row)}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Subir imagen">
              <IconButton size="small" onClick={() => setImageTargetId(params.row.id)}>
                <ImageRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar producto">
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

  const mapFormValues = (values: {
    name: string;
    description: string;
    price: number;
    active: boolean;
    categoryId: number;
  }) => ({
    ...values,
    description: values.description.trim(),
    name: values.name.trim(),
  });

  const handleCreate = async (values: {
    name: string;
    description: string;
    price: number;
    active: boolean;
    categoryId: number;
  }) => {
    try {
      await createMutation.mutateAsync(mapFormValues(values));
      setCreateOpen(false);
      showSnackbar('Producto creado correctamente', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo crear el producto'), 'error');
    }
  };

  const handleUpdate = async (values: {
    name: string;
    description: string;
    price: number;
    active: boolean;
    categoryId: number;
  }) => {
    if (!editTarget) {
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: editTarget.id, payload: mapFormValues(values) });
      setEditTarget(null);
      showSnackbar('Producto actualizado', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo actualizar el producto'), 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteTargetId(null);
      showSnackbar('Producto eliminado', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo eliminar el producto'), 'error');
    }
  };

  const handleUploadImage = async (payload: { id: number; file: File }) => {
    try {
      await uploadImageMutation.mutateAsync(payload);
      setImageTargetId(null);
      showSnackbar('Imagen actualizada', 'success');
    } catch (mutationError) {
      showSnackbar(getErrorMessage(mutationError, 'No se pudo actualizar la imagen'), 'error');
    }
  };

  const normalizedCategories = useMemo<Category[]>(() => categories.filter((category) => category.active), [categories]);

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" sx={{ letterSpacing: -0.3 }}>
            Productos
          </Typography>
          <Typography color="text.secondary">Catalogo de productos, precios y estado de disponibilidad.</Typography>
        </Box>

        <Button
          startIcon={<AddRoundedIcon />}
          variant="contained"
          onClick={() => setCreateOpen(true)}
          disabled={normalizedCategories.length === 0}
        >
          Nuevo producto
        </Button>
      </Stack>

      {normalizedCategories.length === 0 && (
        <Alert severity="warning">
          Debes crear al menos una categoria activa antes de registrar productos.
        </Alert>
      )}

      {isError && <Alert severity="error">{getErrorMessage(error, 'No se pudieron cargar los productos')}</Alert>}

      <Paper variant="outlined" sx={{ borderRadius: 2.5 }}>
        <DataGrid
          autoHeight
          rows={products}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          slots={{ toolbar: ProductsToolbar }}
          sx={{ border: 0 }}
        />
      </Paper>

      <ProductFormDialog
        open={createOpen}
        mode="create"
        categories={normalizedCategories}
        isSubmitting={createMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <ProductFormDialog
        open={editTarget != null}
        mode="edit"
        categories={normalizedCategories}
        initialValue={
          editTarget
            ? {
                name: editTarget.name,
                description: editTarget.description ?? '',
                price: editTarget.price,
                active: editTarget.active,
                categoryId: editTarget.category?.id ?? 0,
              }
            : undefined
        }
        isSubmitting={updateMutation.isPending}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
      />

      <DeleteProductDialog
        open={deleteTargetId != null}
        productId={deleteTargetId}
        isSubmitting={deleteMutation.isPending}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
      />

      <ProductImageDialog
        open={imageTargetId != null}
        productId={imageTargetId}
        isSubmitting={uploadImageMutation.isPending}
        onClose={() => setImageTargetId(null)}
        onSubmit={handleUploadImage}
      />

      {isError && (
        <Button variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => refetch()}>
          Reintentar
        </Button>
      )}
    </Stack>
  );
}
