export type NavItem = {
  key: string
  labelKey: string
  path?: string
  children?: NavItem[]
  defaultExpanded?: boolean
}

export const navigation: NavItem[] = [
  {
    key: 'revenue',
    labelKey: 'nav.revenue',
    defaultExpanded: true,
    children: [
      { key: 'weekly-center', labelKey: 'nav.weeklyCenter', path: '/daily' },
      { key: 'vehicle-revenue', labelKey: 'nav.vehicleRevenue', path: '/vehicleRevenue' },
      { key: 'customer-revenue', labelKey: 'nav.customerRevenue', path: '/customerRevenue' },
      { key: 'driver-revenue', labelKey: 'nav.driverRevenue', path: '/driverRevenue' },
    ],
  },
  {
    key: 'maintenance',
    labelKey: 'nav.maintenance',
    defaultExpanded: true,
    children: [
      { key: 'vehicle-inventory', labelKey: 'nav.vehicleInventory', path: '/maintenance/vehicle-inventory' },
      { key: 'disabled-vehicles', labelKey: 'nav.disabledVehicles', path: '/maintenance/disabled-vehicles' },
      { key: 'downtime', labelKey: 'nav.downtime', path: '/maintenance/downtime' },
      { key: 'agreements', labelKey: 'nav.maintenanceAgreements', path: '/maintenance/agreements' },
      { key: 'expenses', labelKey: 'nav.vehicleExpenses', path: '/maintenance/expenses' },
      { key: 'relocations', labelKey: 'nav.vehicleRelocations', path: '/maintenance/relocations' },
    ],
  },
  {
    key: 'management',
    labelKey: 'nav.management',
    children: [
      { key: 'activity-log', labelKey: 'nav.activityLog', path: '/management/activity-log' },
    ],
  },
  {
    key: 'operation',
    labelKey: 'nav.operation',
    children: [
      { key: 'daily-status', labelKey: 'nav.dailyStatus', path: '/operation/daily-status' },
      { key: 'work-schedule', labelKey: 'nav.workSchedule', path: '/operation/work-schedule' },
    ],
  },
  {
    key: 'idle',
    labelKey: 'nav.idle',
    children: [
      { key: 'vehicle-idle', labelKey: 'nav.vehicleIdleAnalysis', path: '/idle/vehicle-analysis' },
      { key: 'driver-idle', labelKey: 'nav.driverIdleAnalysis', path: '/idle/driver-analysis' },
    ],
  },
]
