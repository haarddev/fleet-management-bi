import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../../api/client'
import { TableToolbar } from '../../components/common/TableToolbar'
import { DataTable, type Column } from '../../components/common/DataTable'
import { VehicleRevenueAdvancedFilters } from '../../components/revenue/VehicleRevenueAdvancedFilters'
import { useApp } from '../../context/AppContext'
import { useFilteredRows } from '../../hooks/useFilteredRows'
import { buildExportColumns } from '../../lib/export'
import { filterDateKeys } from '../../lib/filters'
import {
  applyVehicleAdvancedFilters,
  defaultVehicleAdvancedFilters,
  vehicleAdvancedFiltersActive,
  type VehicleAdvancedFilters,
} from '../../lib/vehicleFilters'
import { cn } from '../../lib/cn'
import { formatCurrency } from '../../utils/format'

type VehicleRow = {
  vehicleNumber: string
  threshold: number
  totalPeriod: number
  daily: Record<string, number | null>
}

export function VehicleRevenuePage() {
  const { t } = useTranslation()
  const { filters } = useApp()
  const [rows, setRows] = useState<VehicleRow[]>([])
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<VehicleAdvancedFilters>(defaultVehicleAdvancedFilters)

  const globallyFiltered = useFilteredRows(rows as (VehicleRow & Record<string, unknown>)[]) as VehicleRow[]

  useEffect(() => {
    apiGet<{ data: VehicleRow[] }>('/revenue/vehicles').then((r) => setRows(r.data))
  }, [])

  const allDateKeys = useMemo(() => {
    const keys = new Set<string>()
    rows.forEach((r) => Object.keys(r.daily).forEach((d) => keys.add(d)))
    return Array.from(keys).sort()
  }, [rows])

  const dateKeys = useMemo(
    () => filterDateKeys(allDateKeys, filters.period),
    [allDateKeys, filters.period],
  )

  const filteredRows = useMemo(
    () => applyVehicleAdvancedFilters(globallyFiltered, advancedFilters, dateKeys),
    [globallyFiltered, advancedFilters, dateKeys],
  )

  const columns: Column<VehicleRow & Record<string, unknown>>[] = [
    { key: 'vehicleNumber', label: t('common.vehicleNumber') },
    {
      key: 'threshold',
      label: t('vehicleRevenue.threshold', { value: '' }),
      render: (row) => t('vehicleRevenue.threshold', { value: Math.round(row.threshold / 1000) }),
    },
    {
      key: 'totalPeriod',
      label: t('vehicleRevenue.totalForPeriod'),
      render: (row) => formatCurrency(row.totalPeriod),
    },
    ...dateKeys.map((date) => ({
      key: date,
      label: date.slice(5).replace('-', '/'),
      render: (row: VehicleRow) => {
        const val = row.daily[date]
        if (val === null || val === undefined) return '—'
        const below = val < row.threshold
        return <span className={cn(below && 'font-semibold text-red-600')}>{formatCurrency(val)}</span>
      },
    })),
  ]

  const exportColumns = useMemo(
    () => [
      ...buildExportColumns([
        { key: 'vehicleNumber', label: t('common.vehicleNumber') },
        { key: 'totalPeriod', label: t('vehicleRevenue.totalForPeriod'), render: (r: VehicleRow) => formatCurrency(r.totalPeriod) },
      ]),
      ...dateKeys.map((date) => ({
        key: date,
        label: date,
        getValue: (row: Record<string, unknown>) => {
          const daily = row.daily as Record<string, number | null> | undefined
          const val = daily?.[date]
          return val == null ? '' : formatCurrency(val)
        },
      })),
    ],
    [dateKeys, t],
  )

  const advancedActive = vehicleAdvancedFiltersActive(advancedFilters)

  return (
    <div>
      <TableToolbar
        resultCount={filteredRows.length}
        totalCount={rows.length}
        exportFilename="vehicle-revenue"
        exportColumns={exportColumns}
        exportData={filteredRows as Record<string, unknown>[]}
        filterActive={advancedOpen || advancedActive}
        onFilter={() => setAdvancedOpen((open) => !open)}
      />

      {advancedOpen && (
        <VehicleRevenueAdvancedFilters
          filters={advancedFilters}
          onChange={(patch) => setAdvancedFilters((prev) => ({ ...prev, ...patch }))}
          onClear={() => setAdvancedFilters(defaultVehicleAdvancedFilters)}
          onClose={() => setAdvancedOpen(false)}
        />
      )}

      <DataTable
        columns={columns}
        data={filteredRows as (VehicleRow & Record<string, unknown>)[]}
        rowKey={(r) => r.vehicleNumber}
        stickyFirst
        emptyMessage={t('common.noData')}
      />
    </div>
  )
}
