import type { FilterField } from '../../components/common/GenericAdvancedFiltersPanel'
import { anyActive, inDateRange, inNumericRange } from './helpers'

export type WeeklyCenterFilters = {
  dateFrom: string
  dateTo: string
  minRevenue: string
  holidaysOnly: boolean
  minVehicles: string
}

export const defaultWeeklyCenterFilters: WeeklyCenterFilters = {
  dateFrom: '',
  dateTo: '',
  minRevenue: '',
  holidaysOnly: false,
  minVehicles: '',
}

export function weeklyCenterFiltersActive(filters: WeeklyCenterFilters): boolean {
  return anyActive([
    filters.dateFrom,
    filters.dateTo,
    filters.minRevenue,
    filters.minVehicles,
    filters.holidaysOnly,
  ])
}

export function applyWeeklyCenterFilters<T extends {
  date: string
  revenue?: number | string | null
  holiday?: string
  vehicles?: number
}>(rows: T[], filters: WeeklyCenterFilters): T[] {
  return rows.filter((row) => {
    if (!inDateRange(String(row.date), filters.dateFrom, filters.dateTo)) return false
    if (filters.holidaysOnly && !row.holiday) return false

    const revenue = typeof row.revenue === 'number' ? row.revenue : Number(row.revenue)
    if (filters.minRevenue.trim() && !Number.isNaN(revenue) && revenue < Number(filters.minRevenue)) return false

    const vehicles = row.vehicles ?? 0
    if (filters.minVehicles.trim() && vehicles < Number(filters.minVehicles)) return false

    return true
  })
}

export type CustomerRevenueFilters = {
  minRevenue: string
  maxRevenue: string
  minTrips: string
  minVehicles: string
  losingVehiclesOnly: boolean
  minContractorShare: string
}

export const defaultCustomerRevenueFilters: CustomerRevenueFilters = {
  minRevenue: '',
  maxRevenue: '',
  minTrips: '',
  minVehicles: '',
  losingVehiclesOnly: false,
  minContractorShare: '',
}

export function customerRevenueFiltersActive(filters: CustomerRevenueFilters): boolean {
  return anyActive([
    filters.minRevenue,
    filters.maxRevenue,
    filters.minTrips,
    filters.minVehicles,
    filters.minContractorShare,
    filters.losingVehiclesOnly,
  ])
}

export function applyCustomerRevenueFilters<T extends {
  totalRevenue: number
  trips: number
  vehicles: number
  vehiclesAtLoss: number
  contractorSharePercent: number
}>(rows: T[], filters: CustomerRevenueFilters): T[] {
  return rows.filter((row) => {
    if (!inNumericRange(row.totalRevenue, filters.minRevenue, filters.maxRevenue)) return false
    if (filters.minTrips.trim() && row.trips < Number(filters.minTrips)) return false
    if (filters.minVehicles.trim() && row.vehicles < Number(filters.minVehicles)) return false
    if (filters.losingVehiclesOnly && row.vehiclesAtLoss <= 0) return false
    if (
      filters.minContractorShare.trim() &&
      row.contractorSharePercent < Number(filters.minContractorShare)
    ) {
      return false
    }
    return true
  })
}

export function customerRevenueFilterFields(): FilterField[] {
  return [
    { type: 'number', key: 'minRevenue', labelKey: 'filters.minRevenue' },
    { type: 'number', key: 'maxRevenue', labelKey: 'filters.maxRevenue' },
    { type: 'number', key: 'minTrips', labelKey: 'filters.minTrips' },
    { type: 'number', key: 'minVehicles', labelKey: 'filters.minVehicles' },
    { type: 'number', key: 'minContractorShare', labelKey: 'filters.minContractorShare' },
    { type: 'checkbox', key: 'losingVehiclesOnly', labelKey: 'filters.losingVehiclesOnly' },
  ]
}

export type DriverRevenueFilters = {
  driverType: string
  minTotal: string
  maxTotal: string
  excludeZeroRevenue: boolean
  minOperatingDays: string
}

export const defaultDriverRevenueFilters: DriverRevenueFilters = {
  driverType: 'all',
  minTotal: '',
  maxTotal: '',
  excludeZeroRevenue: false,
  minOperatingDays: '',
}

export function driverRevenueFiltersActive(filters: DriverRevenueFilters): boolean {
  return anyActive([
    filters.driverType,
    filters.minTotal,
    filters.maxTotal,
    filters.minOperatingDays,
    filters.excludeZeroRevenue,
  ])
}

export function applyDriverRevenueFilters<T extends {
  driverType: string
  totalPeriod: number
  operatingDays: number
}>(rows: T[], filters: DriverRevenueFilters): T[] {
  return rows.filter((row) => {
    if (filters.driverType !== 'all' && row.driverType !== filters.driverType) return false
    if (filters.excludeZeroRevenue && row.totalPeriod <= 0) return false
    if (!inNumericRange(row.totalPeriod, filters.minTotal, filters.maxTotal)) return false
    if (filters.minOperatingDays.trim() && row.operatingDays < Number(filters.minOperatingDays)) {
      return false
    }
    return true
  })
}

export function driverRevenueFilterFields(t: (key: string) => string): FilterField[] {
  return [
    {
      type: 'select',
      key: 'driverType',
      labelKey: 'driverRevenue.driverType',
      options: [
        { value: 'all', label: t('driverRevenue.all') },
        { value: 'employee', label: t('driverRevenue.employee') },
        { value: 'contractor', label: t('driverRevenue.contractorType') },
      ],
    },
    { type: 'number', key: 'minTotal', labelKey: 'filters.minTotal' },
    { type: 'number', key: 'maxTotal', labelKey: 'filters.maxTotal' },
    { type: 'number', key: 'minOperatingDays', labelKey: 'filters.minOperatingDays' },
    { type: 'checkbox', key: 'excludeZeroRevenue', labelKey: 'filters.excludeZeroRevenue' },
  ]
}

export function weeklyCenterFilterFields(): FilterField[] {
  return [
    { type: 'date', key: 'dateFrom', labelKey: 'filters.dateFrom' },
    { type: 'date', key: 'dateTo', labelKey: 'filters.dateTo' },
    { type: 'number', key: 'minRevenue', labelKey: 'filters.minRevenue' },
    { type: 'number', key: 'minVehicles', labelKey: 'filters.minVehicles' },
    { type: 'checkbox', key: 'holidaysOnly', labelKey: 'filters.holidaysOnly' },
  ]
}
