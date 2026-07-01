import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../../api/client'
import { TableToolbar } from '../../components/common/TableToolbar'
import { DataTable, type Column } from '../../components/common/DataTable'
import { DrillDownPanel } from '../../components/common/DrillDownPanel'
import { DrillField, PageWithPanel } from '../../components/common/PageWithPanel'
import { useApp } from '../../context/AppContext'
import { useFilteredRows } from '../../hooks/useFilteredRows'
import { buildExportColumns } from '../../lib/export'
import { filterDateKeys } from '../../lib/filters'
import { formatCurrency } from '../../utils/format'

type DriverRow = {
  id: string
  license: string
  name: string
  area: string
  driverType: string
  totalPeriod: number
  daily: Record<string, number | null>
  trips: number
  operatingDays: number
  avgDailyIncome: number
  vehicles: string[]
  clients: string[]
}

export function DriverRevenuePage() {
  const { t } = useTranslation()
  const { filters } = useApp()
  const [rows, setRows] = useState<DriverRow[]>([])
  const [selected, setSelected] = useState<DriverRow | null>(null)
  const filteredRows = useFilteredRows(rows as (DriverRow & Record<string, unknown>)[]) as DriverRow[]

  useEffect(() => {
    apiGet<{ data: DriverRow[] }>('/revenue/drivers').then((r) => setRows(r.data))
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

  const columns: Column<DriverRow>[] = [
    {
      key: 'name',
      label: t('driverRevenue.licenseName'),
      render: (r) => `${r.license} / ${r.name}`,
    },
    { key: 'area', label: t('common.area') },
    {
      key: 'driverType',
      label: t('driverRevenue.driverType'),
      render: (r) => t(`driverRevenue.${r.driverType === 'employee' ? 'employee' : 'contractorType'}`),
    },
    { key: 'totalPeriod', label: t('vehicleRevenue.totalForPeriod'), align: 'end', render: (r) => formatCurrency(r.totalPeriod) },
    ...dateKeys.map((date) => ({
      key: date,
      label: date.slice(5).replace('-', '/'),
      render: (row: DriverRow) => {
        const val = row.daily[date]
        if (val === null || val === undefined) return '—'
        return formatCurrency(val)
      },
    })),
  ]

  const exportColumns = useMemo(
    () => [
      ...buildExportColumns([
        { key: 'license', label: t('driverRevenue.licenseName') },
        { key: 'name', label: t('common.driver') },
        { key: 'area', label: t('common.area') },
        { key: 'totalPeriod', label: t('vehicleRevenue.totalForPeriod'), render: (r: DriverRow) => formatCurrency(r.totalPeriod) },
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

  const handleSelect = async (row: DriverRow) => {
    const detail = await apiGet<DriverRow>(`/revenue/drivers/${row.id}`)
    setSelected(detail)
  }

  return (
    <PageWithPanel
      panel={
        <DrillDownPanel
          open={!!selected}
          title={selected ? `${selected.name} (${selected.license})` : ''}
          onClose={() => setSelected(null)}
        >
          {selected && (
            <>
              <DrillField label={t('vehicleRevenue.totalForPeriod')} value={formatCurrency(selected.totalPeriod)} />
              <DrillField label={t('driverRevenue.trips')} value={selected.trips} />
              <DrillField label={t('driverRevenue.operatingDays')} value={selected.operatingDays} />
              <DrillField label={t('driverRevenue.avgDailyIncome')} value={formatCurrency(selected.avgDailyIncome)} />
              <DrillField label={t('driverRevenue.vehiclesOperated')} value={selected.vehicles.join(', ')} />
              <DrillField label={t('driverRevenue.clientsServed')} value={selected.clients.join(', ')} />
            </>
          )}
        </DrillDownPanel>
      }
    >
      <TableToolbar
        resultCount={filteredRows.length}
        totalCount={rows.length}
        exportFilename="driver-revenue"
        exportColumns={exportColumns}
        exportData={filteredRows as Record<string, unknown>[]}
      />
      <DataTable
        columns={columns}
        data={filteredRows}
        rowKey={(r) => r.id}
        onRowClick={handleSelect}
        selectedKey={selected?.id}
        stickyFirst
        emptyMessage={t('common.noData')}
      />
    </PageWithPanel>
  )
}
