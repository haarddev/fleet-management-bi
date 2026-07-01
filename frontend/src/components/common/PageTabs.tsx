import { cn } from '../../lib/cn'

type Tab = {
  key: string
  label: string
}

type PageTabsProps = {
  tabs: Tab[]
  active: string
  onChange: (key: string) => void
}

export function PageTabs({ tabs, active, onChange }: PageTabsProps) {
  return (
    <div
      className="mb-5 inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm"
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          className={cn(
            'relative cursor-pointer whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-medium transition duration-200',
            active === tab.key
              ? 'bg-primary text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
          )}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
