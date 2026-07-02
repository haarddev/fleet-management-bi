import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePermissions } from '../hooks/usePermissions'

type ProtectedRouteProps = {
  children: React.ReactNode
  path?: string
}

export function ProtectedRoute({ children, path }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const { canAccessPath, defaultPath } = usePermissions()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-slate-500">
        <div className="loading-spinner" />
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (path && !canAccessPath(path)) {
    return <Navigate to={defaultPath} replace />
  }

  return children
}
