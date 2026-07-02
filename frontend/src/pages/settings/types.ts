export type ManagedUser = {
  id: number
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type SettingsOverview = {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  adminCount: number
  usersByRole: Array<{ role: string; count: number }>
  roles: string[]
}

export type SystemSettings = {
  organizationName: string
  sessionHours: number
  allowViewerExport: boolean
  maintenanceMode: boolean
}

export type RoleAccessRow = {
  role: string
  sections: {
    revenue: boolean
    maintenance: boolean
    management: boolean
    operation: boolean
    idle: boolean
    settings: boolean
  }
  canExport: boolean
}
