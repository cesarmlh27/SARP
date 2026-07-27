import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const labelsByPath: Record<string, string> = {
  dashboard: 'Dashboard',
  orders: 'Pedidos',
  tables: 'Mesas',
  products: 'Productos',
  categories: 'Categorias',
  users: 'Usuarios',
  roles: 'Roles',
  payments: 'Pagos',
  reports: 'Reportes',
  settings: 'Configuracion',
};

function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return [];
  }

  return segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;

    return {
      label: labelsByPath[segment] ?? segment,
      path,
    };
  });
}

export function AppBreadcrumbs() {
  const location = useLocation();
  const items = buildBreadcrumbs(location.pathname);

  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumbs separator={<NavigateNextRoundedIcon sx={{ fontSize: 16 }} />} aria-label="breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast) {
          return (
            <Typography key={item.path} variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
              {item.label}
            </Typography>
          );
        }

        return (
          <Link
            key={item.path}
            component={RouterLink}
            to={item.path}
            underline="hover"
            color="text.secondary"
            sx={{ fontSize: 14 }}
          >
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
