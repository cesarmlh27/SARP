import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface DeleteTableDialogProps {
  open: boolean;
  tableId: number | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export function DeleteTableDialog({
  open,
  tableId,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteTableDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Eliminar mesa</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Esta accion eliminara la mesa del sistema. Verifica que no existan pedidos activos asociados.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={() => {
            if (tableId != null) {
              void onConfirm(tableId);
            }
          }}
          color="error"
          variant="contained"
          disabled={isSubmitting || tableId == null}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
