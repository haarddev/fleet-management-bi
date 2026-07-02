export const USER_ROLES = ['admin', 'manager', 'maintenance', 'viewer'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SECTION_ACCESS: Record<UserRole, readonly string[]> = {
  admin: ['revenue', 'maintenance', 'management', 'operation', 'idle', 'settings'],
  manager: ['revenue', 'operation', 'management'],
  maintenance: ['maintenance'],
  viewer: ['revenue', 'operation', 'management', 'idle'],
};

export const API_MODULE_ROLES: Record<string, readonly UserRole[]> = {
  revenue: ['admin', 'manager', 'viewer'],
  maintenance: ['admin', 'maintenance'],
  management: ['admin', 'manager', 'viewer'],
  operation: ['admin', 'manager', 'viewer'],
  idle: ['admin', 'viewer'],
  settings: ['admin'],
};

export function isAdminRole(role: string | undefined): boolean {
  return normalizeRole(role) === 'admin';
}

export function normalizeRole(role: string | undefined): UserRole | null {
  if (!role) return null;
  const normalized = role.toLowerCase() as UserRole;
  return USER_ROLES.includes(normalized) ? normalized : null;
}

export function canAccessModule(role: string | undefined, module: string): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  const allowed = API_MODULE_ROLES[module];
  return allowed ? allowed.includes(normalized) : false;
}
