import { useTranslation } from 'react-i18next'
import { AdvancedFiltersPanel } from '../common/AdvancedFiltersPanel'
import type { ActivityLogFilters } from '../../lib/activityLogFilters'

type ActivityLogFiltersPanelProps = {
  filters: ActivityLogFilters
  users: string[]
  actionTypes: string[]
  modules: string[]
  onChange: (patch: Partial<ActivityLogFilters>) => void
  onClear: () => void
  onClose: () => void
}

export function ActivityLogFiltersPanel({
  filters,
  users,
  actionTypes,
  modules,
  onChange,
  onClear,
  onClose,
}: ActivityLogFiltersPanelProps) {
  const { t } = useTranslation()

  return (
    <AdvancedFiltersPanel title={t('management.logFilters')} onClose={onClose} onClear={onClear}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="field-label">{t('management.dateFrom')}</span>
          <input
            type="date"
            className="field cursor-pointer"
            value={filters.dateFrom}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="field-label">{t('management.dateTo')}</span>
          <input
            type="date"
            className="field cursor-pointer"
            value={filters.dateTo}
            onChange={(e) => onChange({ dateTo: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="field-label">{t('management.user')}</span>
          <select
            className="field cursor-pointer"
            value={filters.user}
            onChange={(e) => onChange({ user: e.target.value })}
          >
            <option value="all">{t('management.allUsers')}</option>
            {users.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="field-label">{t('management.actionType')}</span>
          <select
            className="field cursor-pointer"
            value={filters.actionType}
            onChange={(e) => onChange({ actionType: e.target.value })}
          >
            <option value="all">{t('management.allActionTypes')}</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="field-label">{t('management.module')}</span>
          <select
            className="field cursor-pointer"
            value={filters.module}
            onChange={(e) => onChange({ module: e.target.value })}
          >
            <option value="all">{t('management.allModules')}</option>
            {modules.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
        </label>
      </div>
    </AdvancedFiltersPanel>
  )
}
