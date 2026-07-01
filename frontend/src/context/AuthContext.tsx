import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  apiGet,
  apiPost,
  AuthError,
  getAuthToken,
  setAuthToken,
  type AuthUser,
  type LoginResponse,
} from '../api/client'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    setAuthToken(null)
    setUser(null)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost<LoginResponse>('/auth/login', { email, password })
    setAuthToken(res.token)
    setUser(res.user)
  }, [])

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    apiGet<{ user: AuthUser }>('/auth/me')
      .then((res) => setUser(res.user))
      .catch((err) => {
        if (err instanceof AuthError) logout()
      })
      .finally(() => setIsLoading(false))
  }, [logout])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
