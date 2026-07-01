import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../../api/client'
import { DateRangeFilter } from '../../components/common/DateRangeFilter'
import { DrillDownPanel } from '../../components/common/DrillDownPanel'
import { TableToolbar } from '../../components/common/TableToolbar'
import { DataTable, type Column } from '../../components/common/DataTable'
import { DrillField, PageWithPanel } from '../../components/common/PageWithPanel'
import { useFilteredRows } from '../../hooks/useFilteredRows'
import { buildExportColumns, downloadCsv } from '../../lib/export'
import { demoDateRange, formatRangeDisplay, toInputDate } from '../../lib/dateRange'
import { driverIdleDummyRows, vehicleIdleDummyRows } from '../../lib/idleMockData'
import { formatPercent } from '../../utils/format'

type IdleVehicle = {
  vehicleNumber: string
  area: string
  vehicleType: string
  totalKm: number
  productiveKm: number
  idleKm: number
  productivityPercent: number
}

type IdleDriver = {
  driverName: string
  area: string
  totalKm: number
  productiveKm: number
  idleKm: number
  productivityPercent: number
  operatingDays: number
  vehicleCount: number
}

type IdleDailyRow = {
  date: string
  totalKm: number
  productiveKm: number
  idleKm: number
  productivityPercent: number
}

type DriverDailyRow = IdleDailyRow & {
  productiveTrips: number
  vehicleCount: number
}

type IdleTripRow = {
  tripId: string
  startTime: string
  endTime: string
  customer: string
  route: string
  km: number
}

function dateRangeDays(start: string, end: string): string[] {
  if (!start || !end) return []

  const [startY, startM, startD] = start.split('-').map(Number)
  const [endY, endM, endD] = end.split('-').map(Number)
  const current = new Date(startY, startM - 1, startD)
  const last = new Date(endY, endM - 1, endD)

  if (current > last) return []

  const days: string[] = []
  while (current <= last) {
    days.push(toInputDate(current))
    current.setDate(current.getDate() + 1)
  }

  return days
}

function distribute(value: number, index: number, count: number) {
  if (!count) return 0
  const base = value / count
  const variance = index % 3 === 0 ? 1.08 : index % 3 === 1 ? 0.94 : 0.98
  return Math.max(0, Math.round(base * variance))
}

function buildDailyRows(vehicle: IdleVehicle | null, start: string, end: string): IdleDailyRow[] {
  if (!vehicle) return []

  const days = dateRangeDays(start, end)
  return days.map((date, index) => {
    const totalKm = distribute(vehicle.totalKm, index, days.length)
    const productiveKm = Math.min(totalKm, distribute(vehicle.productiveKm, index, days.length))
    const idleKm = Math.max(0, totalKm - productiveKm)
    const productivityPercent = totalKm ? (productiveKm / totalKm) * 100 : 0

    return {
      date,
      totalKm,
      productiveKm,
      idleKm,
      productivityPercent,
    }
  })
}

function buildTripsForDay(vehicle: IdleVehicle, day: IdleDailyRow): IdleTripRow[] {
  const firstKm = Math.max(1, Math.round(day.productiveKm * 0.58))
  const secondKm = Math.max(0, day.productiveKm - firstKm)

  return [
    {
      tripId: `${vehicle.vehicleNumber}-${day.date}-1`,
      startTime: '08:00',
      endTime: '10:15',
      customer: 'Corporate travel',
      route: `${vehicle.area} → Central station`,
      km: firstKm,
    },
    {
      tripId: `${vehicle.vehicleNumber}-${day.date}-2`,
      startTime: '13:30',
      endTime: '15:10',
      customer: 'Contractor travel',
      route: `Central station → ${vehicle.area}`,
      km: secondKm,
    },
  ].filter((trip) => trip.km > 0)
}

function buildDriverDailyRows(driver: IdleDriver | null, start: string, end: string): DriverDailyRow[] {
  if (!driver) return []

  const days = dateRangeDays(start, end)
  return days.map((date, index) => {
    const totalKm = distribute(driver.totalKm, index, days.length)
    const productiveKm = Math.min(totalKm, distribute(driver.productiveKm, index, days.length))
    const idleKm = Math.max(0, totalKm - productiveKm)
    const productivityPercent = totalKm ? (productiveKm / totalKm) * 100 : 0
    const productiveTrips = productiveKm > 0 ? (index % 2 === 0 ? 2 : 1) : 0
    const vehicleCount = productiveTrips > 0 ? Math.min(driver.vehicleCount, productiveTrips > 1 ? 2 : 1) : 0

    return {
      date,
      totalKm,
      productiveKm,
      idleKm,
      productivityPercent,
      productiveTrips,
      vehicleCount,
    }
  })
}

function buildDriverTripsForDay(driver: IdleDriver, day: DriverDailyRow): IdleTripRow[] {
  if (!day.productiveTrips) return []

  const trips: IdleTripRow[] = []
  const kmEach = day.productiveTrips > 0 ? Math.round(day.productiveKm / day.productiveTrips) : 0

  for (let i = 0; i < day.productiveTrips; i += 1) {
    trips.push({
      tripId: `${driver.driverName}-${day.date}-${i + 1}`,
      startTime: i === 0 ? '07:30' : '14:00',
      endTime: i === 0 ? '09:45' : '16:20',
      customer: i === 0 ? 'Corporate travel' : 'School transport',
      route: `${driver.area} → Route ${i + 1}`,
      km: i === day.productiveTrips - 1 ? day.productiveKm - kmEach * (day.productiveTrips - 1) : kmEach,
    })
  }

  return trips.filter((trip) => trip.km > 0)
}

export function VehicleIdleAnalysisPage() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<IdleVehicle[]>(vehicleIdleDummyRows)
  const [selected, setSelected] = useState<IdleVehicle | null>(null)
  const [selectedDay, setSelectedDay] = useState<IdleDailyRow | null>(null)
  const [draftStart, setDraftStart] = useState('')
  const [draftEnd, setDraftEnd] = useState('')
  const [appliedStart, setAppliedStart] = useState('')
  const [appliedEnd, setAppliedEnd] = useState('')
  const filteredRows = useFilteredRows(rows as (IdleVehicle & Record<string, unknown>)[]) as IdleVehicle[]

  const fetchData = useCallback((start: string, end: string) => {
    apiGet<{ data: IdleVehicle[] }>('/idle/vehicles', { startDate: start, endDate: end })
      .then((r) => setRows(r.data.length ? r.data : vehicleIdleDummyRows))
      .catch(() => setRows(vehicleIdleDummyRows))
  }, [])

  useEffect(() => {
    if (!appliedStart || !appliedEnd) return
    fetchData(appliedStart, appliedEnd)
  }, [appliedStart, appliedEnd, fetchData])

  const handleRetrieve = () => {
    if (!draftStart || !draftEnd) return
    setAppliedStart(draftStart)
    setAppliedEnd(draftEnd)
  }

  const handleSwap = () => {
    setDraftStart(draftEnd)
    setDraftEnd(draftStart)
  }

  const handleSelectVehicle = (row: IdleVehicle) => {
    setSelected(row)
    setSelectedDay(null)
  }

  const effectiveRange = appliedStart && appliedEnd ? { start: appliedStart, end: appliedEnd } : demoDateRange()

  const dailyRows = useMemo(
    () => buildDailyRows(selected, effectiveRange.start, effectiveRange.end),
    [effectiveRange.end, effectiveRange.start, selected],
  )

  const tripRows = useMemo(
    () => (selected && selectedDay ? buildTripsForDay(selected, selectedDay) : []),
    [selected, selectedDay],
  )

  const columns: Column<IdleVehicle>[] = [
    { key: 'vehicleNumber', label: t('common.vehicleNumber') },
    { key: 'area', label: t('common.area') },
    { key: 'vehicleType', label: t('common.vehicleType') },
    { key: 'totalKm', label: t('idle.totalKm'), align: 'end' },
    { key: 'productiveKm', label: t('idle.productiveKm'), align: 'end' },
    { key: 'idleKm', label: t('idle.idleKm'), align: 'end' },
    {
      key: 'productivityPercent',
      label: t('idle.productivity'),
      align: 'end',
      cellStatus: (r) => (r.productivityPercent >= 85 ? 'positive' : r.productivityPercent < 70 ? 'below-threshold' : 'normal'),
      render: (r) => formatPercent(r.productivityPercent),
    },
  ]

  const dailyColumns: Column<IdleDailyRow>[] = [
    {
      key: 'date',
      label: t('common.date'),
      render: (r) => formatRangeDisplay(r.date),
    },
    { key: 'totalKm', label: t('idle.totalKm'), align: 'end' },
    { key: 'productiveKm', label: t('idle.productiveKm'), align: 'end' },
    { key: 'idleKm', label: t('idle.idleKm'), align: 'end' },
    {
      key: 'productivityPercent',
      label: t('idle.productivity'),
      align: 'end',
      cellStatus: (r) => (r.productivityPercent >= 85 ? 'positive' : r.productivityPercent < 70 ? 'below-threshold' : 'normal'),
      render: (r) => formatPercent(r.productivityPercent),
    },
  ]

  const tripColumns: Column<IdleTripRow>[] = [
    { key: 'tripId', label: t('operation.tripId') },
    { key: 'startTime', label: t('operation.startTime') },
    { key: 'endTime', label: t('operation.endTime') },
    { key: 'customer', label: t('common.customer') },
    { key: 'route', label: t('idle.route') },
    { key: 'km', label: t('idle.totalKm'), align: 'end' },
  ]

  return (
    <PageWithPanel
      panel={
        <DrillDownPanel
          open={!!selected}
          title={selected ? `${selected.vehicleType} | ${selected.area} | ${selected.vehicleNumber}` : ''}
          onClose={() => {
            setSelected(null)
            setSelectedDay(null)
          }}
        >
          {selected && (
            <div className="space-y-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                <span className="field-label">{t('idle.identificationTags')}</span>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selected.vehicleType} | {selected.area} | {selected.vehicleNumber}
                </p>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-bold text-slate-900">{t('idle.selectedVehicleKpis')}</h4>
                <DrillField label={t('idle.totalKmPeriod')} value={selected.totalKm} />
                <DrillField label={t('idle.productiveKm')} value={selected.productiveKm} />
                <DrillField label={t('idle.idleKm')} value={selected.idleKm} />
                <DrillField
                  label={t('idle.productivity')}
                  value={formatPercent(selected.productivityPercent)}
                  valueClassName={
                    selected.productivityPercent >= 85
                      ? 'text-emerald-600'
                      : selected.productivityPercent < 70
                        ? 'text-red-600'
                        : 'text-slate-900'
                  }
                />
              </div>

              <div>
                <div className="mb-3">
                  <h4 className="text-sm font-bold text-slate-900">{t('idle.dailyDetail')}</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    {t('common.results', { count: dailyRows.length })}
                  </p>
                </div>
                <TableToolbar
                  resultCount={dailyRows.length}
                  totalCount={dailyRows.length}
                  exportFilename={`vehicle-idle-daily-${selected.vehicleNumber}`}
                  exportColumns={buildExportColumns(dailyColumns)}
                  exportData={dailyRows as Record<string, unknown>[]}
                  onDownload={() =>
                    downloadCsv(
                      `vehicle-idle-daily-${selected.vehicleNumber}`,
                      buildExportColumns(dailyColumns),
                      dailyRows as Record<string, unknown>[],
                    )
                  }
                />
                <DataTable
                  columns={dailyColumns}
                  data={dailyRows}
                  rowKey={(r) => r.date}
                  onRowClick={setSelectedDay}
                  selectedKey={selectedDay?.date}
                  emptyMessage={t('common.noData')}
                />
              </div>

              {selectedDay && (
                <div>
                  <h4 className="mb-3 text-sm font-bold text-slate-900">
                    {t('idle.tripsForDate', { date: formatRangeDisplay(selectedDay.date) })}
                  </h4>
                  <DataTable
                    columns={tripColumns}
                    data={tripRows}
                    rowKey={(r) => r.tripId}
                    emptyMessage={t('common.noData')}
                  />
                </div>
              )}
            </div>
          )}
        </DrillDownPanel>
      }
    >
      <DateRangeFilter
        startDate={draftStart}
        endDate={draftEnd}
        appliedStart={appliedStart}
        appliedEnd={appliedEnd}
        onStartDateChange={setDraftStart}
        onEndDateChange={setDraftEnd}
        onRetrieve={handleRetrieve}
        onSwap={handleSwap}
      />
      <TableToolbar
        resultCount={filteredRows.length}
        totalCount={rows.length}
        exportFilename="vehicle-idle-analysis"
        exportColumns={buildExportColumns(columns)}
        exportData={filteredRows as Record<string, unknown>[]}
      />
      <DataTable
        columns={columns}
        data={filteredRows}
        rowKey={(r) => r.vehicleNumber}
        onRowClick={handleSelectVehicle}
        selectedKey={selected?.vehicleNumber}
        stickyFirst
        emptyMessage={t('common.noData')}
      />
    </PageWithPanel>
  )
}

export function DriverIdleAnalysisPage() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<IdleDriver[]>(driverIdleDummyRows)
  const [selected, setSelected] = useState<IdleDriver | null>(null)
  const [selectedDay, setSelectedDay] = useState<DriverDailyRow | null>(null)
  const [draftStart, setDraftStart] = useState('')
  const [draftEnd, setDraftEnd] = useState('')
  const [appliedStart, setAppliedStart] = useState('')
  const [appliedEnd, setAppliedEnd] = useState('')
  const filteredRows = useFilteredRows(rows as (IdleDriver & Record<string, unknown>)[]) as IdleDriver[]

  const fetchData = useCallback((start: string, end: string) => {
    apiGet<{ data: IdleDriver[] }>('/idle/drivers', { startDate: start, endDate: end })
      .then((r) => setRows(r.data.length ? r.data : driverIdleDummyRows))
      .catch(() => setRows(driverIdleDummyRows))
  }, [])

  useEffect(() => {
    if (!appliedStart || !appliedEnd) return
    fetchData(appliedStart, appliedEnd)
  }, [appliedStart, appliedEnd, fetchData])

  const handleRetrieve = () => {
    if (!draftStart || !draftEnd) return
    setAppliedStart(draftStart)
    setAppliedEnd(draftEnd)
  }

  const handleSwap = () => {
    setDraftStart(draftEnd)
    setDraftEnd(draftStart)
  }

  const handleSelectDriver = (row: IdleDriver) => {
    setSelected(row)
    setSelectedDay(null)
  }

  const effectiveRange = appliedStart && appliedEnd ? { start: appliedStart, end: appliedEnd } : demoDateRange()

  const dailyRows = useMemo(
    () => buildDriverDailyRows(selected, effectiveRange.start, effectiveRange.end),
    [effectiveRange.end, effectiveRange.start, selected],
  )

  const tripRows = useMemo(
    () => (selected && selectedDay ? buildDriverTripsForDay(selected, selectedDay) : []),
    [selected, selectedDay],
  )

  const columns: Column<IdleDriver>[] = [
    { key: 'driverName', label: t('common.driver') },
    { key: 'area', label: t('common.area') },
    { key: 'totalKm', label: t('idle.totalKm'), align: 'end' },
    { key: 'productiveKm', label: t('idle.productiveKm'), align: 'end' },
    { key: 'idleKm', label: t('idle.idleKm'), align: 'end' },
    {
      key: 'productivityPercent',
      label: t('idle.productivity'),
      align: 'end',
      cellStatus: (r) => (r.productivityPercent >= 85 ? 'positive' : 'below-threshold'),
      render: (r) => formatPercent(r.productivityPercent),
    },
    { key: 'operatingDays', label: t('idle.operatingDays'), align: 'end' },
    { key: 'vehicleCount', label: t('customerRevenue.vehicles'), align: 'end' },
  ]

  const dailyColumns: Column<DriverDailyRow>[] = [
    {
      key: 'date',
      label: t('common.date'),
      render: (r) => formatRangeDisplay(r.date),
    },
    { key: 'productiveTrips', label: t('idle.productiveTravel'), align: 'end' },
    { key: 'totalKm', label: t('idle.totalKm'), align: 'end' },
    { key: 'productiveKm', label: t('idle.productiveKm'), align: 'end' },
    { key: 'idleKm', label: t('idle.idleKm'), align: 'end' },
    {
      key: 'productivityPercent',
      label: t('idle.productivity'),
      align: 'end',
      cellStatus: (r) => (r.productivityPercent >= 85 ? 'positive' : r.productivityPercent < 70 ? 'below-threshold' : 'normal'),
      render: (r) => formatPercent(r.productivityPercent),
    },
    { key: 'vehicleCount', label: t('idle.vehiclesOperatedDay'), align: 'end' },
  ]

  const tripColumns: Column<IdleTripRow>[] = [
    { key: 'tripId', label: t('operation.tripId') },
    { key: 'startTime', label: t('operation.startTime') },
    { key: 'endTime', label: t('operation.endTime') },
    { key: 'customer', label: t('common.customer') },
    { key: 'route', label: t('idle.route') },
    { key: 'km', label: t('idle.totalKm'), align: 'end' },
  ]

  return (
    <PageWithPanel
      panel={
        <DrillDownPanel
          open={!!selected}
          title={selected ? `${selected.area} | ${selected.driverName}` : ''}
          onClose={() => {
            setSelected(null)
            setSelectedDay(null)
          }}
        >
          {selected && (
            <div className="space-y-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                <span className="field-label">{t('idle.identificationTags')}</span>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selected.area} | {selected.driverName}
                </p>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-bold text-slate-900">{t('idle.selectedDriverKpis')}</h4>
                <DrillField label={t('idle.totalKmPeriod')} value={selected.totalKm} />
                <DrillField label={t('idle.productiveKm')} value={selected.productiveKm} />
                <DrillField label={t('idle.idleKm')} value={selected.idleKm} />
                <DrillField
                  label={t('idle.productivity')}
                  value={formatPercent(selected.productivityPercent)}
                  valueClassName={
                    selected.productivityPercent >= 85
                      ? 'text-cyan-600'
                      : selected.productivityPercent < 70
                        ? 'text-red-600'
                        : 'text-slate-900'
                  }
                />
              </div>

              <div>
                <div className="mb-3">
                  <h4 className="text-sm font-bold text-slate-900">{t('idle.dailyDetail')}</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    {t('common.results', { count: dailyRows.length })}
                  </p>
                </div>
                <TableToolbar
                  resultCount={dailyRows.length}
                  totalCount={dailyRows.length}
                  exportFilename={`driver-idle-daily-${selected.driverName.replace(/\s+/g, '-')}`}
                  exportColumns={buildExportColumns(dailyColumns)}
                  exportData={dailyRows as Record<string, unknown>[]}
                  onDownload={() =>
                    downloadCsv(
                      `driver-idle-daily-${selected.driverName.replace(/\s+/g, '-')}`,
                      buildExportColumns(dailyColumns),
                      dailyRows as Record<string, unknown>[],
                    )
                  }
                />
                <DataTable
                  columns={dailyColumns}
                  data={dailyRows}
                  rowKey={(r) => r.date}
                  onRowClick={setSelectedDay}
                  selectedKey={selectedDay?.date}
                  emptyMessage={t('common.noData')}
                />
              </div>

              {selectedDay && (
                <div>
                  <h4 className="mb-3 text-sm font-bold text-slate-900">
                    {t('idle.tripsForDate', { date: formatRangeDisplay(selectedDay.date) })}
                  </h4>
                  <DataTable
                    columns={tripColumns}
                    data={tripRows}
                    rowKey={(r) => r.tripId}
                    emptyMessage={t('common.noData')}
                  />
                </div>
              )}
            </div>
          )}
        </DrillDownPanel>
      }
    >
      <DateRangeFilter
        startDate={draftStart}
        endDate={draftEnd}
        appliedStart={appliedStart}
        appliedEnd={appliedEnd}
        onStartDateChange={setDraftStart}
        onEndDateChange={setDraftEnd}
        onRetrieve={handleRetrieve}
        onSwap={handleSwap}
      />
      <TableToolbar
        resultCount={filteredRows.length}
        totalCount={rows.length}
        exportFilename="driver-idle-analysis"
        exportColumns={buildExportColumns(columns)}
        exportData={filteredRows as Record<string, unknown>[]}
      />
      <DataTable
        columns={columns}
        data={filteredRows}
        rowKey={(r) => r.driverName}
        onRowClick={handleSelectDriver}
        selectedKey={selected?.driverName}
        stickyFirst
        emptyMessage={t('common.noData')}
      />
    </PageWithPanel>
  )
}
