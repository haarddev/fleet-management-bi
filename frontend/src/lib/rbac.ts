export const USER_ROLES = ['admin', 'manager', 'maintenance', 'viewer'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const SECTION_ACCESS: Record<UserRole, readonly string[]> = {
  admin: ['revenue', 'maintenance', 'management', 'operation', 'idle', 'settings'],
  manager: ['revenue', 'operation', 'management'],
  maintenance: ['maintenance'],
  viewer: ['revenue', 'operation', 'management', 'idle'],
}

export const SECTION_PATHS: Record<string, readonly string[]> = {
  revenue: ['/daily', '/vehicleRevenue', '/customerRevenue', '/driverRevenue'],
  maintenance: [
    '/maintenance/vehicle-inventory',
    '/maintenance/disabled-vehicles',
    '/maintenance/downtime',
    '/maintenance/agreements',
    '/maintenance/expenses',
    '/maintenance/relocations',
  ],
  management: ['/management/activity-log'],
  operation: ['/operation/daily-status', '/operation/work-schedule'],
  idle: ['/idle/vehicle-analysis', '/idle/driver-analysis'],
  settings: ['/settings'],
}

const PATH_SECTION = new Map<string, string>(
  Object.entries(SECTION_PATHS).flatMap(([section, paths]) => paths.map((path) => [path, section])),
)

export function normalizeRole(role: string | undefined): UserRole | null {
  if (!role) return null
  const normalized = role.toLowerCase() as UserRole
  return USER_ROLES.includes(normalized) ? normalized : null
}

export function canAccessSection(role: string | undefined, section: string): boolean {
  const normalized = normalizeRole(role)
  if (!normalized) return false
  return SECTION_ACCESS[normalized].includes(section)
}

export function canAccessPath(role: string | undefined, path: string): boolean {
  const section = PATH_SECTION.get(path)
  if (!section) return false
  return canAccessSection(role, section)
}

export function canExport(role: string | undefined): boolean {
  return normalizeRole(role) !== 'viewer'
}

export function getDefaultPathForRole(role: string | undefined): string {
  const normalized = normalizeRole(role)
  if (normalized === 'maintenance') return '/maintenance/vehicle-inventory'
  return '/daily'
}

export function getAccessiblePaths(role: string | undefined): string[] {
  const normalized = normalizeRole(role)
  if (!normalized) return []
  return SECTION_ACCESS[normalized].flatMap((section) => [...(SECTION_PATHS[section] ?? [])])
}
