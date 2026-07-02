import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type TabIcon = 'summary' | 'table' | 'organic' | 'contractors' | 'calendar' | 'weekdays' | 'weekend'

type Tab = {
  key: string
  label: string
  icon?: TabIcon
}

type PageTabsProps = {
  tabs: Tab[]
  active: string
  onChange: (key: string) => void
  variant?: 'pill' | 'segmented'
  size?: 'md' | 'sm'
  label?: string
  className?: string
}

function TabIconGlyph({ icon }: { icon: TabIcon }) {
  const props = { className: 'h-3.5 w-3.5 shrink-0', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }

  switch (icon) {
    case 'summary':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'table':
      return (
        <svg {...props}>
          <path d="M3 6h18M3 12h18M3 18h18M9 6v12M15 6v12" />
        </svg>
      )
    case 'organic':
      return (
        <svg {...props}>
          <path d="M12 22c4-4 7-8 7-12a7 7 0 1 0-14 0c0 4 3 8 7 12Z" />
          <path d="M12 10v12" />
        </svg>
      )
    case 'contractors':
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      )
    case 'weekdays':
      return (
        <svg {...props}>
          <path d="M8 6v12M16 6v12M3 10h18M3 14h18" />
        </svg>
      )
    case 'weekend':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )
    default:
      return null
  }
}

export function PageTabs({
  tabs,
  active,
  onChange,
  variant = 'segmented',
  size = 'md',
  label,
  className,
}: PageTabsProps) {
  const buttonSize =
    size === 'sm' ? 'min-h-8 gap-1.5 px-3 py-1.5 text-xs' : 'min-h-10 gap-2 px-4 py-2 text-sm'

  const trackClass =
    variant === 'segmented'
      ? 'rounded-xl bg-slate-100/90 p-1 ring-1 ring-inset ring-slate-200/80'
      : 'rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm'

  const activeClass =
    variant === 'segmented'
      ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200/70'
      : 'bg-primary text-white shadow-md shadow-blue-500/25'

  const inactiveClass =
    variant === 'segmented'
      ? 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      {label ? (
        <span className="px-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </span>
      ) : null}
      <div
        className={cn('inline-flex max-w-full gap-0.5 overflow-x-auto', trackClass)}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key
          let iconNode: ReactNode = null
          if (tab.icon) {
            iconNode = <TabIconGlyph icon={tab.icon} />
          }

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={cn(
                'relative inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-lg font-medium transition duration-200',
                buttonSize,
                isActive ? cn(activeClass, 'font-semibold') : inactiveClass,
              )}
              onClick={() => onChange(tab.key)}
            >
              {iconNode}
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
