import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../../api/client'
import { TableToolbar } from '../../components/common/TableToolbar'
import { DataTable, type Column } from '../../components/common/DataTable'
import { DrillDownPanel } from '../../components/common/DrillDownPanel'
import { DrillField, PageWithPanel } from '../../components/common/PageWithPanel'
import { KpiCard, KpiGrid } from '../../components/common/KpiGrid'
import { useFilteredRows } from '../../hooks/useFilteredRows'
import { buildExportColumns } from '../../lib/export'
import { formatCurrency, formatKpiNumber, formatPercent } from '../../utils/format'

type CustomerRow = {
  id: string
  name: string
  code: string
  trips: number
  vehicles: number
  totalRevenue: number
  sharePercent: number
  contractorIncome: number
  contractorSharePercent: number
  contractorProfitPercent: number
  revenueYtd: number
  vehiclesAtLoss: number
}

type CustomerDetail = CustomerRow & {
  losingVehicles: Array<{
    vehicleNumber: string
    vehicleType: string
    lossDays: number
    avgDailyIncome: number
    threshold: number
    contractor: string
    multiCustomerDays: number
  }>
}

export function CustomerRevenuePage() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<CustomerRow[]>([])
  const [selected, setSelected] = useState<CustomerDetail | null>(null)
  const filteredRows = useFilteredRows(rows as (CustomerRow & Record<string, unknown>)[]) as CustomerRow[]

  useEffect(() => {
    apiGet<{ data: CustomerRow[] }>('/revenue/customers').then((r) => setRows(r.data))
  }, [])

  const summary = useMemo(
    () => ({
      customerCount: filteredRows.length,
      totalRevenue: filteredRows.reduce((s, r) => s + r.totalRevenue, 0),
      totalRevenueYtd: filteredRows.reduce((s, r) => s + r.revenueYtd, 0),
    }),
    [filteredRows],
  )

  const handleSelect = async (row: CustomerRow) => {
    const detail = await apiGet<CustomerDetail>(`/revenue/customers/${row.id}`)
    setSelected(detail)
  }

  const columns: Column<CustomerRow>[] = [
    { key: 'name', label: t('common.customer') },
    { key: 'trips', label: t('customerRevenue.trips'), align: 'end' },
    { key: 'vehicles', label: t('customerRevenue.vehicles'), align: 'end' },
    { key: 'totalRevenue', label: t('customerRevenue.totalRevenuePeriod'), align: 'end', render: (r) => formatCurrency(r.totalRevenue) },
    { key: 'sharePercent', label: t('customerRevenue.shareOfTotal'), align: 'end', render: (r) => formatPercent(r.sharePercent) },
    { key: 'contractorIncome', label: t('customerRevenue.contractorIncome'), align: 'end', render: (r) => formatCurrency(r.contractorIncome) },
    { key: 'contractorSharePercent', label: t('customerRevenue.contractorShare'), align: 'end', render: (r) => formatPercent(r.contractorSharePercent) },
    {
      key: 'contractorProfitPercent',
      label: t('customerRevenue.contractorProfit'),
      align: 'end',
      cellStatus: (r) => (r.contractorProfitPercent > 0 ? 'positive' : undefined),
      render: (r) => formatPercent(r.contractorProfitPercent),
    },
    { key: 'revenueYtd', label: t('customerRevenue.totalRevenueYtd'), align: 'end', render: (r) => formatCurrency(r.revenueYtd) },
    {
      key: 'vehiclesAtLoss',
      label: t('customerRevenue.vehiclesAtLoss'),
      align: 'end',
      cellStatus: (r) => (r.vehiclesAtLoss > 5 ? 'below-threshold' : undefined),
    },
  ]

  return (
    <PageWithPanel
      panel={
        <DrillDownPanel
          open={!!selected}
          title={selected ? `${selected.name} | ${selected.code}` : ''}
          onClose={() => setSelected(null)}
        >
          {selected && (
            <>
              <DrillField label={t('customerRevenue.totalRevenuePeriod')} value={formatCurrency(selected.totalRevenue)} />
              <DrillField label={t('customerRevenue.shareOfTotal')} value={formatPercent(selected.sharePercent)} />
              <DrillField
                label={t('customerRevenue.contractorProfit')}
                value={formatPercent(selected.contractorProfitPercent)}
                valueClassName="text-emerald-600"
              />
              <h4 className="mb-3 font-semibold text-slate-900">{t('customerRevenue.losingVehicles')}</h4>
              <DataTable
                columns={[
                  { key: 'vehicleNumber', label: t('common.vehicleNumber') },
                  { key: 'vehicleType', label: t('common.vehicleType') },
                  { key: 'lossDays', label: 'Loss days', align: 'end' },
                  { key: 'avgDailyIncome', label: 'Avg/day', align: 'end', render: (r) => formatCurrency(r.avgDailyIncome) },
                ]}
                data={selected.losingVehicles}
                rowKey={(r) => r.vehicleNumber}
              />
            </>
          )}
        </DrillDownPanel>
      }
    >
      <KpiGrid>
        <KpiCard label={t('customerRevenue.customerCount')} value={String(summary.customerCount)} />
        <KpiCard label={t('customerRevenue.totalRevenuePeriod')} value={formatKpiNumber(summary.totalRevenue)} />
        <KpiCard label={t('customerRevenue.totalRevenueYtd')} value={formatKpiNumber(summary.totalRevenueYtd)} />
      </KpiGrid>
      <TableToolbar
        resultCount={filteredRows.length}
        totalCount={rows.length}
        exportFilename="customer-revenue"
        exportColumns={buildExportColumns(columns)}
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
