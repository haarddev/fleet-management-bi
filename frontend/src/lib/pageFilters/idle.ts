import type { FilterField } from '../../components/common/GenericAdvancedFiltersPanel'
import { anyActive, inNumericRange, matchesText } from './helpers'

export type IdleVehicleFilters = {
  vehicleType: string
  minProductivity: string
  maxProductivity: string
  minTotalKm: string
}

export const defaultIdleVehicleFilters: IdleVehicleFilters = {
  vehicleType: '',
  minProductivity: '',
  maxProductivity: '',
  minTotalKm: '',
}

export function idleVehicleFiltersActive(filters: IdleVehicleFilters): boolean {
  return anyActive([
    filters.vehicleType,
    filters.minProductivity,
    filters.maxProductivity,
    filters.minTotalKm,
  ])
}

export function applyIdleVehicleFilters<T extends {
  vehicleType: string
  productivityPercent: number
  totalKm: number
}>(rows: T[], filters: IdleVehicleFilters): T[] {
  return rows.filter((row) => {
    if (!matchesText(row.vehicleType, filters.vehicleType)) return false
    if (!inNumericRange(row.productivityPercent, filters.minProductivity, filters.maxProductivity)) {
      return false
    }
    if (filters.minTotalKm.trim() && row.totalKm < Number(filters.minTotalKm)) return false
    return true
  })
}

export function idleVehicleFilterFields(): FilterField[] {
  return [
    { type: 'text', key: 'vehicleType', labelKey: 'common.vehicleType' },
    { type: 'number', key: 'minProductivity', labelKey: 'filters.minProductivity' },
    { type: 'number', key: 'maxProductivity', labelKey: 'filters.maxProductivity' },
    { type: 'number', key: 'minTotalKm', labelKey: 'filters.minTotalKm' },
  ]
}

export type IdleDriverFilters = {
  minProductivity: string
  maxProductivity: string
  minOperatingDays: string
  minVehicleCount: string
}

export const defaultIdleDriverFilters: IdleDriverFilters = {
  minProductivity: '',
  maxProductivity: '',
  minOperatingDays: '',
  minVehicleCount: '',
}

export function idleDriverFiltersActive(filters: IdleDriverFilters): boolean {
  return anyActive([
    filters.minProductivity,
    filters.maxProductivity,
    filters.minOperatingDays,
    filters.minVehicleCount,
  ])
}

export function applyIdleDriverFilters<T extends {
  productivityPercent: number
  operatingDays: number
  vehicleCount: number
}>(rows: T[], filters: IdleDriverFilters): T[] {
  return rows.filter((row) => {
    if (!inNumericRange(row.productivityPercent, filters.minProductivity, filters.maxProductivity)) {
      return false
    }
    if (filters.minOperatingDays.trim() && row.operatingDays < Number(filters.minOperatingDays)) {
      return false
    }
    if (filters.minVehicleCount.trim() && row.vehicleCount < Number(filters.minVehicleCount)) {
      return false
    }
    return true
  })
}

export function idleDriverFilterFields(): FilterField[] {
  return [
    { type: 'number', key: 'minProductivity', labelKey: 'filters.minProductivity' },
    { type: 'number', key: 'maxProductivity', labelKey: 'filters.maxProductivity' },
    { type: 'number', key: 'minOperatingDays', labelKey: 'filters.minOperatingDays' },
    { type: 'number', key: 'minVehicleCount', labelKey: 'filters.minVehicleCount' },
  ]
}
