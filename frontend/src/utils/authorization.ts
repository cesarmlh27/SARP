export type AppRole = 'ADMIN' | 'CAJERO' | 'COCINA' | 'MESERO' | '';

export function normalizeRole(role?: string | null): AppRole {
  const value = (role ?? '').toUpperCase();
  if (value === 'ADMIN' || value === 'CAJERO' || value === 'COCINA' || value === 'MESERO') {
    return value;
  }
  return '';
}

export const ROUTE_PERMISSIONS: Record<string, AppRole[]> = {
  '/dashboard': ['ADMIN', 'CAJERO'],
  '/orders': ['ADMIN', 'CAJERO', 'COCINA', 'MESERO'],
  '/kitchen': ['ADMIN', 'CAJERO', 'COCINA', 'MESERO'],
  '/tables': ['ADMIN', 'CAJERO', 'MESERO'],
  '/products': ['ADMIN', 'CAJERO'],
  '/categories': ['ADMIN', 'CAJERO'],
  '/users': ['ADMIN', 'CAJERO'],
  '/roles': ['ADMIN', 'CAJERO'],
  '/payments': ['ADMIN', 'CAJERO'],
  '/reports': ['ADMIN', 'CAJERO'],
  '/settings': ['ADMIN', 'CAJERO'],
};

export function canAccessPath(role: AppRole, path: string): boolean {
  const allowed = ROUTE_PERMISSIONS[path];
  if (!allowed) {
    return true;
  }
  return allowed.includes(role);
}

export function canManageAll(role: AppRole): boolean {
  return role === 'ADMIN' || role === 'CAJERO';
}
