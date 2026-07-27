import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { Paper, Stack, Typography } from '@mui/material';

interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
}

export function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5 }}>
      <Stack spacing={1.2}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: -0.3 }}>
          {value}
        </Typography>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <TrendingUpRoundedIcon sx={{ color: 'success.main', fontSize: 17 }} />
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
