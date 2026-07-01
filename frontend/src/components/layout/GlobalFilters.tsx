import { useTranslation } from 'react-i18next'
import { useApp } from '../../context/AppContext'
import { filtersAreActive } from '../../lib/filters'
import { cn } from '../../lib/cn'

type GlobalFiltersBarProps = {
  showPriceToggle?: boolean
}

export function GlobalFiltersBar({ showPriceToggle = false }: GlobalFiltersBarProps) {
  const { t } = useTranslation()
  const { filters, setFilters, priceType, setPriceType } = useApp()
  const active = filtersAreActive(filters)

  const clearFilters = () => {
    setFilters({ area: 'all', search: '', period: filters.period })
  }

  return (
    <div id="global-filters" className="border-b border-slate-200/80 bg-white/60 px-6 py-4 backdrop-blur-sm lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-end gap-4">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wider">{t('common.filter')}</span>
          {active && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              {t('common.filtersActive')}
            </span>
          )}
        </div>

        <label className="flex min-w-[150px] flex-col gap-1.5">
          <span className="field-label">{t('common.period')}</span>
          <select
            className="field cursor-pointer"
            value={filters.period}
            onChange={(e) => setFilters({ period: e.target.value })}
          >
            <option value="monthly-reverse">{t('common.monthlyReverse')}</option>
            <option value="quarterly">{t('common.quarterly')}</option>
            <option value="yearly">{t('common.yearly')}</option>
          </select>
        </label>

        <label className="flex min-w-[150px] flex-col gap-1.5">
          <span className="field-label">{t('common.area')}</span>
          <select
            className="field cursor-pointer"
            value={filters.area}
            onChange={(e) => setFilters({ area: e.target.value })}
          >
            <option value="all">{t('common.allRegions')}</option>
            <option value="south">South</option>
            <option value="north">North</option>
            <option value="rishon">Rishon LeZion</option>
          </select>
        </label>

        <label className="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <span className="field-label">{t('common.vehicleGroupSearch')}</span>
          <div className="relative">
            <svg
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              id="global-search-input"
              type="search"
              className="field w-full cursor-text ps-9"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              placeholder={t('common.searchPlaceholder')}
            />
          </div>
        </label>

        {active && (
          <button type="button" className="btn-ghost cursor-pointer self-end" onClick={clearFilters}>
            {t('common.clearFilters')}
          </button>
        )}

        {showPriceToggle && (
          <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
            {(['A', 'B'] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={cn(
                  'cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition duration-200',
                  priceType === type
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900',
                )}
                onClick={() => setPriceType(type)}
              >
                {type === 'A' ? t('common.priceA') : t('common.priceB')}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
