import type { FilterField } from '../../components/common/GenericAdvancedFiltersPanel'
import { anyActive, inDateRange, inNumericRange, matchesText, uniqueValues } from './helpers'

export type DisabledVehiclesFilters = {
  status: string
  vehicleType: string
  minDaysOff: string
  maxDaysOff: string
}

export const defaultDisabledVehiclesFilters: DisabledVehiclesFilters = {
  status: 'all',
  vehicleType: '',
  minDaysOff: '',
  maxDaysOff: '',
}

export function disabledVehiclesFiltersActive(filters: DisabledVehiclesFilters): boolean {
  return anyActive([filters.status, filters.vehicleType, filters.minDaysOff, filters.maxDaysOff])
}

export function applyDisabledVehiclesFilters<T extends {
  status?: string
  vehicleType?: string
  daysOff?: number
}>(rows: T[], filters: DisabledVehiclesFilters): T[] {
  return rows.filter((row) => {
    if (filters.status !== 'all' && row.status?.toLowerCase() !== filters.status.toLowerCase()) {
      return false
    }
    if (!matchesText(row.vehicleType, filters.vehicleType)) return false
    if (!inNumericRange(row.daysOff ?? 0, filters.minDaysOff, filters.maxDaysOff)) return false
    return true
  })
}

export function disabledVehiclesFilterFields(
  rows: Array<{ status?: string }>,
  t: (key: string) => string,
): FilterField[] {
  const statuses = uniqueValues(rows, (row) => row.status ?? '')
  return [
    {
      type: 'select',
      key: 'status',
      labelKey: 'common.status',
      options: [
        { value: 'all', label: t('filters.all') },
        ...statuses.map((status) => ({ value: status.toLowerCase(), label: status })),
      ],
    },
    { type: 'text', key: 'vehicleType', labelKey: 'common.vehicleType' },
    { type: 'number', key: 'minDaysOff', labelKey: 'filters.minDaysOff' },
    { type: 'number', key: 'maxDaysOff', labelKey: 'filters.maxDaysOff' },
  ]
}

export type DowntimeFilters = {
  dateFrom: string
  dateTo: string
  minStandingDays: string
  reason: string
}

export const defaultDowntimeFilters: DowntimeFilters = {
  dateFrom: '',
  dateTo: '',
  minStandingDays: '',
  reason: '',
}

export function downtimeFiltersActive(filters: DowntimeFilters): boolean {
  return anyActive([filters.dateFrom, filters.dateTo, filters.minStandingDays, filters.reason])
}

export function applyDowntimeFilters<T extends {
  date?: string
  standingDays?: number
  reason?: string
}>(rows: T[], filters: DowntimeFilters): T[] {
  return rows.filter((row) => {
    if (!inDateRange(row.date, filters.dateFrom, filters.dateTo)) return false
    if (filters.minStandingDays.trim() && (row.standingDays ?? 0) < Number(filters.minStandingDays)) {
      return false
    }
    if (!matchesText(row.reason, filters.reason)) return false
    return true
  })
}

export function downtimeFilterFields(): FilterField[] {
  return [
    { type: 'date', key: 'dateFrom', labelKey: 'filters.dateFrom' },
    { type: 'date', key: 'dateTo', labelKey: 'filters.dateTo' },
    { type: 'number', key: 'minStandingDays', labelKey: 'filters.minStandingDays' },
    { type: 'text', key: 'reason', labelKey: 'filters.reason' },
  ]
}

export type AgreementsFilters = {
  status: string
  supplier: string
  serviceType: string
}

export const defaultAgreementsFilters: AgreementsFilters = {
  status: 'all',
  supplier: '',
  serviceType: '',
}

export function agreementsFiltersActive(filters: AgreementsFilters): boolean {
  return anyActive([filters.status, filters.supplier, filters.serviceType])
}

export function applyAgreementsFilters<T extends {
  status?: string
  supplier?: string
  serviceTypes?: string
}>(rows: T[], filters: AgreementsFilters): T[] {
  return rows.filter((row) => {
    if (filters.status !== 'all' && row.status?.toLowerCase() !== filters.status.toLowerCase()) {
      return false
    }
    if (!matchesText(row.supplier, filters.supplier)) return false
    if (!matchesText(row.serviceTypes, filters.serviceType)) return false
    return true
  })
}

export function agreementsFilterFields(
  rows: Array<{ status?: string }>,
  t: (key: string) => string,
): FilterField[] {
  const statuses = uniqueValues(rows, (row) => row.status ?? '')
  return [
    {
      type: 'select',
      key: 'status',
      labelKey: 'common.status',
      options: [
        { value: 'all', label: t('filters.all') },
        ...statuses.map((status) => ({ value: status.toLowerCase(), label: status })),
      ],
    },
    { type: 'text', key: 'supplier', labelKey: 'filters.supplier' },
    { type: 'text', key: 'serviceType', labelKey: 'filters.serviceType' },
  ]
}

export type ExpensesFilters = {
  category: string
  provider: string
  dateFrom: string
  dateTo: string
  minAmount: string
  maxAmount: string
}

export const defaultExpensesFilters: ExpensesFilters = {
  category: 'all',
  provider: '',
  dateFrom: '',
  dateTo: '',
  minAmount: '',
  maxAmount: '',
}

export function expensesFiltersActive(filters: ExpensesFilters): boolean {
  return anyActive([
    filters.category,
    filters.provider,
    filters.dateFrom,
    filters.dateTo,
    filters.minAmount,
    filters.maxAmount,
  ])
}

export function applyExpensesFilters<T extends {
  category?: string
  provider?: string
  date?: string
  amount?: number
}>(rows: T[], filters: ExpensesFilters): T[] {
  return rows.filter((row) => {
    if (filters.category !== 'all' && row.category !== filters.category) return false
    if (!matchesText(row.provider, filters.provider)) return false
    if (!inDateRange(row.date, filters.dateFrom, filters.dateTo)) return false
    if (!inNumericRange(row.amount ?? 0, filters.minAmount, filters.maxAmount)) return false
    return true
  })
}

export function expensesFilterFields(
  rows: Array<{ category?: string }>,
  t: (key: string) => string,
): FilterField[] {
  const categories = uniqueValues(rows, (row) => row.category ?? '')
  return [
    {
      type: 'select',
      key: 'category',
      labelKey: 'filters.category',
      options: [
        { value: 'all', label: t('filters.all') },
        ...categories.map((category) => ({ value: category, label: category })),
      ],
    },
    { type: 'text', key: 'provider', labelKey: 'filters.provider' },
    { type: 'date', key: 'dateFrom', labelKey: 'filters.dateFrom' },
    { type: 'date', key: 'dateTo', labelKey: 'filters.dateTo' },
    { type: 'number', key: 'minAmount', labelKey: 'filters.minAmount' },
    { type: 'number', key: 'maxAmount', labelKey: 'filters.maxAmount' },
  ]
}

export type RelocationsFilters = {
  dateFrom: string
  dateTo: string
  fromArea: string
  toArea: string
}

export const defaultRelocationsFilters: RelocationsFilters = {
  dateFrom: '',
  dateTo: '',
  fromArea: '',
  toArea: '',
}

export function relocationsFiltersActive(filters: RelocationsFilters): boolean {
  return anyActive([filters.dateFrom, filters.dateTo, filters.fromArea, filters.toArea])
}

export function applyRelocationsFilters<T extends {
  changeDate?: string
  fromArea?: string
  toArea?: string
}>(rows: T[], filters: RelocationsFilters): T[] {
  return rows.filter((row) => {
    if (!inDateRange(row.changeDate, filters.dateFrom, filters.dateTo)) return false
    if (!matchesText(row.fromArea, filters.fromArea)) return false
    if (!matchesText(row.toArea, filters.toArea)) return false
    return true
  })
}

export function relocationsFilterFields(): FilterField[] {
  return [
    { type: 'date', key: 'dateFrom', labelKey: 'filters.dateFrom' },
    { type: 'date', key: 'dateTo', labelKey: 'filters.dateTo' },
    { type: 'text', key: 'fromArea', labelKey: 'filters.fromArea' },
    { type: 'text', key: 'toArea', labelKey: 'filters.toArea' },
  ]
}
