import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { USER_ROLES } from '../../lib/rbac'
import type { ManagedUser } from './types'

type UserFormMode = 'create' | 'edit' | 'password'

type UserFormModalProps = {
  open: boolean
  mode: UserFormMode
  user?: ManagedUser | null
  saving: boolean
  error: string | null
  onClose: () => void
  onCreate: (payload: { email: string; name: string; role: string; password: string }) => void
  onUpdate: (payload: { email: string; name: string; role: string; isActive: boolean }) => void
  onResetPassword: (password: string) => void
}

export function UserFormModal({
  open,
  mode,
  user,
  saving,
  error,
  onClose,
  onCreate,
  onUpdate,
  onResetPassword,
}: UserFormModalProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<string>('viewer')
  const [password, setPassword] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!open) return
    setEmail(user?.email ?? '')
    setName(user?.name ?? '')
    setRole(user?.role ?? 'viewer')
    setPassword('')
    setIsActive(user?.isActive ?? true)
  }, [open, user])

  if (!open) return null

  const title =
    mode === 'create'
      ? t('settings.createUser')
      : mode === 'password'
        ? t('settings.resetPassword')
        : t('settings.editUser')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (mode === 'create') {
      onCreate({ email, name, role, password })
      return
    }
    if (mode === 'password') {
      onResetPassword(password)
      return
    }
    onUpdate({ email, name, role, isActive })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6 shadow-elevated">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {user && mode !== 'create' ? (
              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            ) : null}
          </div>
          <button type="button" className="btn-ghost cursor-pointer px-2 py-1 text-xs" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode !== 'password' ? (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="field-label">{t('auth.email')}</span>
                <input
                  type="email"
                  className="field cursor-text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="field-label">{t('settings.fullName')}</span>
                <input
                  type="text"
                  className="field cursor-text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="field-label">{t('settings.role')}</span>
                <select className="field cursor-pointer" value={role} onChange={(e) => setRole(e.target.value)}>
                  {USER_ROLES.map((item) => (
                    <option key={item} value={item}>
                      {t(`roles.${item}`)}
                    </option>
                  ))}
                </select>
              </label>

              {mode === 'edit' ? (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-primary"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  {t('settings.activeAccount')}
                </label>
              ) : null}
            </>
          ) : null}

          {mode === 'create' || mode === 'password' ? (
            <label className="flex flex-col gap-1.5">
              <span className="field-label">
                {mode === 'create' ? t('auth.password') : t('settings.newPassword')}
              </span>
              <input
                type="password"
                className="field cursor-text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>
          ) : null}

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary cursor-pointer" onClick={onClose} disabled={saving}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary cursor-pointer" disabled={saving}>
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
