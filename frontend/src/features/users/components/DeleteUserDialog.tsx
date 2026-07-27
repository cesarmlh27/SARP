import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface DeleteUserDialogProps {
  open: boolean;
  userId: number | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export function DeleteUserDialog({ open, userId, isSubmitting, onClose, onConfirm }: DeleteUserDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Eliminar usuario</DialogTitle>
      <DialogContent>
        <DialogContentText>Esta accion elimina al usuario seleccionado de manera permanente.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={isSubmitting || userId == null}
          onClick={() => {
            if (userId != null) {
              void onConfirm(userId);
            }
          }}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
