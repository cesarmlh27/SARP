import { Box, CircularProgress, Typography } from '@mui/material';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';

const LoginPage = lazy(() => import('../../features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RecoverPasswordPage = lazy(() =>
  import('../../features/auth/pages/RecoverPasswordPage').then((module) => ({ default: module.RecoverPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('../../features/auth/pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })),
);
const OrdersPage = lazy(() => import('../../features/orders/pages/OrdersPage').then((module) => ({ default: module.OrdersPage })));
const TablesPage = lazy(() => import('../../features/tables/pages/TablesPage').then((module) => ({ default: module.TablesPage })));
const CategoriesPage = lazy(() =>
  import('../../features/categories/pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })),
);
const ProductsPage = lazy(() =>
  import('../../features/products/pages/ProductsPage').then((module) => ({ default: module.ProductsPage })),
);
const UsersPage = lazy(() => import('../../features/users/pages/UsersPage').then((module) => ({ default: module.UsersPage })));
const RolesPage = lazy(() => import('../../features/roles/pages/RolesPage').then((module) => ({ default: module.RolesPage })));
const PaymentsPage = lazy(() =>
  import('../../features/payments/pages/PaymentsPage').then((module) => ({ default: module.PaymentsPage })),
);
const ReportsPage = lazy(() =>
  import('../../features/reports/pages/ReportsPage').then((module) => ({ default: module.ReportsPage })),
);
const SettingsPage = lazy(() =>
  import('../../features/settings/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);

function RouteLoadingFallback() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <CircularProgress size={30} />
      <Typography variant="body2" color="text.secondary">
        Cargando modulo...
      </Typography>
    </Box>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar-contrasena" element={<RecoverPasswordPage />} />
        <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<RoleProtectedRoute allowedRoles={['ADMIN', 'CAJERO']}><Navigate to="/reports" replace /></RoleProtectedRoute>} />
            <Route path="/orders" element={<RoleProtectedRoute allowedRoles={['ADMIN', 'CAJERO', 'COCINA', 'MESERO']}><OrdersPage /></RoleProtectedRoute>} />
            <Route path="/kitchen" element={<RoleProtectedRoute allowedRoles={['ADMIN', 'CAJERO', 'COCINA', 'MESERO']}><Navigate to="/orders?tab=kitchen" replace /></RoleProtectedRoute>} />
            <Route path="/tables" element={<RoleProtectedRoute allowedRoles={['ADMIN', 'CAJERO', 'MESERO']}><TablesPage /></RoleProtectedRoute>} />
            <Route path="/products" element={<RoleProtectedRoute allowedRoles={['ADMIN', 'CAJERO']}><ProductsPage /></RoleProtectedRoute>} />
            <Route path="/categories" element={<RoleProtectedRoute allowedRoles={['ADMIN', 'CAJERO']}><CategoriesPage /></RoleProtectedRoute>} />
            <Route path="/users" element={<RoleProtectedRoute allowedRoles={['ADMIN', 'CAJERO']}><UsersPage /></RoleProtectedRoute>} />
            <Route path="/roles" element={<RoleProtectedRoute allowedRoles={['ADMIN', 'CAJERO']}><RolesPage /></RoleProtectedRoute>} />
            <Route path="/payments" element={<RoleProtectedRoute allowedRoles={['ADMIN', 'CAJERO']}><PaymentsPage /></RoleProtectedRoute>} />
            <Route path="/reports" element={<RoleProtectedRoute allowedRoles={['ADMIN', 'CAJERO']}><ReportsPage /></RoleProtectedRoute>} />
            <Route path="/settings" element={<RoleProtectedRoute allowedRoles={['ADMIN', 'CAJERO']}><SettingsPage /></RoleProtectedRoute>} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
