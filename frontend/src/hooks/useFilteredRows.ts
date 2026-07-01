import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { applyGlobalFilters } from '../lib/filters'

export function useFilteredRows<T extends Record<string, unknown>>(rows: T[]): T[] {
  const { filters } = useApp()
  return useMemo(() => applyGlobalFilters(rows, filters), [rows, filters])
}
