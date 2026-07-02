import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiDelete, apiGet, apiPatch, apiPost } from '../../api/client'
import { DataTable, type Column } from '../../components/common/DataTable'
import { KpiCard, KpiGrid } from '../../components/common/KpiGrid'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/cn'
import { UserFormModal } from './UserFormModal'
import type { ManagedUser, SettingsOverview } from './types'

type UserFormMode = 'create' | 'edit' | 'password'

export function UserManagement() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [overview, setOverview] = useState<SettingsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<UserFormMode>('create')
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadUsers = useCallback(async () => {
    const [usersRes, overviewRes] = await Promise.all([
      apiGet<{ data: ManagedUser[] }>('/settings/users'),
      apiGet<SettingsOverview>('/settings/overview'),
    ])
    setUsers(usersRes.data)
    setOverview(overviewRes)
  }, [])

  useEffect(() => {
    loadUsers()
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return users
    return users.filter(
      (row) =>
        row.name.toLowerCase().includes(query) ||
        row.email.toLowerCase().includes(query) ||
        row.role.toLowerCase().includes(query),
    )
  }, [search, users])

  const openCreate = () => {
    setSelectedUser(null)
    setModalMode('create')
    setError(null)
    setModalOpen(true)
  }

  const openEdit = (user: ManagedUser) => {
    setSelectedUser(user)
    setModalMode('edit')
    setError(null)
    setModalOpen(true)
  }

  const openPassword = (user: ManagedUser) => {
    setSelectedUser(user)
    setModalMode('password')
    setError(null)
    setModalOpen(true)
  }

  const handleDelete = async (user: ManagedUser) => {
    if (!window.confirm(t('settings.deleteUserConfirm', { name: user.name }))) return
    try {
      await apiDelete(`/settings/users/${user.id}`)
      await loadUsers()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t('settings.actionFailed'))
    }
  }

  const columns: Column<ManagedUser>[] = [
    { key: 'name', label: t('settings.fullName') },
    { key: 'email', label: t('auth.email') },
    {
      key: 'role',
      label: t('settings.role'),
      render: (row) => (
        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-primary">
          {t(`roles.${row.role}`)}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: t('common.status'),
      render: (row) => (
        <span
          className={cn(
            'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
            row.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
          )}
        >
          {row.isActive ? t('settings.active') : t('settings.inactive')}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: t('settings.created'),
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: t('settings.actions'),
      align: 'end',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button type="button" className="btn-ghost cursor-pointer px-2 py-1 text-xs" onClick={() => openEdit(row)}>
            {t('common.edit')}
          </button>
          <button
            type="button"
            className="btn-ghost cursor-pointer px-2 py-1 text-xs"
            onClick={() => openPassword(row)}
          >
            {t('settings.resetPassword')}
          </button>
          <button
            type="button"
            className="btn-danger cursor-pointer px-2 py-1 text-xs"
            disabled={currentUser?.userId === row.id}
            onClick={() => handleDelete(row)}
          >
            {t('common.delete')}
          </button>
        </div>
      ),
    },
  ]

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
      {overview ? (
        <KpiGrid>
          <KpiCard label={t('settings.totalUsers')} value={String(overview.totalUsers)} />
          <KpiCard label={t('settings.activeUsers')} value={String(overview.activeUsers)} variant="success" />
          <KpiCard label={t('settings.inactiveUsers')} value={String(overview.inactiveUsers)} />
          <KpiCard label={t('settings.adminUsers')} value={String(overview.adminCount)} />
        </KpiGrid>
      ) : null}

      <div className="card p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('settings.userManagement')}</h3>
            <p className="mt-1 text-sm text-slate-500">{t('settings.userManagementHint')}</p>
          </div>
          <button type="button" className="btn-primary cursor-pointer" onClick={openCreate}>
            {t('settings.createUser')}
          </button>
        </div>

        <div className="mb-4">
          <input
            type="search"
            className="field w-full max-w-md cursor-text"
            placeholder={t('settings.searchUsers')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredUsers as (ManagedUser & Record<string, unknown>)[]}
          rowKey={(row) => String(row.id)}
          emptyMessage={t('common.noData')}
        />
      </div>

      <UserFormModal
        open={modalOpen}
        mode={modalMode}
        user={selectedUser}
        saving={saving}
        error={error}
        onClose={() => {
          if (!saving) setModalOpen(false)
        }}
        onCreate={async (payload) => {
          setSaving(true)
          setError(null)
          try {
            await apiPost('/settings/users', payload)
            setModalOpen(false)
            await loadUsers()
          } catch (err) {
            setError(err instanceof Error ? err.message : t('settings.actionFailed'))
          } finally {
            setSaving(false)
          }
        }}
        onUpdate={async (payload) => {
          if (!selectedUser) return
          setSaving(true)
          setError(null)
          try {
            await apiPatch(`/settings/users/${selectedUser.id}`, payload)
            setModalOpen(false)
            await loadUsers()
          } catch (err) {
            setError(err instanceof Error ? err.message : t('settings.actionFailed'))
          } finally {
            setSaving(false)
          }
        }}
        onResetPassword={async (password) => {
          if (!selectedUser) return
          setSaving(true)
          setError(null)
          try {
            await apiPost(`/settings/users/${selectedUser.id}/reset-password`, { password })
            setModalOpen(false)
          } catch (err) {
            setError(err instanceof Error ? err.message : t('settings.actionFailed'))
          } finally {
            setSaving(false)
          }
        }}
      />
    </div>
  )
}
