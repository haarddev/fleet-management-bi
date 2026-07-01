export type InventoryAdvancedFilters = {
  status: string
  vehicleType: string
  contractor: string
  minDowntime: string
  maxDowntime: string
  withDowntimeOnly: boolean
}

export const defaultInventoryAdvancedFilters: InventoryAdvancedFilters = {
  status: 'all',
  vehicleType: '',
  contractor: '',
  minDowntime: '',
  maxDowntime: '',
  withDowntimeOnly: false,
}

type InventoryRow = {
  status?: string
  vehicleType?: string
  contractor?: string
  downtimeDays?: number
}

export function inventoryAdvancedFiltersActive(filters: InventoryAdvancedFilters): boolean {
  return (
    filters.status !== 'all' ||
    filters.vehicleType.trim() !== '' ||
    filters.contractor.trim() !== '' ||
    filters.minDowntime.trim() !== '' ||
    filters.maxDowntime.trim() !== '' ||
    filters.withDowntimeOnly
  )
}

export function applyInventoryAdvancedFilters<T extends InventoryRow>(
  rows: T[],
  filters: InventoryAdvancedFilters,
): T[] {
  return rows.filter((row) => {
    if (filters.status !== 'all' && row.status?.toLowerCase() !== filters.status.toLowerCase()) {
      return false
    }

    if (filters.vehicleType.trim()) {
      const type = (row.vehicleType ?? '').toLowerCase()
      if (!type.includes(filters.vehicleType.trim().toLowerCase())) return false
    }

    if (filters.contractor.trim()) {
      const contractor = (row.contractor ?? '').toLowerCase()
      if (!contractor.includes(filters.contractor.trim().toLowerCase())) return false
    }

    const downtime = row.downtimeDays ?? 0
    if (filters.withDowntimeOnly && downtime <= 0) return false

    const min = filters.minDowntime.trim() ? Number(filters.minDowntime) : null
    const max = filters.maxDowntime.trim() ? Number(filters.maxDowntime) : null
    if (min !== null && !Number.isNaN(min) && downtime < min) return false
    if (max !== null && !Number.isNaN(max) && downtime > max) return false

    return true
  })
}
