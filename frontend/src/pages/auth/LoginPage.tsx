import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { usePermissions } from '../../hooks/usePermissions'
import { cn } from '../../lib/cn'

function LoginRedirect({ from }: { from: string }) {
  const { canAccessPath, defaultPath } = usePermissions()
  const target = canAccessPath(from) ? from : defaultPath
  return <Navigate to={target} replace />
}

export function LoginPage() {
  const { t } = useTranslation()
  const { language, setLanguage } = useApp()
  const { login, isAuthenticated } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/daily'

  const [email, setEmail] = useState('admin@fleet-bi.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <LoginRedirect from={from} />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative isolate flex h-dvh w-full items-center justify-center overflow-hidden p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-primary" />
      <div className="pointer-events-none absolute -start-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -end-32 -bottom-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="card relative z-10 w-full max-w-md p-6 shadow-elevated sm:p-8">
        <div className="mb-5 flex justify-end">
          <div className="flex rounded-xl border border-slate-200 bg-slate-50/90 p-1 shadow-sm">
            {(['he', 'en'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                className={cn(
                  'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition duration-200',
                  language === lang
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-800',
                )}
                onClick={() => setLanguage(lang)}
              >
                {lang === 'he' ? t('common.hebrew') : t('common.english')}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-8 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-400 text-lg font-bold text-white shadow-lg shadow-blue-500/30">
            BI
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('app.title')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('auth.signInSubtitle')}</p>
          </div>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </div>
          )}

          <label className="flex flex-col gap-2">
            <span className="field-label">{t('auth.email')}</span>
            <input
              type="email"
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="field-label">{t('auth.password')}</span>
            <input
              type="password"
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="btn-primary mt-1 w-full py-3 text-[15px] font-bold" disabled={submitting}>
            {submitting ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>

      
      </div>
    </div>
  )
}
