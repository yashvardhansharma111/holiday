import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'OWNER' | 'USER'

type User = {
  id: number
  name: string
  email: string
  role: Role
  phone?: string | null
  avatar?: string | null
} | null

type AuthContextType = {
  user: User
  loginWithToken: (user: NonNullable<User>, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)

  useEffect(() => {
    const raw = localStorage.getItem('auth_user')
    if (raw) {
      try { setUser(JSON.parse(raw)) } catch {}
    }
  }, [])

  const loginWithToken = (u: NonNullable<User>, token: string) => {
    setUser(u)
    localStorage.setItem('auth_user', JSON.stringify(u))
    localStorage.setItem('jwt', token)
    // route by role
    if (u.role === 'SUPER_ADMIN') {
      location.hash = '#/dashboard/super-admin'
    } else if (u.role === 'ADMIN') {
      location.hash = '#/dashboard/admin'
    } else if (u.role === 'AGENT') {
      location.hash = '#/dashboard/agent'
    } else if (u.role === 'OWNER') {
      location.hash = '#/dashboard/owner'
    } else {
      location.hash = '#/dashboard/user'
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
    localStorage.removeItem('jwt')
    location.hash = '#/'
  }

  const value = useMemo(() => ({ user, loginWithToken, logout }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
