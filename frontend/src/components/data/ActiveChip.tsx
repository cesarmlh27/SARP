import { Chip } from '@mui/material';

export function ActiveChip({ active }: { active: boolean }) {
  return <Chip label={active ? 'Activo' : 'Inactivo'} color={active ? 'success' : 'default'} variant="outlined" size="small" />;
}
