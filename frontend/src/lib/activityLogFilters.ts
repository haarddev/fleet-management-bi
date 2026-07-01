export type ActivityLogFilters = {
  dateFrom: string
  dateTo: string
  user: string
  actionType: string
  module: string
}

export const defaultActivityLogFilters: ActivityLogFilters = {
  dateFrom: '',
  dateTo: '',
  user: 'all',
  actionType: 'all',
  module: 'all',
}

type LogRow = {
  timestamp: string
  user: string
  actionType: string
  module: string
}

export function activityLogFiltersActive(filters: ActivityLogFilters): boolean {
  return (
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.user !== 'all' ||
    filters.actionType !== 'all' ||
    filters.module !== 'all'
  )
}

export function applyActivityLogFilters<T extends LogRow>(rows: T[], filters: ActivityLogFilters): T[] {
  return rows.filter((row) => {
    const loggedAt = new Date(row.timestamp)
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom)
      from.setHours(0, 0, 0, 0)
      if (loggedAt < from) return false
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      to.setHours(23, 59, 59, 999)
      if (loggedAt > to) return false
    }
    if (filters.user !== 'all' && row.user !== filters.user) return false
    if (filters.actionType !== 'all' && row.actionType !== filters.actionType) return false
    if (filters.module !== 'all' && row.module !== filters.module) return false
    return true
  })
}

export function uniqueValues(rows: LogRow[], key: keyof LogRow): string[] {
  return Array.from(new Set(rows.map((r) => String(r[key]).trim()).filter(Boolean))).sort()
}
