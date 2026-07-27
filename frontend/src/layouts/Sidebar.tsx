import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import TableRestaurantRoundedIcon from '@mui/icons-material/TableRestaurantRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canAccessPath, normalizeRole } from '../utils/authorization';
import logoSistema from '../../Image/Logo.png';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const drawerWidth = 264;

const menuItems = [
  { label: 'Pedidos', path: '/orders', icon: ReceiptLongRoundedIcon },
  { label: 'Mesas', path: '/tables', icon: TableRestaurantRoundedIcon },
  { label: 'Productos', path: '/products', icon: RestaurantMenuRoundedIcon },
  { label: 'Categorias', path: '/categories', icon: CategoryRoundedIcon },
  { label: 'Usuarios', path: '/users', icon: PeopleRoundedIcon },
  { label: 'Roles', path: '/roles', icon: SecurityRoundedIcon },
  { label: 'Pagos', path: '/payments', icon: PaymentsRoundedIcon },
  { label: 'Configuracion', path: '/settings', icon: SettingsRoundedIcon },
  { label: 'Dashboard y reportes', path: '/reports', icon: BarChartRoundedIcon },
];

function SidebarContent() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const visibleItems = menuItems.filter((item) => canAccessPath(role, item.path));

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.5, py: 2.25, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box
          component="img"
          src={logoSistema}
          alt="Logo SAPR"
          sx={{
            width: 96,
            height: 96,
            objectFit: 'contain',
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.2 }}>
          Admin Restaurante
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 1.2, py: 1.4 }}>
        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              sx={{
                mb: 0.4,
                borderRadius: 2,
                minHeight: 42,
                color: 'text.secondary',
                '&.active': {
                  backgroundColor: 'rgba(11, 125, 99, 0.1)',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
                <Icon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 13.5,
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  if (isTablet) {
    return (
      <Drawer
        open={open}
        onClose={onClose}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <SidebarContent />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  );
}
