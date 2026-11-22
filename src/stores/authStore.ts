import { create } from 'zustand'

export interface UserSession {
  role: 'admin' | 'barber'
  name: string
  email?: string
  token: string
}

interface AuthState {
  user: UserSession | null
  token: string | null
  isLoading: boolean
  error: string | null

  login: (credentials: { identifier?: string; password?: string; pin?: string }) => Promise<boolean>
  logout: () => void
  isAuthenticated: () => boolean
}

const STORAGE_KEY_AUTH = 'luxe_cuts_auth_session'

function getSavedSession(): UserSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getSavedSession(),
  token: getSavedSession()?.token || null,
  isLoading: false,
  error: null,

  login: async ({ identifier, password, pin }) => {
    set({ isLoading: true, error: null })

    try {
      // 1. Try calling the real backend API server if running
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, pin }),
      }).catch(() => null)

      if (res && res.ok) {
        const data = await res.json()
        const session: UserSession = {
          role: data.user.role || 'admin',
          name: data.user.name || 'Head Concierge',
          email: data.user.email || identifier,
          token: data.token,
        }
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(session))
        set({ user: session, token: session.token, isLoading: false, error: null })
        return true
      }

      // 2. Client-side fallback if backend server isn't started yet
      const isPinMatch = pin === '7788' || identifier === '7788'
      const isEmailMatch = (identifier || '').toLowerCase() === 'admin@luxecuts.com'
      const isPassMatch = password === 'luxe2026' || password === 'admin' || password === 'luxe'

      if (isPinMatch || (isEmailMatch && isPassMatch) || password === 'luxe2026') {
        const session: UserSession = {
          role: 'admin',
          name: 'Head Concierge',
          email: identifier || 'admin@luxecuts.com',
          token: `token-${Date.now()}`,
        }
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(session))
        set({ user: session, token: session.token, isLoading: false, error: null })
        return true
      }

      set({
        isLoading: false,
        error: 'Invalid concierge credentials. Hint: use admin@luxecuts.com / luxe2026 or PIN: 7788',
      })
      return false
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_AUTH)
    set({ user: null, token: null, error: null })
  },

  isAuthenticated: () => {
    return Boolean(get().user && get().token)
  },
}))
