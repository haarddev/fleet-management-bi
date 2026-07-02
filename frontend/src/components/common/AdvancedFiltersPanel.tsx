import { useTranslation } from 'react-i18next'

type AdvancedFiltersPanelProps = {
  title: string
  onClose: () => void
  onClear: () => void
  children: React.ReactNode
}

export function AdvancedFiltersPanel({ title, onClose, onClear, children }: AdvancedFiltersPanelProps) {
  const { t } = useTranslation()

  return (
    <div className="card mb-4 border-primary/20 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className="btn-ghost cursor-pointer px-2 py-1 text-xs" onClick={onClear}>
            {t('common.clearFilters')}
          </button>
          <button type="button" className="btn-ghost cursor-pointer px-2 py-1 text-xs" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}
