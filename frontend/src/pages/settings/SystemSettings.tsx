import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet, apiPatch } from '../../api/client'
import type { SystemSettings } from './types'

export function SystemSettings() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiGet<{ settings: SystemSettings }>('/settings/system')
      .then((res) => setSettings(res.settings))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!settings) return

    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const res = await apiPatch<{ settings: SystemSettings }>('/settings/system', settings)
      setSettings(res.settings)
      setMessage(t('settings.systemSaved'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.actionFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center gap-3 p-12 text-slate-500">
        <div className="loading-spinner" />
        {t('common.loading')}
      </div>
    )
  }

  return (
    <div className="card max-w-2xl p-6">
      <h3 className="text-base font-bold text-slate-900">{t('settings.systemSettings')}</h3>
      <p className="mt-1 text-sm text-slate-500">{t('settings.systemSettingsHint')}</p>

      <form className="mt-6 space-y-5" onSubmit={handleSave}>
        <label className="flex flex-col gap-1.5">
          <span className="field-label">{t('settings.organizationName')}</span>
          <input
            type="text"
            className="field cursor-text"
            value={settings.organizationName}
            onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="field-label">{t('settings.sessionHours')}</span>
          <input
            type="number"
            min={1}
            max={24}
            className="field cursor-text"
            value={settings.sessionHours}
            onChange={(e) => setSettings({ ...settings, sessionHours: Number(e.target.value) })}
            required
          />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <div>
            <span className="block text-sm font-medium text-slate-900">{t('settings.allowViewerExport')}</span>
            <span className="mt-0.5 block text-xs text-slate-500">{t('settings.allowViewerExportHint')}</span>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary"
            checked={settings.allowViewerExport}
            onChange={(e) => setSettings({ ...settings, allowViewerExport: e.target.checked })}
          />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
          <div>
            <span className="block text-sm font-medium text-slate-900">{t('settings.maintenanceMode')}</span>
            <span className="mt-0.5 block text-xs text-slate-500">{t('settings.maintenanceModeHint')}</span>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
          />
        </label>

        {message ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

        <div className="flex justify-end">
          <button type="submit" className="btn-primary cursor-pointer" disabled={saving}>
            {saving ? t('common.saving') : t('settings.saveSystemSettings')}
          </button>
        </div>
      </form>
    </div>
  )
}
