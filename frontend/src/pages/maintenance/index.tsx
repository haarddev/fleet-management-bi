import { createMaintenancePage } from './MaintenancePages'
import { VehicleInventoryPage } from './VehicleInventoryPage'
import { KpiCard, KpiGrid } from '../../components/common/KpiGrid'
import { formatCurrency, formatDate } from '../../utils/format'
import {
  agreementsFilterFields,
  agreementsFiltersActive,
  applyAgreementsFilters,
  applyDisabledVehiclesFilters,
  applyDowntimeFilters,
  applyExpensesFilters,
  applyRelocationsFilters,
  defaultAgreementsFilters,
  defaultDisabledVehiclesFilters,
  defaultDowntimeFilters,
  defaultExpensesFilters,
  defaultRelocationsFilters,
  disabledVehiclesFilterFields,
  disabledVehiclesFiltersActive,
  downtimeFilterFields,
  downtimeFiltersActive,
  expensesFilterFields,
  expensesFiltersActive,
  relocationsFilterFields,
  relocationsFiltersActive,
} from '../../lib/pageFilters/maintenance'

export { VehicleInventoryPage }

export const DisabledVehiclesPage = createMaintenancePage({
  endpoint: '/maintenance/disabled-vehicles',
  exportFilename: 'disabled-vehicles',
  rowKey: (r) => r.vehicleNumber as string,
  columns: [
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    { key: 'area', label: 'Area' },
    { key: 'vehicleType', label: 'Vehicle Type' },
    { key: 'downtimeStart', label: 'Downtime Start' },
    { key: 'daysOff', label: 'Days Off', align: 'end' },
    { key: 'status', label: 'Status' },
    { key: 'notes', label: 'Notes' },
  ],
  advancedFilters: {
    defaults: defaultDisabledVehiclesFilters,
    isActive: disabledVehiclesFiltersActive,
    apply: applyDisabledVehiclesFilters,
    fields: (rows, t) => disabledVehiclesFilterFields(rows, t),
  },
  renderKpi: (data) =>
    data.kpi ? (
      <KpiGrid>
        <KpiCard
          label="Disabled Vehicles"
          value={`${data.kpi.disabled}`}
          subValue={`${data.kpi.percent}% of ${data.kpi.total}`}
          variant="warning"
        />
      </KpiGrid>
    ) : null,
})

export const DowntimePage = createMaintenancePage({
  endpoint: '/maintenance/downtime',
  exportFilename: 'downtime',
  rowKey: (r) => `${r.vehicleNumber}-${r.date}`,
  columns: [
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    { key: 'area', label: 'Area' },
    { key: 'vehicleType', label: 'Vehicle Type' },
    { key: 'date', label: 'Date' },
    { key: 'standingDays', label: 'Standing Days', align: 'end' },
    { key: 'reason', label: 'Reason' },
    { key: 'potentialIncome', label: 'Potential Income', align: 'end', render: (r) => formatCurrency(r.potentialIncome as number) },
  ],
  advancedFilters: {
    defaults: defaultDowntimeFilters,
    isActive: downtimeFiltersActive,
    apply: applyDowntimeFilters,
    fields: () => downtimeFilterFields(),
  },
})

export const AgreementsPage = createMaintenancePage({
  endpoint: '/maintenance/agreements',
  exportFilename: 'agreements',
  rowKey: (r) => r.agreementNumber as string,
  columns: [
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'agreementNumber', label: 'Agreement #' },
    { key: 'startDate', label: 'Start' },
    { key: 'endDate', label: 'End' },
    { key: 'monthlyCost', label: 'Monthly', align: 'end', render: (r) => formatCurrency(r.monthlyCost as number) },
    { key: 'annualCost', label: 'Annual Cost', align: 'end', render: (r) => formatCurrency(r.annualCost as number) },
    { key: 'serviceTypes', label: 'Service Types' },
    { key: 'status', label: 'Status' },
  ],
  advancedFilters: {
    defaults: defaultAgreementsFilters,
    isActive: agreementsFiltersActive,
    apply: applyAgreementsFilters,
    fields: (rows, t) => agreementsFilterFields(rows, t),
  },
})

export const ExpensesPage = createMaintenancePage({
  endpoint: '/maintenance/expenses',
  exportFilename: 'expenses',
  rowKey: (r) => `${r.vehicleNumber}-${r.date}`,
  columns: [
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    { key: 'date', label: 'Date' },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount', align: 'end', render: (r) => formatCurrency(r.amount as number) },
    { key: 'provider', label: 'Provider' },
  ],
  advancedFilters: {
    defaults: defaultExpensesFilters,
    isActive: expensesFiltersActive,
    apply: applyExpensesFilters,
    fields: (rows, t) => expensesFilterFields(rows, t),
  },
})

export const RelocationsPage = createMaintenancePage({
  endpoint: '/maintenance/relocations',
  exportFilename: 'relocations',
  rowKey: (r) => `${r.vehicleNumber}-${r.changeDate}`,
  columns: [
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    { key: 'changeDate', label: 'Change Date', render: (r) => formatDate(String(r.changeDate)) },
    { key: 'fromCustomer', label: 'From Customer' },
    { key: 'toCustomer', label: 'To Customer' },
    { key: 'fromDriver', label: 'From Driver' },
    { key: 'toDriver', label: 'To Driver' },
    { key: 'fromArea', label: 'From Area' },
    { key: 'toArea', label: 'To Area' },
    { key: 'reason', label: 'Reason' },
    { key: 'operator', label: 'Operator' },
  ],
  advancedFilters: {
    defaults: defaultRelocationsFilters,
    isActive: relocationsFiltersActive,
    apply: applyRelocationsFilters,
    fields: () => relocationsFilterFields(),
  },
})
