import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/auth'
import { AdminAPI } from '../../lib/api'
import { 
  Users, 
  Clock, 
  Search,
  RefreshCw,
  Check,
  X,
  Pause,
  Shield,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

type TabKey = 'users' | 'queue'

export default function AdminDashboard() {
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      location.hash = '#/auth/admin'
    }
  }, [user?.role])

  if (user?.role !== 'ADMIN') return null

  return <AdminContent />
}

function AdminContent() {
  const [active, setActive] = useState<TabKey>('users')
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  
  const tabs: { key: TabKey; label: string; icon: any; badge?: number }[] = useMemo(() => ([
    { key: 'users', label: 'Users', icon: Users },
    { key: 'queue', label: 'Properties Queue', icon: Clock },
  ]), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-14">
      {/* Floating sidebar toggle (always visible) */}
      <button
        aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        onClick={() => setSidebarExpanded(prev => !prev)}
        className="fixed left-2 top-24 z-40 p-2 rounded-full bg-white shadow-lg border border-purple-100 hover:bg-purple-50 transition-colors"
      >
        <ChevronRight className={`w-5 h-5 text-purple-700 transition-transform ${sidebarExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-14 h-[calc(100%-56px)] bg-white border-r border-purple-100 shadow-2xl transition-all duration-300 ease-in-out z-30 ${sidebarExpanded ? 'w-72' : 'w-20'}`}>
        {/* Header */}
        <div className="relative p-6 border-b border-purple-100 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-purple-100 text-sm">Control Center</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className={`w-5 h-5 text-white transition-transform duration-300 ${sidebarExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-1 top-4 w-8 h-8 bg-white/10 rounded-full blur-sm"></div>
          <div className="absolute right-4 bottom-2 w-4 h-4 bg-purple-300/30 rounded-full"></div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {tabs.map(t => {
            const Icon = t.icon
            const isActive = active === t.key
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`
                  group relative w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600 hover:shadow-md'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-r-full opacity-80"></div>
                )}
                
                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-purple-100'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-purple-600'}`} />
                </div>
                
                <div className={`flex-1 text-left transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="font-medium">{t.label}</span>
                </div>

                {/* Badge */}
                {t.badge && sidebarExpanded && (
                  <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    {t.badge}
                  </div>
                )}

                {/* Hover effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/5 group-hover:to-indigo-600/5 rounded-xl transition-all duration-300"></div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom decoration */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className={`bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-4 transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-800">Pro Admin</p>
                <p className="text-xs text-gray-600">Full Access</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarExpanded ? 'ml-72' : 'ml-20'} min-h-screen`}>
        {/* Top Bar (non-sticky to avoid overlapping site navbar) */}
        <div className="bg-white/70 backdrop-blur-md border-b border-purple-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {tabs.find(t => t.key === active)?.label}
              </h2>
              <p className="text-gray-600 text-sm">Manage and monitor your platform</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-medium">System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="animate-fade-in">
            {active === 'users' && <UsersTab />}
            {active === 'queue' && <QueueTab />}
          </div>
        </div>
      </main>

      <style >{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

function UsersTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [savingId, setSavingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const resp = await AdminAPI.listUsers(search ? { search } : undefined)
      setUsers(Array.isArray(resp) ? resp : (resp?.data || []))
    } catch (e:any) {
      setError(e?.message || 'Failed to load users')
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const updateUser = async (id:number, patch:any) => {
    setSavingId(id)
    try { await AdminAPI.updateUser(id, patch); await load() }
    catch (e:any) { alert(e?.message || 'Update failed') }
    finally { setSavingId(null) }
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-purple-600" />
          <div>
            <p className="font-medium text-purple-800">Admin Permissions</p>
            <p className="text-sm text-purple-600">Admins cannot modify user roles or activation status. Only Super Admins can make changes.</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
              placeholder="Search by name or email..." 
              value={search} 
              onChange={e=>setSearch(e.target.value)} 
            />
          </div>
          <button 
            onClick={load} 
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Role</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Payment</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u:any) => (
                  <tr key={u.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="text-sm font-mono text-gray-600">#{u.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        <Shield className="w-3 h-3" />
                        {u.role}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      {u.role === 'OWNER' ? (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          u.ownerPaid 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {u.ownerPaid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {u.ownerPaid ? 'PAID' : 'UNPAID'}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        disabled={savingId === u.id} 
                        onClick={() => updateUser(u.id, { })} 
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60 transition-all"
                      >
                        <RefreshCw className={`w-4 h-4 ${savingId === u.id ? 'animate-spin' : ''}`} />
                        {savingId === u.id ? 'Saving...' : 'Refresh'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function QueueTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  
  const load = async () => {
    setLoading(true); setError(null)
    try {
      const resp = await AdminAPI.approvalQueue()
      setItems(Array.isArray(resp) ? resp : (resp?.data || []))
    } catch (e:any) { setError(e?.message || 'Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const act = async (id: number, status: 'LIVE'|'REJECTED'|'SUSPENDED') => {
    try { await AdminAPI.approveProperty(id, { status }) ; load() } catch (e:any) { alert(e?.message || 'Action failed') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pending Properties</h3>
            <p className="text-sm text-gray-600">{items.length} properties awaiting review</p>
          </div>
        </div>
        <button 
          onClick={load} 
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((p:any) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-gray-900">#{p.id}</span>
                    <h4 className="text-lg font-medium text-gray-800">{p.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Users className="w-4 h-4" />
                    <span>Owner: {p.owner?.email || p.ownerId}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => act(p.id, 'LIVE')} 
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button 
                  onClick={() => act(p.id, 'REJECTED')} 
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
                <button 
                  onClick={() => act(p.id, 'SUSPENDED')} 
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  <Pause className="w-4 h-4" />
                  Suspend
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
              <p className="text-gray-600">No pending properties to review at this time.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

 

 

 

 