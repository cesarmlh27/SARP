import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { productService } from '../../../services/product.service';
import { useProductsQuery } from '../../products/hooks/useProducts';
import { useAddOrderDetailMutation, useOrderDetailsQuery, useRemoveOrderDetailMutation } from '../hooks/useOrderDetails';
import { getErrorMessage } from '../../../utils/getErrorMessage';

interface FormValues {
  productId: number;
  quantity: number;
}

interface OrderTicketDialogProps {
  open: boolean;
  orderId: number | null;
  tableNumber?: number;
  onClose: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function OrderTicketDialog({ open, orderId, tableNumber, onClose }: OrderTicketDialogProps) {
  const { data: products = [] } = useProductsQuery();
  const {
    data: details = [],
    isLoading: isLoadingDetails,
    isError: isDetailsError,
    error: detailsError,
  } = useOrderDetailsQuery(orderId, open);
  const addDetailMutation = useAddOrderDetailMutation(orderId);
  const removeDetailMutation = useRemoveOrderDetailMutation(orderId);

  const {
    register,
    reset,
    setError,
    setValue,
    clearErrors,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      productId: 0,
      quantity: 1,
    },
  });

  const [searchTerm, setSearchTerm] = useState('');

  const selectedProductId = watch('productId');

  const activeProducts = useMemo(() => products.filter((product) => product.active), [products]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return activeProducts;
    }

    return activeProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category?.name?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [activeProducts, searchTerm]);

  const selectedProduct = useMemo(
    () => activeProducts.find((product) => product.id === selectedProductId),
    [activeProducts, selectedProductId],
  );

  useEffect(() => {
    if (open) {
      reset({ productId: 0, quantity: 1 });
      setSearchTerm('');
    }
  }, [open, reset]);

  const handleAddDetail = async (values: FormValues) => {
    if (orderId == null) {
      return;
    }

    if (!values.productId || values.productId <= 0) {
      setError('productId', { message: 'Selecciona un producto' });
      return;
    }

    await addDetailMutation.mutateAsync({
      productId: Number(values.productId),
      quantity: Number(values.quantity),
    });

    reset({ productId: 0, quantity: 1 });
  };

  const total = details.reduce((sum, detail) => sum + detail.subtotal, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Comanda digital {tableNumber ? `- Mesa ${tableNumber}` : ''}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {isDetailsError && (
            <Alert severity="error">{getErrorMessage(detailsError, 'No se pudo cargar la comanda')}</Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(handleAddDetail)}
            sx={{ display: 'grid', gap: 1.2 }}
          >
            <TextField
              label="Buscar producto"
              placeholder="Escribe nombre o categoria"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, minmax(0, 1fr))',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 1,
                maxHeight: 280,
                overflowY: 'auto',
                pr: 0.5,
              }}
            >
              {visibleProducts.map((product) => {
                const isSelected = product.id === selectedProductId;
                const imageUrl = product.imagePath ? productService.getImage(product.id, product.imagePath) : undefined;

                return (
                  <Paper
                    key={product.id}
                    variant="outlined"
                    onClick={() => {
                      setValue('productId', product.id, { shouldValidate: true });
                      clearErrors('productId');
                    }}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      backgroundColor: isSelected ? 'rgba(11, 125, 99, 0.08)' : 'background.paper',
                    }}
                  >
                    <Avatar
                      variant="rounded"
                      src={imageUrl}
                      alt={product.name}
                      sx={{ width: 54, height: 54, borderRadius: 1.6, bgcolor: 'grey.100' }}
                    >
                      {product.name.slice(0, 1).toUpperCase()}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {product.category?.name ?? 'Sin categoria'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.3 }}>
                        {formatCurrency(product.price)}
                      </Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Box>

            {visibleProducts.length === 0 && <Alert severity="info">No hay productos activos para ese filtro.</Alert>}

            <input type="hidden" {...register('productId', { valueAsNumber: true, required: true, min: 1 })} />

            {errors.productId && (
              <Typography variant="caption" color="error">
                {errors.productId.message ?? 'Selecciona un producto'}
              </Typography>
            )}

            {selectedProduct && (
              <Alert severity="success" sx={{ py: 0.6 }}>
                Producto seleccionado: {selectedProduct.name}
              </Alert>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr auto' }, gap: 1 }}>
              <TextField
                label="Cantidad"
                type="number"
                inputProps={{ min: 1 }}
                error={Boolean(errors.quantity)}
                helperText={errors.quantity ? 'Cantidad invalida' : undefined}
                {...register('quantity', { valueAsNumber: true, required: true, min: 1 })}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={addDetailMutation.isPending || orderId == null}
                sx={{ minWidth: 150 }}
              >
                {addDetailMutation.isPending ? <CircularProgress size={18} color="inherit" /> : 'Agregar a comanda'}
              </Button>
            </Box>
          </Box>

          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Items de la comanda
            </Typography>

            {isLoadingDetails ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={22} />
              </Box>
            ) : details.length === 0 ? (
              <Alert severity="info">Aun no hay productos en esta comanda.</Alert>
            ) : (
              details.map((detail) => (
                <Stack
                  key={detail.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.2 }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{detail.product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {detail.quantity} x {formatCurrency(detail.unitPrice)}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 600 }}>{formatCurrency(detail.subtotal)}</Typography>
                    <Tooltip title="Quitar item">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => removeDetailMutation.mutate(detail.id)}
                        disabled={removeDetailMutation.isPending}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              ))
            )}
          </Stack>

          <Typography sx={{ textAlign: 'right', fontWeight: 700 }}>Total comanda: {formatCurrency(total)}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
