import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../../api/client'
import { TableToolbar } from '../../components/common/TableToolbar'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useFilteredRows } from '../../hooks/useFilteredRows'
import { buildExportColumns } from '../../lib/export'
import { cn } from '../../lib/cn'
import { formatCurrency, formatDate } from '../../utils/format'

type TripRow = {
  tripId: string
  startTime: string
  endTime: string
  description: string
  customer: string
  area: string
  vehicleType: string
  vehicleNumber: string
  price: number
  estimatedPrice: number
  driverType: string
  driverName: string
  manufacturer: string
  confirmed: boolean
}

type TravelStatusLog = {
  id: string
  loggedAt: string
  tripId: string
  statusTag: string
  driverName: string
  vehicleNumber: string
  details: string
}

function StatusTagBadge({ tag }: { tag: string }) {
  const cancelled = tag.toLowerCase().includes('cancelled')
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
        cancelled ? 'bg-orange-50 text-orange-600' : 'bg-cyan-50 text-cyan-700',
      )}
    >
      {tag}
    </span>
  )
}

export function WorkSchedulePage() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<TripRow[]>([])
  const [statusLogs, setStatusLogs] = useState<TravelStatusLog[]>([])
  const [marked, setMarked] = useState<Record<string, boolean>>({})
  const filteredRows = useFilteredRows(rows as (TripRow & Record<string, unknown>)[]) as TripRow[]

  useEffect(() => {
    apiGet<{ data: TripRow[]; count: number; travelStatusLogs: TravelStatusLog[] }>(
      '/operation/work-schedule',
    ).then((r) => {
      setRows(r.data)
      setStatusLogs(r.travelStatusLogs ?? [])
      setMarked(Object.fromEntries(r.data.map((row) => [row.tripId, row.confirmed])))
    })
  }, [])

  const toggleMarked = (tripId: string) => {
    setMarked((prev) => ({ ...prev, [tripId]: !prev[tripId] }))
  }

  const summary = useMemo(
    () => ({
      sumEstimated: filteredRows.reduce((s, r) => s + r.estimatedPrice, 0),
      sumPrice: filteredRows.reduce((s, r) => s + r.price, 0),
    }),
    [filteredRows],
  )

  const columns: Column<TripRow>[] = [
    { key: 'tripId', label: t('operation.tripId') },
    { key: 'startTime', label: t('operation.startTime') },
    { key: 'endTime', label: t('operation.endTime') },
    { key: 'description', label: t('operation.tripDescription') },
    { key: 'customer', label: t('common.customer') },
    { key: 'area', label: t('common.area') },
    { key: 'vehicleType', label: t('common.vehicleType') },
    { key: 'vehicleNumber', label: t('common.vehicleNumber') },
    { key: 'estimatedPrice', label: t('operation.estimatedPrice'), align: 'end', render: (r) => formatCurrency(r.estimatedPrice) },
    { key: 'price', label: t('operation.price'), align: 'end', render: (r) => formatCurrency(r.price) },
    { key: 'driverName', label: t('common.driver') },
    {
      key: 'driverType',
      label: t('driverRevenue.driverType'),
      render: (r) =>
        t(`driverRevenue.${r.driverType?.toLowerCase() === 'employee' ? 'employee' : 'contractorType'}`),
    },
    {
      key: 'confirmed',
      label: t('operation.marked'),
      align: 'center',
      render: (r) => (
        <label className="inline-flex cursor-pointer items-center justify-center">
          <input
            type="checkbox"
            checked={marked[r.tripId] ?? r.confirmed}
            onChange={() => toggleMarked(r.tripId)}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            aria-label={marked[r.tripId] ?? r.confirmed ? t('operation.marked') : t('operation.unmarked')}
          />
        </label>
      ),
    },
    {
      key: 'manufacturer',
      label: t('operation.manufacturer'),
      render: (r) => <StatusTagBadge tag={r.manufacturer} />,
    },
  ]

  const logColumns: Column<TravelStatusLog>[] = [
    {
      key: 'loggedAt',
      label: t('common.date'),
      render: (r) => formatDate(r.loggedAt),
    },
    { key: 'tripId', label: t('operation.tripId') },
    {
      key: 'statusTag',
      label: t('operation.statusTag'),
      render: (r) => <StatusTagBadge tag={r.statusTag} />,
    },
    { key: 'driverName', label: t('common.driver') },
    { key: 'vehicleNumber', label: t('common.vehicleNumber') },
    { key: 'details', label: t('operation.logDetails') },
  ]

  return (
    <div className="space-y-8">
      <section>
        <TableToolbar
          resultCount={filteredRows.length}
          totalCount={rows.length}
          exportFilename="work-schedule"
          exportColumns={buildExportColumns(columns)}
          exportData={filteredRows.map((r) => ({
            ...r,
            confirmed: marked[r.tripId] ?? r.confirmed,
          })) as Record<string, unknown>[]}
        />
        <DataTable columns={columns} data={filteredRows} rowKey={(r) => r.tripId} stickyFirst emptyMessage={t('common.noData')} />
        <div className="mt-4 flex flex-wrap gap-6 rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50 to-indigo-50/50 px-5 py-4 text-sm font-bold text-slate-700 shadow-sm">
          <span>SUM Estimated: {formatCurrency(summary.sumEstimated)}</span>
          <span>SUM Price: {formatCurrency(summary.sumPrice)}</span>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-800">{t('operation.travelStatusLogs')}</h2>
          <span className="text-sm text-slate-500">
            {t('operation.totalTravelLines', { count: rows.length })}
          </span>
        </div>

        <div className="mb-4 overflow-hidden rounded-xl border border-blue-200/80">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-600 text-left text-white">
                <th className="px-4 py-2 font-semibold">{t('operation.tagMeaning')}</th>
                <th className="px-4 py-2 font-semibold">{t('operation.tagColor')}</th>
                <th className="px-4 py-2 font-semibold">{t('operation.statusTag')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr>
                <td className="px-4 py-2 text-slate-700">{t('operation.tagInProgress')}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-cyan-500" />
                    {t('operation.tagColorProcess')}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <StatusTagBadge tag="BI process" />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-slate-700">{t('operation.tagCancelled')}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-orange-500" />
                    {t('operation.tagColorCancelled')}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <StatusTagBadge tag="BI cancelled" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <TableToolbar
          resultCount={statusLogs.length}
          totalCount={statusLogs.length}
          exportFilename="travel-status-logs"
          exportColumns={buildExportColumns(logColumns)}
          exportData={statusLogs as Record<string, unknown>[]}
        />
        <DataTable
          columns={logColumns}
          data={statusLogs}
          rowKey={(r) => r.id}
          stickyFirst
          emptyMessage={t('common.noData')}
        />
      </section>
    </div>
  )
}
