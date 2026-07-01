import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/cn'

type HeaderProps = {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { t } = useTranslation()
  const { setLanguage, language } = useApp()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex min-h-[64px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/80 px-6 py-3 backdrop-blur-xl backdrop-saturate-150">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-400 text-xs font-bold text-white shadow-md shadow-blue-500/25 ring-2 ring-white">
          {initials}
        </div>
        <div className="hidden flex-col leading-tight sm:flex">
          <span className="text-sm font-semibold text-slate-900">{user?.name}</span>
          <span className="text-xs text-slate-500">{user?.email}</span>
        </div>
      </div>

      <div className="flex flex-[2] flex-col items-center gap-0.5">
        <h1 className="text-center text-lg font-bold tracking-tight text-slate-900">{title}</h1>
        <span className="hidden text-[11px] font-medium uppercase tracking-widest text-slate-400 sm:block">
          Fleet Management BI
        </span>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <div className="flex rounded-xl border border-slate-200 bg-slate-50/80 p-1 shadow-sm">
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

        <button type="button" className="btn-danger px-3 py-2" onClick={handleLogout}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          <span className="hidden sm:inline">{t('auth.logout')}</span>
        </button>
      </div>
    </header>
  )
}
