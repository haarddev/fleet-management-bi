import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { navigation, type NavItem } from '../../config/navigation'
import { NavSectionIcon } from '../icons/NavIcons'
import { cn } from '../../lib/cn'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'group flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-slate-400 transition duration-200',
    'hover:bg-white/10 hover:text-slate-100',
    isActive && 'bg-gradient-to-r from-blue-500/20 to-blue-600/10 font-medium text-white shadow-inner',
  )

function NavDot({ isActive }: { isActive?: boolean }) {
  return (
    <span
      className={cn(
        'h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600 transition group-hover:bg-slate-400',
        isActive && 'bg-primary shadow-sm shadow-blue-400/50',
      )}
    />
  )
}

function NavSection({ item }: { item: NavItem }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(item.defaultExpanded ?? false)

  if (!item.children?.length) {
    return item.path ? <NavLink to={item.path} className={linkClass}>{t(item.labelKey)}</NavLink> : null
  }

  return (
    <div className="mb-1">
      <button
        type="button"
        className={cn(
          'flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-400 transition duration-200',
          'hover:bg-white/10 hover:text-slate-100',
          expanded && 'bg-white/5 text-slate-200',
        )}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-300">
          <NavSectionIcon sectionKey={item.key} className="h-3.5 w-3.5" />
        </span>
        <span className="flex-1 text-start">{t(item.labelKey)}</span>
        <span
          className={cn(
            'text-[10px] opacity-60 transition-transform duration-200',
            expanded && 'rotate-90',
          )}
        >
          ▸
        </span>
      </button>
      {expanded && (
        <div className="mt-0.5 space-y-0.5 border-s border-white/5 ps-5 ms-3.5">
          {item.children.map((child) =>
            child.path ? (
              <NavLink key={child.key} to={child.path} className={linkClass}>
                {({ isActive }) => (
                  <>
                    <NavDot isActive={isActive} />
                    {t(child.labelKey)}
                  </>
                )}
              </NavLink>
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const { t } = useTranslation()

  return (
    <aside className="relative flex h-screen w-[280px] min-w-[280px] shrink-0 flex-col overflow-y-auto border-e border-white/5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-2xl shadow-slate-900/40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent" />

      <div className="relative flex items-center gap-3.5 border-b border-white/8 p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-400 text-sm font-bold text-white shadow-lg shadow-blue-500/40 ring-2 ring-white/10">
          BI
        </span>
        <div className="min-w-0">
          <strong className="block truncate text-sm font-semibold leading-snug text-white">{t('app.title')}</strong>
          <small className="mt-0.5 block truncate text-xs leading-snug text-slate-400">{t('app.subtitle')}</small>
        </div>
      </div>

      <nav className="relative flex flex-col gap-0.5 p-3">
        {navigation.map((item) => (
          <NavSection key={item.key} item={item} />
        ))}
      </nav>

      <div className="relative mt-auto border-t border-white/8 p-4">
        <div className="rounded-xl bg-white/5 px-3 py-2.5 text-center text-[11px] text-slate-500">
          Fleet BI <span className="text-slate-600">v1.0</span>
        </div>
      </div>
    </aside>
  )
}
