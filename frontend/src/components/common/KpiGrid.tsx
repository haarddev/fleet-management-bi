import { cn } from '../../lib/cn'

type KpiCardProps = {
  label: string
  value: string
  subValue?: string
  variant?: 'default' | 'warning' | 'success'
}

const variantStyles = {
  default: {
    card: 'border-slate-200/80',
    accent: 'from-primary to-blue-400',
    value: 'text-slate-900',
  },
  warning: {
    card: 'border-amber-200/80 bg-gradient-to-br from-amber-50 to-white',
    accent: 'from-amber-400 to-amber-500',
    value: 'text-amber-700',
  },
  success: {
    card: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-white',
    accent: 'from-emerald-400 to-emerald-500',
    value: 'text-emerald-700',
  },
}

export function KpiCard({ label, value, subValue, variant = 'default' }: KpiCardProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        'card-interactive group relative overflow-hidden p-5',
        styles.card,
      )}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80',
          styles.accent,
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition group-hover:bg-primary/10 group-hover:text-primary',
            variant === 'warning' && 'bg-amber-100/80 text-amber-600',
            variant === 'success' && 'bg-emerald-100/80 text-emerald-600',
          )}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18M7 16l4-4 4 4 6-6" />
          </svg>
        </span>
      </div>
      <span className={cn('mt-3 block text-2xl font-bold tabular-nums tracking-tight', styles.value)}>
        {value}
      </span>
      {subValue && (
        <span className="mt-1 inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          {subValue}
        </span>
      )}
    </div>
  )
}

export function KpiGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">{children}</div>
  )
}
