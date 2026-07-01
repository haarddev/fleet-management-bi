const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'fleet-bi-token'

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function resolveUrl(path: string): string {
  if (API_BASE.startsWith('http')) {
    return new URL(`${API_BASE}${path}`).toString()
  }
  return new URL(`${API_BASE}${path}`, window.location.origin).toString()
}

function authHeaders(): HeadersInit {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(resolveUrl(path))
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v)
    })
  }
  const res = await fetch(url.toString(), { headers: authHeaders() })
  if (res.status === 401) throw new AuthError('Unauthorized')
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(resolveUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (res.status === 401) throw new AuthError('Unauthorized')
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error ?? `API error: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export type AuthUser = {
  userId: number
  email: string
  name: string
  role: string
}

export type LoginResponse = {
  token: string
  user: AuthUser
}
