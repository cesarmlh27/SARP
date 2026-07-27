import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSnackbar } from '../components/feedback/SnackbarProvider';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onOpenSidebar: () => void;
}

function getInitials(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) {
    return 'U';
  }

  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

export function Navbar({ onOpenSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const { showSnackbar } = useAppSnackbar();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    showSnackbar('Sesion finalizada', 'success');
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <IconButton sx={{ mr: 1, display: { xs: 'inline-flex', lg: 'none' } }} onClick={onOpenSidebar}>
            <MenuRoundedIcon />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: -0.2 }}>
            Panel Administrativo
          </Typography>
        </Box>

        <Button
          onClick={handleMenuOpen}
          endIcon={<KeyboardArrowDownRoundedIcon fontSize="small" />}
          sx={{
            textTransform: 'none',
            color: 'text.primary',
            px: 1,
          }}
        >
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main', fontSize: 13 }}>
            {getInitials(user?.firstName, user?.lastName)}
          </Avatar>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" sx={{ lineHeight: 1.1, fontWeight: 600 }}>
              {user?.firstName ?? 'Usuario'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1 }}>
              {user?.role ?? 'Rol'}
            </Typography>
          </Box>
        </Button>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem disabled>
            <Typography variant="body2">{user?.email ?? 'Sin correo'}</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            Cerrar sesion
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
