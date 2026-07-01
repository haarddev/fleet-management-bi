import { useTranslation } from 'react-i18next'
import { AdvancedFiltersPanel } from '../common/AdvancedFiltersPanel'
import type { VehicleAdvancedFilters } from '../../lib/vehicleFilters'

type VehicleRevenueAdvancedFiltersProps = {
  filters: VehicleAdvancedFilters
  onChange: (patch: Partial<VehicleAdvancedFilters>) => void
  onClear: () => void
  onClose: () => void
}

export function VehicleRevenueAdvancedFilters({
  filters,
  onChange,
  onClear,
  onClose,
}: VehicleRevenueAdvancedFiltersProps) {
  const { t } = useTranslation()

  return (
    <AdvancedFiltersPanel title={t('vehicleRevenue.advancedFilters')} onClose={onClose} onClear={onClear}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary"
            checked={filters.belowThresholdOnly}
            onChange={(e) => onChange({ belowThresholdOnly: e.target.checked })}
          />
          {t('vehicleRevenue.belowThresholdOnly')}
        </label>

        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary"
            checked={filters.excludeZeroRevenue}
            onChange={(e) => onChange({ excludeZeroRevenue: e.target.checked })}
          />
          {t('vehicleRevenue.excludeZeroRevenue')}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="field-label">{t('vehicleRevenue.minTotal')}</span>
          <input
            type="number"
            className="field cursor-text"
            placeholder="0"
            value={filters.minTotal}
            onChange={(e) => onChange({ minTotal: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="field-label">{t('vehicleRevenue.maxTotal')}</span>
          <input
            type="number"
            className="field cursor-text"
            placeholder="0"
            value={filters.maxTotal}
            onChange={(e) => onChange({ maxTotal: e.target.value })}
          />
        </label>
      </div>
    </AdvancedFiltersPanel>
  )
}
