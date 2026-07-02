import { useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { apiGet } from '../../api/client'

import { GenericAdvancedFiltersPanel } from '../../components/common/GenericAdvancedFiltersPanel'

import { TableToolbar } from '../../components/common/TableToolbar'

import { DataTable, type Column } from '../../components/common/DataTable'

import { KpiCard, KpiGrid } from '../../components/common/KpiGrid'

import { EmbeddedVehiclesChart } from '../../components/operation/EmbeddedVehiclesChart'

import { useAdvancedFilterPanel } from '../../hooks/useAdvancedFilterPanel'

import { useFilteredRows } from '../../hooks/useFilteredRows'

import { buildExportColumns } from '../../lib/export'

import {
  applyVehicleTableFilters,
  defaultVehicleTableFilters,
  vehicleTableFilterFields,
  vehicleTableFiltersActive,
} from '../../lib/pageFilters/operation'

import { cn } from '../../lib/cn'

import { formatDate, formatKpiNumber } from '../../utils/format'



type DisabledVehicleRow = {

  vehicleNumber: string

  licenseNumber: string

  area: string

  vehicleType: string

  downtimeStart: string

  endDate: string

  daysOff: number

  status: string

  notes: string

  address: string

}



type DailyStatus = {

  kpis: Record<string, number>

  tomorrow: Record<string, number>

  unembeddedVehicles: Array<Record<string, string>>

  disabledVehicles: DisabledVehicleRow[]

  embeddedChart: {

    currentHour: number

    points: Array<{ hour: number; actual: number; expected: number }>

  }

}



export function DailyStatusPage() {

  const { t } = useTranslation()

  const [data, setData] = useState<DailyStatus | null>(null)

  const unembeddedAdvanced = useAdvancedFilterPanel(defaultVehicleTableFilters, vehicleTableFiltersActive)

  const disabledAdvanced = useAdvancedFilterPanel(defaultVehicleTableFilters, vehicleTableFiltersActive)

  const globallyFilteredUnembedded = useFilteredRows(

    (data?.unembeddedVehicles ?? []) as Record<string, unknown>[],

  ) as Record<string, string>[]

  const globallyFilteredDisabled = useFilteredRows(

    (data?.disabledVehicles ?? []) as (DisabledVehicleRow & Record<string, unknown>)[],

  ) as DisabledVehicleRow[]

  const filteredUnembedded = useMemo(
    () => applyVehicleTableFilters(globallyFilteredUnembedded, unembeddedAdvanced.filters),
    [globallyFilteredUnembedded, unembeddedAdvanced.filters],
  )

  const filteredDisabled = useMemo(
    () => applyVehicleTableFilters(globallyFilteredDisabled, disabledAdvanced.filters),
    [globallyFilteredDisabled, disabledAdvanced.filters],
  )



  useEffect(() => {

    apiGet<DailyStatus>('/operation/daily-status').then(setData)

  }, [])



  if (!data) {

    return (

      <div className="flex items-center justify-center gap-3 p-16 text-slate-500">

        <div className="loading-spinner" />

        {t('common.loading')}

      </div>

    )

  }



  const kpiOrder = [

    'vehicles',

    'deployed',

    'notDeployed',

    'disabled',

    'corporateTravel',

    'contractorTravel',

    'totalKm',

    'gpsMalfunctions',

  ] as const



  const kpiLabels: Record<string, string> = {

    vehicles: t('operation.vehicles'),

    deployed: t('operation.deployed'),

    notDeployed: t('operation.notDeployed'),

    disabled: t('operation.disabled'),

    corporateTravel: t('operation.corporateTravel'),

    contractorTravel: t('operation.contractorTravel'),

    totalKm: t('operation.totalKm'),

    gpsMalfunctions: t('operation.gpsMalfunctions'),

  }



  const formatKpiValue = (key: string, val: number) => {

    if (key === 'totalKm') {

      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(val)

    }

    return formatKpiNumber(val)

  }



  const unembeddedCols: Column<Record<string, string>>[] = [

    { key: 'vehicleNumber', label: t('common.vehicleNumber') },

    { key: 'area', label: t('common.area') },

    { key: 'vehicleType', label: t('common.vehicleType') },

    { key: 'status', label: t('common.status') },

    {

      key: 'lastInlay',

      label: t('operation.lastInlay'),

      render: (r) => (r.lastInlay ? formatDate(r.lastInlay) : '—'),

    },

    {

      key: 'lastShutdown',

      label: t('operation.lastShutdown'),

      render: (r) => (r.lastShutdown ? formatDate(r.lastShutdown) : '—'),

    },

    { key: 'address', label: t('operation.address') },

  ]



  const disabledCols: Column<DisabledVehicleRow>[] = [

    { key: 'vehicleNumber', label: t('common.vehicleNumber') },

    { key: 'licenseNumber', label: t('operation.licenseNumber') },

    { key: 'area', label: t('common.area') },

    { key: 'vehicleType', label: t('common.vehicleType') },

    {

      key: 'downtimeStart',

      label: t('operation.outageStart'),

      render: (r) => formatDate(r.downtimeStart),

    },

    {

      key: 'endDate',

      label: t('operation.plannedEnd'),

      render: (r) => formatDate(r.endDate),

    },

    { key: 'daysOff', label: t('operation.downtimeDaysShort'), align: 'end' },

    {

      key: 'notes',

      label: t('common.notes'),

      render: (r) => (

        <span className="flex items-center gap-2">

          {r.notes ? (

            <>

              <span

                className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-900"

                title={r.notes}

                aria-label={t('operation.hasNotes')}

              />

              <span className="max-w-[140px] truncate">{r.notes}</span>

            </>

          ) : (

            '—'

          )}

        </span>

      ),

    },

    {

      key: 'status',

      label: t('common.status'),

      render: (r) => (

        <span

          className={cn(

            'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',

            r.status.toLowerCase().includes('repair')

              ? 'bg-amber-50 text-amber-700'

              : 'bg-slate-100 text-slate-700',

          )}

        >

          {r.status}

        </span>

      ),

    },

    { key: 'address', label: t('operation.gpsLocation') },

  ]



  return (

    <div className="flex flex-col gap-6">

      <KpiGrid>

        {kpiOrder.map((key) => (

          <KpiCard

            key={key}

            label={kpiLabels[key]}

            value={formatKpiValue(key, data.kpis[key] ?? 0)}

            variant={key === 'totalKm' ? 'success' : 'default'}

          />

        ))}

      </KpiGrid>



      <h3 className="page-section-title">{t('operation.tomorrowStatus')}</h3>

      <KpiGrid>

        {Object.entries(data.tomorrow).map(([key, val]) => (

          <KpiCard

            key={key}

            label={key}

            value={String(val)}

            variant={key.includes('open') || key.includes('Open') ? 'warning' : 'default'}

          />

        ))}

      </KpiGrid>



      <h3 className="page-section-title">{t('operation.unembeddedVehicles')}</h3>

      <TableToolbar

        resultCount={filteredUnembedded.length}

        totalCount={data.unembeddedVehicles.length}

        exportFilename="unembedded-vehicles"

        exportColumns={buildExportColumns(unembeddedCols)}

        exportData={filteredUnembedded}

        {...unembeddedAdvanced.toolbarProps}

      />

      {unembeddedAdvanced.open && (
        <GenericAdvancedFiltersPanel
          titleKey="filters.advancedFilters"
          fields={vehicleTableFilterFields(t)}
          filters={unembeddedAdvanced.filters}
          onChange={unembeddedAdvanced.patch}
          onClear={unembeddedAdvanced.clear}
          onClose={unembeddedAdvanced.close}
        />
      )}

      <DataTable

        columns={unembeddedCols}

        data={filteredUnembedded}

        rowKey={(r) => r.vehicleNumber}

        emptyMessage={t('common.noData')}

      />



      <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900">

        <span className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden />

        {t('operation.disabledVehicles')}

      </h3>



      <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px]">

        <div className="min-w-0">

          <TableToolbar

            resultCount={filteredDisabled.length}

            totalCount={data.disabledVehicles.length}

            exportFilename="disabled-vehicles"

            exportColumns={buildExportColumns(disabledCols)}

            exportData={filteredDisabled as Record<string, unknown>[]}

            {...disabledAdvanced.toolbarProps}

          />

          {disabledAdvanced.open && (
            <GenericAdvancedFiltersPanel
              titleKey="filters.advancedFilters"
              fields={vehicleTableFilterFields(t)}
              filters={disabledAdvanced.filters}
              onChange={disabledAdvanced.patch}
              onClear={disabledAdvanced.clear}
              onClose={disabledAdvanced.close}
            />
          )}

          <DataTable

            columns={disabledCols}

            data={filteredDisabled}

            rowKey={(r) => r.vehicleNumber}

            stickyFirst

            emptyMessage={t('common.noData')}

          />

        </div>



        <EmbeddedVehiclesChart

          title={t('operation.embeddedChart')}

          data={data.embeddedChart.points}

          currentHour={data.embeddedChart.currentHour}

          labels={{

            actual: t('operation.chartActual'),

            expected: t('operation.chartExpected'),

            currentTime: t('operation.chartCurrentTime'),

            vehicles: t('operation.chartVehiclesAxis'),

          }}

        />

      </div>

    </div>

  )

}


