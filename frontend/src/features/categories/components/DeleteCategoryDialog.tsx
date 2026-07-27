import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface DeleteCategoryDialogProps {
  open: boolean;
  categoryId: number | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export function DeleteCategoryDialog({
  open,
  categoryId,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteCategoryDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Eliminar categoria</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Esta accion no se puede deshacer. Si la categoria esta en uso por productos, el backend puede rechazar la operacion.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={isSubmitting || categoryId == null}
          onClick={() => {
            if (categoryId != null) {
              void onConfirm(categoryId);
            }
          }}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
