export type VehicleAdvancedFilters = {
  belowThresholdOnly: boolean
  excludeZeroRevenue: boolean
  minTotal: string
  maxTotal: string
}

export const defaultVehicleAdvancedFilters: VehicleAdvancedFilters = {
  belowThresholdOnly: false,
  excludeZeroRevenue: false,
  minTotal: '',
  maxTotal: '',
}

type VehicleRow = {
  threshold: number
  totalPeriod: number
  daily: Record<string, number | null>
}

export function vehicleAdvancedFiltersActive(filters: VehicleAdvancedFilters): boolean {
  return (
    filters.belowThresholdOnly ||
    filters.excludeZeroRevenue ||
    filters.minTotal.trim() !== '' ||
    filters.maxTotal.trim() !== ''
  )
}

export function applyVehicleAdvancedFilters<T extends VehicleRow>(
  rows: T[],
  filters: VehicleAdvancedFilters,
  dateKeys: string[],
): T[] {
  return rows.filter((row) => {
    if (filters.excludeZeroRevenue && row.totalPeriod <= 0) return false

    const min = filters.minTotal.trim() ? Number(filters.minTotal) : null
    const max = filters.maxTotal.trim() ? Number(filters.maxTotal) : null
    if (min !== null && !Number.isNaN(min) && row.totalPeriod < min) return false
    if (max !== null && !Number.isNaN(max) && row.totalPeriod > max) return false

    if (filters.belowThresholdOnly) {
      const hasBelow = dateKeys.some((date) => {
        const val = row.daily[date]
        return val !== null && val !== undefined && val < row.threshold
      })
      if (!hasBelow) return false
    }

    return true
  })
}
