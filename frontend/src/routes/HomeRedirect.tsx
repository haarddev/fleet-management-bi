import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePermissions } from '../hooks/usePermissions'

export function HomeRedirect() {
  const { isLoading } = useAuth()
  const { defaultPath } = usePermissions()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-slate-500">
        <div className="loading-spinner" />
        Loading...
      </div>
    )
  }

  return <Navigate to={defaultPath} replace />
}
