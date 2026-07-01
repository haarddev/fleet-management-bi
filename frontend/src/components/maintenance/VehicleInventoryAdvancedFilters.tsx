import { useTranslation } from 'react-i18next'
import { AdvancedFiltersPanel } from '../common/AdvancedFiltersPanel'
import type { InventoryAdvancedFilters } from '../../lib/inventoryFilters'

type VehicleInventoryAdvancedFiltersProps = {
  filters: InventoryAdvancedFilters
  onChange: (patch: Partial<InventoryAdvancedFilters>) => void
  onClear: () => void
  onClose: () => void
}

export function VehicleInventoryAdvancedFilters({
  filters,
  onChange,
  onClear,
  onClose,
}: VehicleInventoryAdvancedFiltersProps) {
  const { t } = useTranslation()

  return (
    <AdvancedFiltersPanel title={t('maintenance.advancedFilters')} onClose={onClose} onClear={onClear}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="field-label">{t('common.status')}</span>
          <select
            className="field cursor-pointer"
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            <option value="all">{t('maintenance.allStatuses')}</option>
            <option value="active">{t('maintenance.active')}</option>
            <option value="disabled">{t('maintenance.disabled')}</option>
            <option value="under_maintenance">{t('maintenance.underMaintenance')}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="field-label">{t('common.vehicleType')}</span>
          <input
            type="text"
            className="field cursor-text"
            placeholder={t('maintenance.vehicleTypePlaceholder')}
            value={filters.vehicleType}
            onChange={(e) => onChange({ vehicleType: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="field-label">{t('common.contractor')}</span>
          <input
            type="text"
            className="field cursor-text"
            placeholder={t('maintenance.contractorPlaceholder')}
            value={filters.contractor}
            onChange={(e) => onChange({ contractor: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="field-label">{t('maintenance.minDowntime')}</span>
          <input
            type="number"
            className="field cursor-text"
            min={0}
            value={filters.minDowntime}
            onChange={(e) => onChange({ minDowntime: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="field-label">{t('maintenance.maxDowntime')}</span>
          <input
            type="number"
            className="field cursor-text"
            min={0}
            value={filters.maxDowntime}
            onChange={(e) => onChange({ maxDowntime: e.target.value })}
          />
        </label>

        <label className="flex cursor-pointer items-center gap-2.5 self-end rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary"
            checked={filters.withDowntimeOnly}
            onChange={(e) => onChange({ withDowntimeOnly: e.target.checked })}
          />
          {t('maintenance.withDowntimeOnly')}
        </label>
      </div>
    </AdvancedFiltersPanel>
  )
}
