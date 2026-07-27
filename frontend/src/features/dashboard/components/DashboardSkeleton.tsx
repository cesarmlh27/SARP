import { Grid2, Paper, Skeleton, Stack } from '@mui/material';

export function DashboardSkeleton() {
  return (
    <Stack spacing={2}>
      <Grid2 container spacing={2}>
        {[0, 1, 2, 3].map((item) => (
          <Grid2 key={item} size={{ xs: 12, sm: 6, xl: 3 }}>
            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5 }}>
              <Skeleton width="45%" height={20} />
              <Skeleton width="70%" height={38} />
              <Skeleton width="60%" height={16} />
            </Paper>
          </Grid2>
        ))}
      </Grid2>

      <Grid2 container spacing={2}>
        {[0, 1].map((item) => (
          <Grid2 key={item} size={{ xs: 12, xl: 6 }}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
              <Skeleton width="42%" height={26} />
              <Skeleton width="58%" height={18} />
              <Skeleton height={230} sx={{ mt: 1 }} />
            </Paper>
          </Grid2>
        ))}
      </Grid2>
    </Stack>
  );
}
