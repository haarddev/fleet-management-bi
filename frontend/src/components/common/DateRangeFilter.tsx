import { useTranslation } from 'react-i18next'
import { formatRangeDisplay } from '../../lib/dateRange'

type DateRangeFilterProps = {
  startDate: string
  endDate: string
  appliedStart: string
  appliedEnd: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onRetrieve: () => void
  onSwap: () => void
  startLabel?: string
  endLabel?: string
}

export function DateRangeFilter({
  startDate,
  endDate,
  appliedStart,
  appliedEnd,
  onStartDateChange,
  onEndDateChange,
  onRetrieve,
  onSwap,
  startLabel,
  endLabel,
}: DateRangeFilterProps) {
  const { t } = useTranslation()
  const hasAppliedRange = Boolean(appliedStart && appliedEnd)
  const canRetrieve = Boolean(startDate && endDate)

  return (
    <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <p className="mb-3 text-sm font-medium text-slate-700">
        {hasAppliedRange
          ? t('common.appliedRange', {
              start: formatRangeDisplay(appliedStart),
              end: formatRangeDisplay(appliedEnd),
            })
          : t('common.noAppliedRange')}
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[160px] flex-col gap-1.5">
          <span className="field-label">{startLabel ?? t('idle.startDate')}</span>
          <input
            type="date"
            className="field cursor-pointer"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </label>

        <label className="flex min-w-[160px] flex-col gap-1.5">
          <span className="field-label">{endLabel ?? t('idle.endDate')}</span>
          <input
            type="date"
            className="field cursor-pointer"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </label>

        <button
          type="button"
          className="btn btn-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onRetrieve}
          disabled={!canRetrieve}
        >
          {t('common.retrieve')}
        </button>

        <button
          type="button"
          className="btn btn-secondary cursor-pointer"
          onClick={onSwap}
          title={t('common.swapDates')}
          aria-label={t('common.swapDates')}
        >
          ⇄
        </button>
      </div>
    </div>
  )
}
