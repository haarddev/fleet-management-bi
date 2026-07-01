import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/cn'

export function PageWithPanel({
  panel,
  children,
}: {
  panel: React.ReactNode
  children: React.ReactNode
}) {
  const { direction } = useApp()
  return (
    <div
      className={cn(
        'flex items-start gap-6 max-lg:flex-col',
        direction === 'rtl' && 'flex-row-reverse max-lg:flex-col',
      )}
    >
      {panel}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

export function DrillField({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: React.ReactNode
  valueClassName?: string
}) {
  return (
    <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 last:mb-0">
      <span className="field-label">{label}</span>
      <span className={cn('mt-1.5 block text-lg font-bold tracking-tight text-slate-900', valueClassName)}>
        {value}
      </span>
    </div>
  )
}
