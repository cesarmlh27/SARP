import { Paper, Stack, Typography } from '@mui/material';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3.5, borderRadius: 2.5 }}>
      <Stack spacing={1}>
        <Typography variant="h5">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>
    </Paper>
  );
}
