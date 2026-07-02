import type { FilterField } from '../../components/common/GenericAdvancedFiltersPanel'
import { anyActive, matchesText } from './helpers'

export type VehicleTableFilters = {
  status: string
  vehicleType: string
  minDaysOff: string
  hasNotesOnly: boolean
}

export const defaultVehicleTableFilters: VehicleTableFilters = {
  status: 'all',
  vehicleType: '',
  minDaysOff: '',
  hasNotesOnly: false,
}

export function vehicleTableFiltersActive(filters: VehicleTableFilters): boolean {
  return anyActive([filters.status, filters.vehicleType, filters.minDaysOff, filters.hasNotesOnly])
}

export function applyVehicleTableFilters<T extends {
  status?: string
  vehicleType?: string
  daysOff?: number
  notes?: string
}>(rows: T[], filters: VehicleTableFilters): T[] {
  return rows.filter((row) => {
    if (filters.status !== 'all' && row.status?.toLowerCase() !== filters.status.toLowerCase()) {
      return false
    }
    if (!matchesText(row.vehicleType, filters.vehicleType)) return false
    if (filters.minDaysOff.trim() && (row.daysOff ?? 0) < Number(filters.minDaysOff)) return false
    if (filters.hasNotesOnly && !(row.notes ?? '').trim()) return false
    return true
  })
}

export function vehicleTableFilterFields(t: (key: string) => string): FilterField[] {
  return [
    {
      type: 'select',
      key: 'status',
      labelKey: 'common.status',
      options: [
        { value: 'all', label: t('filters.all') },
        { value: 'active', label: t('maintenance.active') },
        { value: 'disabled', label: t('operation.disabled') },
      ],
    },
    { type: 'text', key: 'vehicleType', labelKey: 'common.vehicleType' },
    { type: 'number', key: 'minDaysOff', labelKey: 'filters.minDaysOff' },
    { type: 'checkbox', key: 'hasNotesOnly', labelKey: 'filters.hasNotesOnly' },
  ]
}

export type WorkScheduleFilters = {
  customer: string
  area: string
  vehicleType: string
  driverType: string
  markedOnly: boolean
  cancelledOnly: boolean
}

export const defaultWorkScheduleFilters: WorkScheduleFilters = {
  customer: '',
  area: '',
  vehicleType: '',
  driverType: 'all',
  markedOnly: false,
  cancelledOnly: false,
}

export function workScheduleFiltersActive(filters: WorkScheduleFilters): boolean {
  return anyActive([
    filters.customer,
    filters.area,
    filters.vehicleType,
    filters.driverType,
    filters.markedOnly,
    filters.cancelledOnly,
  ])
}

export function applyWorkScheduleFilters<T extends {
  tripId: string
  customer: string
  area: string
  vehicleType: string
  driverType: string
  manufacturer: string
  confirmed: boolean
}>(
  rows: T[],
  filters: WorkScheduleFilters,
  marked: Record<string, boolean>,
): T[] {
  return rows.filter((row) => {
    if (!matchesText(row.customer, filters.customer)) return false
    if (!matchesText(row.area, filters.area)) return false
    if (!matchesText(row.vehicleType, filters.vehicleType)) return false
    if (filters.driverType !== 'all' && row.driverType?.toLowerCase() !== filters.driverType) {
      return false
    }
    if (filters.markedOnly && !(marked[row.tripId] ?? row.confirmed)) return false
    if (filters.cancelledOnly && !row.manufacturer.toLowerCase().includes('cancelled')) return false
    return true
  })
}

export type WorkScheduleLogFilters = {
  statusTag: string
  tripId: string
  driverName: string
}

export const defaultWorkScheduleLogFilters: WorkScheduleLogFilters = {
  statusTag: 'all',
  tripId: '',
  driverName: '',
}

export function workScheduleLogFiltersActive(filters: WorkScheduleLogFilters): boolean {
  return anyActive([filters.statusTag, filters.tripId, filters.driverName])
}

export function applyWorkScheduleLogFilters<T extends {
  statusTag: string
  tripId: string
  driverName: string
}>(rows: T[], filters: WorkScheduleLogFilters): T[] {
  return rows.filter((row) => {
    if (filters.statusTag !== 'all' && row.statusTag !== filters.statusTag) return false
    if (!matchesText(row.tripId, filters.tripId)) return false
    if (!matchesText(row.driverName, filters.driverName)) return false
    return true
  })
}

export function workScheduleFilterFields(t: (key: string) => string): FilterField[] {
  return [
    { type: 'text', key: 'customer', labelKey: 'common.customer' },
    { type: 'text', key: 'area', labelKey: 'common.area' },
    { type: 'text', key: 'vehicleType', labelKey: 'common.vehicleType' },
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
    { type: 'checkbox', key: 'markedOnly', labelKey: 'operation.marked' },
    { type: 'checkbox', key: 'cancelledOnly', labelKey: 'filters.cancelledOnly' },
  ]
}

export function workScheduleLogFilterFields(t: (key: string) => string): FilterField[] {
  return [
    {
      type: 'select',
      key: 'statusTag',
      labelKey: 'operation.statusTag',
      options: [
        { value: 'all', label: t('filters.all') },
        { value: 'BI process', label: 'BI process' },
        { value: 'BI cancelled', label: 'BI cancelled' },
      ],
    },
    { type: 'text', key: 'tripId', labelKey: 'operation.tripId' },
    { type: 'text', key: 'driverName', labelKey: 'common.driver' },
  ]
}
