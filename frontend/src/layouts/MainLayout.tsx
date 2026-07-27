import { Box, Container } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppBreadcrumbs } from '../components/navigation/AppBreadcrumbs';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', backgroundColor: 'background.default' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        <Container
          maxWidth={false}
          sx={{
            px: { xs: 2, md: 3.5 },
            py: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <AppBreadcrumbs />
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
