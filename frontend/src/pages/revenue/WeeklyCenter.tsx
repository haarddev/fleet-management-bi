import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../../api/client'
import { GenericAdvancedFiltersPanel } from '../../components/common/GenericAdvancedFiltersPanel'
import { TableToolbar } from '../../components/common/TableToolbar'
import { KpiCard, KpiGrid } from '../../components/common/KpiGrid'
import { PageTabs } from '../../components/common/PageTabs'
import { useApp } from '../../context/AppContext'
import { useAdvancedFilterPanel } from '../../hooks/useAdvancedFilterPanel'
import { useFilteredRows } from '../../hooks/useFilteredRows'
import { filterDateKeys } from '../../lib/filters'
import {
  applyWeeklyCenterFilters,
  defaultWeeklyCenterFilters,
  weeklyCenterFilterFields,
  weeklyCenterFiltersActive,
} from '../../lib/pageFilters/revenue'
import { cn } from '../../lib/cn'
import { formatChange, formatCurrency, formatDate, formatKpiNumber } from '../../utils/format'

type WeeklyCenterData = {
  kpis: {
    totalRevenue: number
    totalBuses: number
    busesPercent: number
    totalMinibuses: number
    minibusesPercent: number
    totalContractor: number
    contractorPercent: number
    days: number
  }
  weeks: Array<{
    weekNum: number
    year: number
    days: Array<{
      date: string
      revenue: number | null
      vehicles: number
      organicVehicles: number
      changePercent: number | null
      holiday?: string
    }>
    summary: {
      totalIncome: number
      avgDailyRevenue: number
      avgContractor: number
      avgOrganic: number
      changePercent: number
    }
  }>
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function WeeklyCenterPage() {
  const { t } = useTranslation()
  const { filters } = useApp()
  const [data, setData] = useState<WeeklyCenterData | null>(null)
  const [viewTab, setViewTab] = useState('summary')
  const [revenueTab, setRevenueTab] = useState('summary')
  const [dayTypeTab, setDayTypeTab] = useState('weekly')
  const advanced = useAdvancedFilterPanel(defaultWeeklyCenterFilters, weeklyCenterFiltersActive)

  useEffect(() => {
    apiGet<WeeklyCenterData>('/revenue/weekly-center').then(setData).catch(console.error)
  }, [])

  const exportRows = useMemo(() => {
    if (!data) return []
    const allDates = data.weeks.flatMap((w) => w.days.map((d) => d.date))
    const visibleDates = new Set(filterDateKeys(allDates, filters.period))

    return data.weeks.flatMap((week) =>
      week.days
        .filter((day) => visibleDates.has(day.date))
        .map((day) => ({
          week: week.weekNum,
          year: week.year,
          date: day.date,
          revenue: day.revenue ?? '',
          vehicles: day.vehicles,
          organicVehicles: day.organicVehicles,
          changePercent: day.changePercent ?? '',
          holiday: day.holiday ?? '',
        })),
    )
  }, [data, filters.period])

  const globallyFilteredExportRows = useFilteredRows(exportRows)
  const filteredExportRows = useMemo(
    () => applyWeeklyCenterFilters(globallyFilteredExportRows, advanced.filters),
    [globallyFilteredExportRows, advanced.filters],
  )

  const visibleWeeks = useMemo(() => {
    if (!data) return []
    const visibleDates = new Set(filteredExportRows.map((r) => String(r.date)))
    return data.weeks
      .map((week) => ({
        ...week,
        days: week.days.filter((d) => visibleDates.has(d.date)),
      }))
      .filter((week) => week.days.length > 0)
  }, [data, filteredExportRows])

  if (!data) {
    return (
      <div className="flex items-center justify-center gap-3 p-16 text-slate-500">
        <div className="loading-spinner" />
        {t('common.loading')}
      </div>
    )
  }

  const exportColumns = [
    { key: 'week', label: 'Week' },
    { key: 'year', label: 'Year' },
    { key: 'date', label: t('common.date') },
    { key: 'revenue', label: t('weeklyCenter.totalRevenue') },
    { key: 'vehicles', label: t('operation.vehicles') },
    { key: 'organicVehicles', label: t('weeklyCenter.organic') },
    { key: 'changePercent', label: t('weeklyCenter.changeFromPrev') },
    { key: 'holiday', label: t('weeklyCenter.holiday') },
  ]

  return (
    <div className="flex flex-col gap-2">
      <KpiGrid>
        <KpiCard label={t('weeklyCenter.totalRevenue')} value={formatKpiNumber(data.kpis.totalRevenue)} />
        <KpiCard label={t('weeklyCenter.totalBuses')} value={formatKpiNumber(data.kpis.totalBuses)} subValue={`${data.kpis.busesPercent}%`} />
        <KpiCard label={t('weeklyCenter.totalMinibuses')} value={formatKpiNumber(data.kpis.totalMinibuses)} subValue={`${data.kpis.minibusesPercent}%`} />
        <KpiCard label={t('weeklyCenter.totalContractor')} value={formatKpiNumber(data.kpis.totalContractor)} subValue={`${data.kpis.contractorPercent}%`} />
        <KpiCard label={t('weeklyCenter.days')} value={String(data.kpis.days)} variant="success" />
      </KpiGrid>

      <div className="card mb-5 flex flex-col gap-4 p-4">
        <div className="flex min-w-0 flex-wrap items-end gap-x-5 gap-y-4">
          <PageTabs
            label={t('weeklyCenter.viewMode')}
            tabs={[
              { key: 'summary', label: t('weeklyCenter.summary'), icon: 'summary' },
              { key: 'tabular', label: t('weeklyCenter.tabular'), icon: 'table' },
            ]}
            active={viewTab}
            onChange={setViewTab}
            className="mb-0"
          />

          <div
            className="hidden h-9 w-px shrink-0 bg-gradient-to-b from-transparent via-slate-200 to-transparent sm:block"
            aria-hidden
          />

          <PageTabs
            label={t('weeklyCenter.revenueBreakdown')}
            tabs={[
              { key: 'summary', label: t('weeklyCenter.summary'), icon: 'summary' },
              { key: 'organic', label: t('weeklyCenter.organic'), icon: 'organic' },
              { key: 'contractors', label: t('weeklyCenter.contractors'), icon: 'contractors' },
            ]}
            active={revenueTab}
            onChange={setRevenueTab}
            className="mb-0"
          />

          <div
            className="hidden h-9 w-px shrink-0 bg-gradient-to-b from-transparent via-slate-200 to-transparent sm:block"
            aria-hidden
          />

          <PageTabs
            label={t('weeklyCenter.dayFilter')}
            tabs={[
              { key: 'weekly', label: t('weeklyCenter.weekly'), icon: 'calendar' },
              { key: 'weekdays', label: t('weeklyCenter.weekdays'), icon: 'weekdays' },
              { key: 'weekend', label: t('weeklyCenter.weekend'), icon: 'weekend' },
            ]}
            active={dayTypeTab}
            onChange={setDayTypeTab}
            className="mb-0"
          />
        </div>
      </div>

      <TableToolbar
        resultCount={filteredExportRows.length}
        totalCount={exportRows.length}
        exportFilename="weekly-center"
        exportColumns={exportColumns}
        exportData={filteredExportRows}
        {...advanced.toolbarProps}
      />
      {advanced.open && (
        <GenericAdvancedFiltersPanel
          titleKey="filters.advancedFilters"
          fields={weeklyCenterFilterFields()}
          filters={advanced.filters}
          onChange={advanced.patch}
          onClear={advanced.clear}
          onClose={advanced.close}
        />
      )}

      <div className="flex flex-col gap-5">
        {visibleWeeks.map((week) => (
          <div key={`${week.year}-${week.weekNum}`} className="card flex gap-6 overflow-x-auto p-5">
            <div className="min-w-[220px] shrink-0 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
              <h4 className="mb-4 text-base font-bold text-primary">
                {t('weeklyCenter.week', { num: week.weekNum, year: week.year })}
              </h4>
              <dl className="space-y-3">
                {[
                  [t('weeklyCenter.weeklyIncome'), formatCurrency(week.summary.totalIncome)],
                  [t('weeklyCenter.avgDailyRevenue'), formatCurrency(week.summary.avgDailyRevenue)],
                  [t('weeklyCenter.avgContractor'), formatCurrency(week.summary.avgContractor)],
                  [t('weeklyCenter.avgOrganic'), formatCurrency(week.summary.avgOrganic)],
                  [t('weeklyCenter.changeFromPrev'), formatChange(week.summary.changePercent)],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl bg-white/70 px-3 py-2">
                    <dt className="field-label">{label}</dt>
                    <dd className="mt-1 text-[15px] font-bold text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 grid grid-cols-7 gap-2">
                {WEEKDAYS.map((d) => (
                  <span key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {d}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {week.days.map((day) => (
                  <div
                    key={day.date}
                    className={cn(
                      'flex min-h-[96px] flex-col gap-1.5 rounded-xl border p-3 text-xs transition duration-200',
                      day.revenue === null
                        ? 'border-slate-100 bg-slate-50/80 opacity-60'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md',
                      day.holiday && 'border-blue-200 bg-blue-50/50',
                    )}
                  >
                    <span className="text-[11px] font-semibold text-slate-500">{formatDate(day.date)}</span>
                    {day.holiday ? (
                      <span className="inline-flex w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                        {day.holiday}
                      </span>
                    ) : day.revenue !== null ? (
                      <>
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(day.revenue)}</span>
                        <span className="text-[10px] leading-tight text-slate-500">
                          {t('weeklyCenter.vehicles', { count: day.vehicles })} + {day.organicVehicles} organic
                        </span>
                        {day.changePercent !== null && (
                          <span
                            className={cn(
                              'mt-auto inline-flex w-fit rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                              day.changePercent >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600',
                            )}
                          >
                            {day.changePercent >= 0 ? '↑' : '↓'} {Math.abs(day.changePercent)}%
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="my-auto text-center text-xl text-slate-300">—</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
