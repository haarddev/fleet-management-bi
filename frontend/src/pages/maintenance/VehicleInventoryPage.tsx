import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../../api/client'
import { TableToolbar } from '../../components/common/TableToolbar'
import { DataTable, type Column } from '../../components/common/DataTable'
import { VehicleInventoryAdvancedFilters } from '../../components/maintenance/VehicleInventoryAdvancedFilters'
import { useFilteredRows } from '../../hooks/useFilteredRows'
import { buildExportColumns } from '../../lib/export'
import {
  applyInventoryAdvancedFilters,
  defaultInventoryAdvancedFilters,
  inventoryAdvancedFiltersActive,
  type InventoryAdvancedFilters,
} from '../../lib/inventoryFilters'
import { formatDate } from '../../utils/format'

type InventoryRow = {
  vehicleNumber: string
  vehicleType: string
  area: string
  status: string
  contractor: string
  startDate: string
  downtimeDays: number
  notes: string
}

export function VehicleInventoryPage() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<InventoryRow[]>([])
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<InventoryAdvancedFilters>(defaultInventoryAdvancedFilters)

  const globallyFiltered = useFilteredRows(rows as (InventoryRow & Record<string, unknown>)[]) as InventoryRow[]

  useEffect(() => {
    apiGet<{ data: InventoryRow[] }>('/maintenance/vehicle-inventory').then((r) => setRows(r.data))
  }, [])

  const filteredRows = useMemo(
    () => applyInventoryAdvancedFilters(globallyFiltered, advancedFilters),
    [globallyFiltered, advancedFilters],
  )

  const columns: Column<InventoryRow>[] = [
    { key: 'vehicleNumber', label: t('common.vehicleNumber') },
    { key: 'vehicleType', label: t('common.vehicleType') },
    { key: 'area', label: t('common.area') },
    { key: 'status', label: t('common.status') },
    { key: 'contractor', label: t('common.contractor') },
    { key: 'startDate', label: t('maintenance.startDate'), render: (r) => (r.startDate ? formatDate(r.startDate) : '—') },
    { key: 'downtimeDays', label: t('maintenance.downtimeDays'), align: 'end' },
    { key: 'notes', label: t('common.notes') },
  ]

  const advancedActive = inventoryAdvancedFiltersActive(advancedFilters)

  return (
    <div>
      <TableToolbar
        resultCount={filteredRows.length}
        totalCount={rows.length}
        exportFilename="vehicle-inventory"
        exportColumns={buildExportColumns(columns)}
        exportData={filteredRows as Record<string, unknown>[]}
        filterActive={advancedOpen || advancedActive}
        onFilter={() => setAdvancedOpen((open) => !open)}
      />

      {advancedOpen && (
        <VehicleInventoryAdvancedFilters
          filters={advancedFilters}
          onChange={(patch) => setAdvancedFilters((prev) => ({ ...prev, ...patch }))}
          onClear={() => setAdvancedFilters(defaultInventoryAdvancedFilters)}
          onClose={() => setAdvancedOpen(false)}
        />
      )}

      <DataTable
        columns={columns}
        data={filteredRows}
        rowKey={(r) => r.vehicleNumber}
        stickyFirst
        emptyMessage={t('common.noData')}
      />
    </div>
  )
}
