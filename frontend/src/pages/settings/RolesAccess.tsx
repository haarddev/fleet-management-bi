import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../../api/client'
import { cn } from '../../lib/cn'
import type { RoleAccessRow } from './types'

const SECTION_KEYS = ['revenue', 'maintenance', 'management', 'operation', 'idle', 'settings'] as const

export function RolesAccess() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<RoleAccessRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<{ roles: RoleAccessRow[] }>('/settings/roles')
      .then((res) => setRows(res.roles))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 p-12 text-slate-500">
        <div className="loading-spinner" />
        {t('common.loading')}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="text-base font-bold text-slate-900">{t('settings.rolesAccessTitle')}</h3>
        <p className="mt-1 text-sm text-slate-500">{t('settings.rolesAccessHint')}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((row) => (
          <div key={row.role} className="card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h4 className="text-sm font-bold text-slate-900">{t(`roles.${row.role}`)}</h4>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {row.role}
              </span>
            </div>

            <p className="mb-4 text-sm text-slate-600">{t(`settings.roleDescriptions.${row.role}`)}</p>

            <div className="space-y-2">
              {SECTION_KEYS.map((section) => {
                const allowed = row.sections[section]
                return (
                  <div
                    key={section}
                    className={cn(
                      'flex items-center justify-between rounded-xl px-3 py-2 text-sm',
                      allowed ? 'bg-emerald-50/80 text-emerald-800' : 'bg-slate-50 text-slate-500',
                    )}
                  >
                    <span>{t(`settings.sections.${section}`)}</span>
                    <span className="text-xs font-semibold">
                      {allowed ? t('settings.accessAllowed') : t('settings.accessDenied')}
                    </span>
                  </div>
                )
              })}
              <div
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2 text-sm',
                  row.canExport ? 'bg-blue-50/80 text-blue-800' : 'bg-slate-50 text-slate-500',
                )}
              >
                <span>{t('settings.exportData')}</span>
                <span className="text-xs font-semibold">
                  {row.canExport ? t('settings.accessAllowed') : t('settings.accessDenied')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
