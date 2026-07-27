import { Alert, Snackbar } from '@mui/material';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: SnackbarSeverity) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = useCallback((message: string, severity: SnackbarSeverity = 'info') => {
    setState({ open: true, message, severity });
  }, []);

  const handleClose = useCallback(() => {
    setState((previous) => ({ ...previous, open: false }));
  }, []);

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={3500}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert variant="filled" severity={state.severity} onClose={handleClose} sx={{ width: '100%' }}>
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useAppSnackbar() {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error('useAppSnackbar debe usarse dentro de SnackbarProvider');
  }

  return context;
}
