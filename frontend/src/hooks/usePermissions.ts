import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  canAccessPath,
  canAccessSection,
  canExport,
  getDefaultPathForRole,
  normalizeRole,
  type UserRole,
} from '../lib/rbac'

export function usePermissions() {
  const { user } = useAuth()

  return useMemo(
    () => ({
      role: normalizeRole(user?.role) as UserRole | null,
      canAccessPath: (path: string) => canAccessPath(user?.role, path),
      canAccessSection: (section: string) => canAccessSection(user?.role, section),
      canExport: canExport(user?.role),
      defaultPath: getDefaultPathForRole(user?.role),
    }),
    [user?.role],
  )
}
