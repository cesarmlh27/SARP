import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useRef, useState } from 'react';

interface ProductImageDialogProps {
  open: boolean;
  productId: number | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { id: number; file: File }) => Promise<void>;
}

export function ProductImageDialog({
  open,
  productId,
  isSubmitting,
  onClose,
  onSubmit,
}: ProductImageDialogProps) {
  const [fileName, setFileName] = useState<string>('');
  const [fileValue, setFileValue] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const resetState = () => {
    setFileName('');
    setFileValue(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Cargar imagen de producto</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 0.5 }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setFileValue(selected);
              setFileName(selected?.name ?? '');
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {fileName ? `Archivo: ${fileName}` : 'Selecciona una imagen en formato JPG, PNG o WEBP'}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={isSubmitting || productId == null || fileValue == null}
          onClick={async () => {
            if (productId != null && fileValue != null) {
              await onSubmit({ id: productId, file: fileValue });
              handleClose();
            }
          }}
        >
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Subir imagen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
