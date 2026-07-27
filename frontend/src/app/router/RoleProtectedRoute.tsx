import { PlaceholderPage } from '../../pages/PlaceholderPage';
import { useAuth } from '../../contexts/AuthContext';
import { normalizeRole, type AppRole } from '../../utils/authorization';

interface RoleProtectedRouteProps {
  allowedRoles: AppRole[];
  children: React.ReactElement;
}

export function RoleProtectedRoute({ allowedRoles, children }: RoleProtectedRouteProps) {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  if (!allowedRoles.includes(role)) {
    return (
      <PlaceholderPage
        title="Sin privilegios"
        description="No tienes permisos para acceder a este modulo con tu rol actual."
      />
    );
  }

  return children;
}
