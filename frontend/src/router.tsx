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
import PropertyDetails from './pages/PropertyDetails'

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
      if (role === 'OWNER') {
        if (user?.ownerPaid) return <OwnerDashboard />
        return (
          <div className="min-h-[60vh] flex items-center justify-center p-10">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-2">Access requires payment</h1>
              <p className="text-gray-600">Please contact support or an admin to activate your owner access.</p>
              <a className="text-purple-700 hover:underline inline-block mt-3" href="#/">Go Home</a>
            </div>
          </div>
        )
      }
      return <UserDashboard />
    }

    // Public property details route
    if (path.startsWith('/properties/')) {
      return <PropertyDetails />
    }

    if (path.startsWith('/dashboard/')) {
      const seg = path.split('/')[2]
      if (seg === 'super-admin') return user?.role === 'SUPER_ADMIN' ? <SuperAdminDashboard /> : <HiddenSuperAdminLogin />
      if (seg === 'admin') return user?.role === 'ADMIN' ? <AdminDashboard /> : <HiddenAdminLogin />
      if (seg === 'agent') return <AgentDashboard />
      if (seg === 'owner') {
        if (user?.role === 'OWNER' && user?.ownerPaid) return <OwnerDashboard />
        return (
          <div className="min-h-[60vh] flex items-center justify-center p-10">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-2">Access requires payment</h1>
              <p className="text-gray-600">Please contact support or an admin to activate your owner access.</p>
              <a className="text-purple-700 hover:underline inline-block mt-3" href="#/">Go Home</a>
            </div>
          </div>
        )
      }
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
  }, [hash, user?.role, user?.ownerPaid])

  return view
}
