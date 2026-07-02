import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../../api/client'
import { GenericAdvancedFiltersPanel, type FilterField } from '../../components/common/GenericAdvancedFiltersPanel'
import { TableToolbar } from '../../components/common/TableToolbar'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useAdvancedFilterPanel } from '../../hooks/useAdvancedFilterPanel'
import { useFilteredRows } from '../../hooks/useFilteredRows'
import { buildExportColumns } from '../../lib/export'
import { formatCurrency } from '../../utils/format'

type ListMeta = {
  count: number
  kpi?: { disabled: number; total: number; percent: number }
  total?: number
}

type AdvancedFilterBundle<T, F extends Record<string, string | boolean>> = {
  defaults: F
  isActive: (filters: F) => boolean
  apply: (rows: T[], filters: F) => T[]
  fields: (rows: T[], t: (key: string) => string) => FilterField[]
}

type PageConfig<T extends Record<string, unknown>, F extends Record<string, string | boolean>> = {
  endpoint: string
  exportFilename: string
  columns: Column<T>[]
  rowKey: (row: T) => string
  renderKpi?: (meta: ListMeta) => ReactNode
  advancedFilters?: AdvancedFilterBundle<T, F>
}

export function createMaintenancePage<
  T extends Record<string, unknown>,
  F extends Record<string, string | boolean> = Record<string, string | boolean>,
>(config: PageConfig<T, F>) {
  return function MaintenanceListPage() {
    const { t } = useTranslation()
    const [rows, setRows] = useState<T[]>([])
    const [meta, setMeta] = useState<ListMeta>({ count: 0 })
    const globallyFiltered = useFilteredRows(rows)

    const filterPanel = useAdvancedFilterPanel(
      (config.advancedFilters?.defaults ?? {}) as F,
      config.advancedFilters?.isActive ?? (() => false),
    )

    useEffect(() => {
      apiGet<{ data: T[] } & ListMeta>(config.endpoint).then((r) => {
        setRows(r.data)
        setMeta({ count: r.count, kpi: r.kpi, total: r.total })
      })
    }, [])

    const filteredRows = useMemo(() => {
      if (!filterPanel || !config.advancedFilters) return globallyFiltered
      return config.advancedFilters.apply(globallyFiltered, filterPanel.filters)
    }, [globallyFiltered, filterPanel, config.advancedFilters])

    const filteredTotal = filteredRows.reduce((sum, row) => {
      if ('amount' in row && typeof row.amount === 'number') return sum + row.amount
      if ('potentialIncome' in row && typeof row.potentialIncome === 'number') {
        return sum + row.potentialIncome
      }
      return sum
    }, 0)

    const advancedFields = config.advancedFilters?.fields(rows, t) ?? []

    return (
      <div>
        {config.renderKpi?.(meta)}
        <TableToolbar
          resultCount={filteredRows.length}
          totalCount={rows.length}
          exportFilename={config.exportFilename}
          exportColumns={buildExportColumns(config.columns)}
          exportData={filteredRows}
          {...(filterPanel?.toolbarProps ?? {})}
        />
        {filterPanel?.open && config.advancedFilters && (
          <GenericAdvancedFiltersPanel
            titleKey="filters.advancedFilters"
            fields={advancedFields}
            filters={filterPanel.filters}
            onChange={filterPanel.patch}
            onClear={filterPanel.clear}
            onClose={filterPanel.close}
          />
        )}
        <DataTable
          columns={config.columns}
          data={filteredRows}
          rowKey={config.rowKey}
          stickyFirst
          emptyMessage={t('common.noData')}
        />
        {meta.total !== undefined && (
          <p className="mt-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm">
            {t('common.total')}: {formatCurrency(filteredRows.length < rows.length ? filteredTotal : meta.total)}
          </p>
        )}
      </div>
    )
  }
}
