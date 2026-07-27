import { Paper, Stack, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TopItem {
  name: string;
  totalSold: number;
}

interface TopProductsChartProps {
  items: TopItem[];
}

export function TopProductsChart({ items }: TopProductsChartProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: 340 }}>
      <Stack spacing={0.5} mb={2}>
        <Typography variant="h6">Productos mas vendidos</Typography>
        <Typography variant="body2" color="text.secondary">
          Desempeno de productos en el periodo actual.
        </Typography>
      </Stack>

      <ResponsiveContainer width="100%" height={245}>
        <BarChart data={items} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: '#f5f7f9' }} />
          <Bar dataKey="totalSold" fill="#0b7d63" radius={[8, 8, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
