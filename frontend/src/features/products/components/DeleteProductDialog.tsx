import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface DeleteProductDialogProps {
  open: boolean;
  productId: number | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export function DeleteProductDialog({
  open,
  productId,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteProductDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Eliminar producto</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Esta accion no se puede deshacer. El producto sera removido del catalogo.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={isSubmitting || productId == null}
          onClick={() => {
            if (productId != null) {
              void onConfirm(productId);
            }
          }}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
