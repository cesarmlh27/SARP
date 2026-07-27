import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface DeleteOrderDialogProps {
  open: boolean;
  orderId: number | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export function DeleteOrderDialog({
  open,
  orderId,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteOrderDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Eliminar pedido</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Esta accion no se puede deshacer. El pedido seleccionado sera eliminado definitivamente.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={() => {
            if (orderId != null) {
              void onConfirm(orderId);
            }
          }}
          color="error"
          variant="contained"
          disabled={isSubmitting || orderId == null}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
