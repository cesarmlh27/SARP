import { Paper, Stack, Typography } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface TopItem {
  name: string;
  totalSold: number;
}

interface TopCategoriesChartProps {
  items: TopItem[];
}

const COLORS = ['#0b7d63', '#6e93b5', '#d08937', '#8897aa', '#9ab9ac'];

export function TopCategoriesChart({ items }: TopCategoriesChartProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: 340 }}>
      <Stack spacing={0.5} mb={2}>
        <Typography variant="h6">Categorias destacadas</Typography>
        <Typography variant="body2" color="text.secondary">
          Distribucion de ventas por categoria.
        </Typography>
      </Stack>

      <ResponsiveContainer width="100%" height={245}>
        <PieChart>
          <Pie
            data={items}
            dataKey="totalSold"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={86}
            paddingAngle={3}
          >
            {items.map((entry, index) => (
              <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
}
