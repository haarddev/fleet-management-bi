import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../../api/client'
import { TableToolbar } from '../../components/common/TableToolbar'
import { DataTable, type Column } from '../../components/common/DataTable'
import { ActivityLogFiltersPanel } from '../../components/management/ActivityLogFilters'
import { useFilteredRows } from '../../hooks/useFilteredRows'
import { buildExportColumns } from '../../lib/export'
import {
  activityLogFiltersActive,
  applyActivityLogFilters,
  defaultActivityLogFilters,
  uniqueValues,
  type ActivityLogFilters,
} from '../../lib/activityLogFilters'

type LogRow = {
  id: string
  timestamp: string
  user: string
  actionType: string
  module: string
  details: string
  ip: string
}

export function ActivityLogPage() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<LogRow[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [logFilters, setLogFilters] = useState<ActivityLogFilters>(defaultActivityLogFilters)

  const globallyFiltered = useFilteredRows(rows as (LogRow & Record<string, unknown>)[]) as LogRow[]

  useEffect(() => {
    apiGet<{ data: LogRow[] }>('/management/activity-log').then((r) => setRows(r.data))
  }, [])

  const filteredRows = useMemo(
    () => applyActivityLogFilters(globallyFiltered, logFilters),
    [globallyFiltered, logFilters],
  )

  const users = useMemo(() => uniqueValues(rows, 'user'), [rows])
  const actionTypes = useMemo(() => uniqueValues(rows, 'actionType'), [rows])
  const modules = useMemo(() => uniqueValues(rows, 'module'), [rows])

  const columns: Column<LogRow>[] = [
    {
      key: 'timestamp',
      label: t('common.date'),
      render: (r) => new Date(r.timestamp).toLocaleString(),
    },
    { key: 'user', label: t('management.user') },
    { key: 'actionType', label: t('management.actionType') },
    { key: 'module', label: t('management.module') },
    { key: 'details', label: t('management.details') },
    { key: 'ip', label: t('management.ipDevice') },
  ]

  const filtersActive = activityLogFiltersActive(logFilters)

  return (
    <div>
      <TableToolbar
        resultCount={filteredRows.length}
        totalCount={rows.length}
        exportFilename="activity-log"
        exportColumns={buildExportColumns(columns)}
        exportData={filteredRows as Record<string, unknown>[]}
        filterActive={filtersOpen || filtersActive}
        onFilter={() => setFiltersOpen((open) => !open)}
      />

      {filtersOpen && (
        <ActivityLogFiltersPanel
          filters={logFilters}
          users={users}
          actionTypes={actionTypes}
          modules={modules}
          onChange={(patch) => setLogFilters((prev) => ({ ...prev, ...patch }))}
          onClear={() => setLogFilters(defaultActivityLogFilters)}
          onClose={() => setFiltersOpen(false)}
        />
      )}

      <DataTable columns={columns} data={filteredRows} rowKey={(r) => r.id} emptyMessage={t('common.noData')} />
    </div>
  )
}
