import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { PageTabs } from '../../components/common/PageTabs'
import { usePermissions } from '../../hooks/usePermissions'
import { RolesAccess } from './RolesAccess'
import { SystemSettings } from './SystemSettings'
import { UserManagement } from './UserManagement'

export function SettingsPage() {
  const { t } = useTranslation()
  const { isAdmin } = usePermissions()
  const [tab, setTab] = useState('users')

  if (!isAdmin) {
    return <Navigate to="/daily" replace />
  }

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('settings.title')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('settings.subtitle')}</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">
            {t('settings.adminOnly')}
          </span>
        </div>
      </div>

      <PageTabs
        label={t('settings.adminSections')}
        tabs={[
          { key: 'users', label: t('settings.userManagement'), icon: 'contractors' },
          { key: 'roles', label: t('settings.rolesAccess'), icon: 'summary' },
          { key: 'system', label: t('settings.systemSettings'), icon: 'table' },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-0"
      />

      {tab === 'users' ? <UserManagement /> : null}
      {tab === 'roles' ? <RolesAccess /> : null}
      {tab === 'system' ? <SystemSettings /> : null}
    </div>
  )
}
