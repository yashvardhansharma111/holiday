import { useEffect, useMemo, useState } from 'react'
import HomePage from './Home/Home'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import AgentDashboard from './pages/dashboards/AgentDashboard'
import OwnerDashboard from './pages/dashboards/OwnerDashboard'
import UserDashboard from './pages/dashboards/UserDashboard'
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard'
import HiddenAdminLogin from './pages/HiddenAdminLogin'
import HiddenSuperAdminLogin from './pages/HiddenSuperAdminLogin'
import { useAuth } from './context/auth'

function useHashLocation() {
  const [hash, setHash] = useState(window.location.hash || '#/')
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  return hash
}

export default function Router() {
  const hash = useHashLocation()
  const { user } = useAuth()

  const view = useMemo(() => {
    const path = hash.replace('#', '') || '/'
    if (path === '/' || path === '/home') return <HomePage />
    if (path === '/login') return <LoginPage />
    if (path === '/signup') return <SignupPage />
    if (path === '/auth/admin') return <HiddenAdminLogin />
    if (path === '/auth/super-admin') return <HiddenSuperAdminLogin />

    if (path === '/dashboard') {
      const role = user?.role
      if (role === 'SUPER_ADMIN') return <SuperAdminDashboard />
      if (role === 'ADMIN') return <AdminDashboard />
      if (role === 'AGENT') return <AgentDashboard />
      if (role === 'OWNER') return <OwnerDashboard />
      return <UserDashboard />
    }

    if (path.startsWith('/dashboard/')) {
      const seg = path.split('/')[2]
      if (seg === 'super-admin') return user?.role === 'SUPER_ADMIN' ? <SuperAdminDashboard /> : <HiddenSuperAdminLogin />
      if (seg === 'admin') return user?.role === 'ADMIN' ? <AdminDashboard /> : <HiddenAdminLogin />
      if (seg === 'agent') return <AgentDashboard />
      if (seg === 'owner') return <OwnerDashboard />
      if (seg === 'user') return <UserDashboard />
      return <UserDashboard />
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">404 - Page not found</h1>
          <a className="text-purple-700 hover:underline" href="#/">Go Home</a>
        </div>
      </div>
    )
  }, [hash, user?.role])

  return view
}
