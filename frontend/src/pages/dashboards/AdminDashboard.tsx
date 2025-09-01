import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/auth'
import { AdminAPI } from '../../lib/api'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts'

type TabKey = 'users' | 'queue' | 'plans' | 'subscriptions' | 'analytics' | 'health'

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
  const tabs: { key: TabKey; label: string }[] = useMemo(() => ([
    { key: 'users', label: 'Users' },
    { key: 'queue', label: 'Properties Queue' },
    { key: 'plans', label: 'Plans' },
    { key: 'subscriptions', label: 'Subscriptions' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'health', label: 'Health' },
  ]), [])

  return (
    <div className="min-h-[70vh] flex">
      <aside className="w-60 border-r bg-white">
        <div className="p-4 font-bold text-lg">Admin</div>
        <nav className="p-2 space-y-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={
                'w-full text-left px-3 py-2 rounded ' +
                (active === t.key ? 'bg-purple-600 text-white' : 'hover:bg-gray-100')
              }
            >
              {t.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {active === 'users' && <UsersTab />}
        {active === 'queue' && <QueueTab />}
        {active === 'plans' && <PlansTab />}
        {active === 'subscriptions' && <SubscriptionsTab />}
        {active === 'analytics' && <AnalyticsTab />}
        {active === 'health' && <HealthTab />}
      </main>
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

  // Admins are not allowed to toggle ownerPaid; Super Admin only

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      <div className="mb-3 text-xs text-gray-600 bg-purple-50 border border-purple-200 rounded px-3 py-2">
        <strong>Note:</strong> Admins cannot toggle Owner Paid or Subscription Paid. Only Super Admins can change paid statuses.
      </div>
      <div className="mb-3 flex gap-2 items-center">
        <input className="border rounded px-3 py-2 text-sm" placeholder="Search by name or email" value={search} onChange={e=>setSearch(e.target.value)} />
        <button onClick={load} className="text-sm px-3 py-2 border rounded">Search</button>
      </div>
      {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-2">ID</th>
                <th className="py-2 pr-2">Name</th>
                <th className="py-2 pr-2">Email</th>
                <th className="py-2 pr-2">Role</th>
                <th className="py-2 pr-2">Active</th>
                <th className="py-2 pr-2">Owner Paid</th>
                <th className="py-2 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u:any) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-2 pr-2">{u.id}</td>
                  <td className="py-2 pr-2">{u.name}</td>
                  <td className="py-2 pr-2">{u.email}</td>
                  <td className="py-2 pr-2">
                    <select
                      className="border rounded px-2 py-1 text-xs"
                      value={u.role}
                      onChange={e => updateUser(u.id, { role: e.target.value })}
                    >
                      <option value="USER">USER</option>
                      <option value="OWNER">OWNER</option>
                      <option value="AGENT">AGENT</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="py-2 pr-2">
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={u.isActive} onChange={e => updateUser(u.id, { isActive: e.target.checked })} />
                      <span>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </label>
                  </td>
                  <td className="py-2 pr-2">
                    {u.role === 'OWNER' ? (
                      <span className={`px-2 py-0.5 rounded text-xs ${u.ownerPaid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{u.ownerPaid ? 'PAID' : 'UNPAID'}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-2 flex gap-2">
                    <button disabled={savingId === u.id} onClick={() => updateUser(u.id, { })} className="px-3 py-1 border rounded text-xs disabled:opacity-60">{savingId === u.id ? 'Saving...' : 'Refresh'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
    <div>
      <h2 className="text-xl font-semibold mb-4">Pending Properties</h2>
      <button onClick={load} className="mb-3 text-sm px-3 py-1 border rounded">Refresh</button>
      {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
        <div className="space-y-3">
          {items.map((p:any) => (
            <div key={p.id} className="border rounded p-3">
              <div className="font-medium">#{p.id} {p.title}</div>
              <div className="text-xs text-gray-600">Owner: {p.owner?.email || p.ownerId}</div>
              <div className="mt-2 flex gap-2 text-sm">
                <button onClick={() => act(p.id, 'LIVE')} className="px-3 py-1 rounded bg-green-600 text-white">Approve</button>
                <button onClick={() => act(p.id, 'REJECTED')} className="px-3 py-1 rounded bg-red-600 text-white">Reject</button>
                <button onClick={() => act(p.id, 'SUSPENDED')} className="px-3 py-1 rounded bg-amber-600 text-white">Suspend</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-600">No pending properties.</p>}
        </div>
      )}
    </div>
  )
}

function PlansTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plans, setPlans] = useState<any[]>([])
  const load = async () => {
    setLoading(true); setError(null)
    try { setPlans(await AdminAPI.listPlans()) } catch (e:any) { setError(e?.message || 'Failed to load plans') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Subscription Plans</h2>
      {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
        <ul className="space-y-2">
          {plans.map((p:any) => (
            <li key={p.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name} (${p.price})</div>
                <div className="text-xs text-gray-600">Type: {p.type} • Duration: {p.durationDays}d • Max Props: {p.maxProperties}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SubscriptionsTab() {
  const [userId, setUserId] = useState<number | ''>('' as any)
  const [planId, setPlanId] = useState<number | ''>('' as any)
  const [subscriptionId, setSubscriptionId] = useState<number | ''>('' as any)
  const [message, setMessage] = useState<string | null>(null)

  const grant = async () => {
    setMessage(null)
    try { await AdminAPI.grantUserSubscription(Number(userId), { planId: Number(planId) }); setMessage('Granted subscription') }
    catch (e:any) { alert(e?.message || 'Failed') }
  }
  const cancel = async () => {
    setMessage(null)
    try { await AdminAPI.cancelUserSubscription(Number(subscriptionId)); setMessage('Cancelled subscription') }
    catch (e:any) { alert(e?.message || 'Failed') }
  }
  // Admins cannot change paid status; Super Admin only

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Subscriptions</h2>
      <div className="mb-3 text-xs text-gray-600 bg-purple-50 border border-purple-200 rounded px-3 py-2">
        <strong>Note:</strong> Admins can grant/cancel subscriptions but cannot mark subscriptions paid/unpaid. Only Super Admins can change paid status.
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded p-4 space-y-2">
          <h3 className="font-medium">Grant Subscription</h3>
          <input className="w-full border rounded px-3 py-2" placeholder="User ID" value={userId as any} onChange={e=>setUserId(e.target.value as any)} />
          <input className="w-full border rounded px-3 py-2" placeholder="Plan ID" value={planId as any} onChange={e=>setPlanId(e.target.value as any)} />
          <button onClick={grant} className="bg-purple-600 text-white px-4 py-2 rounded">Grant</button>
        </div>
        <div className="border rounded p-4 space-y-2">
          <h3 className="font-medium">Manage Subscription</h3>
          <input className="w-full border rounded px-3 py-2" placeholder="Subscription ID" value={subscriptionId as any} onChange={e=>setSubscriptionId(e.target.value as any)} />
          <div className="flex gap-2">
            <button onClick={cancel} className="px-3 py-2 rounded border">Cancel</button>
          </div>
        </div>
      </div>
      {message && <p className="mt-3 text-green-700 text-sm">{message}</p>}
    </div>
  )
}

function AnalyticsTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const load = async () => {
    setLoading(true); setError(null)
    try { setData(await AdminAPI.analytics()) } catch (e:any) { setError(e?.message || 'Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const roleData = (data?.users?.byRole || []).map((r:any)=>({ role: r.role, count: r._count?.role || r._count || 0 }))
  const propertyData = [
    { name: 'Live', value: data?.properties?.live || 0 },
    { name: 'Pending', value: data?.properties?.pending || 0 },
  ]
  const bookingData = [
    { name: 'Total', value: data?.bookings?.total || 0 },
    { name: 'Confirmed', value: data?.bookings?.confirmed || 0 },
    { name: 'Pending', value: data?.bookings?.pending || 0 },
  ]
  const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4']
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Platform Analytics</h2>
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Total Users</div>
          <div className="text-2xl font-semibold">{data?.users?.total ?? '—'}</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">New Users</div>
          <div className="text-2xl font-semibold">{data?.users?.new ?? '—'}</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Revenue (Total)</div>
          <div className="text-2xl font-semibold">${data?.revenue?.total?.toLocaleString?.() ?? '0'}</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="text-xs text-gray-500">Revenue (Period)</div>
          <div className="text-2xl font-semibold">${data?.revenue?.period?.toLocaleString?.() ?? '0'}</div>
        </div>
      </div>
      <button onClick={load} className="mb-4 text-sm px-3 py-1 border rounded">Refresh</button>
      {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded p-4 bg-white">
            <div className="font-medium mb-2">Users by Role</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" />
                  <YAxis allowDecimals={false} />
                  <ReTooltip />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="border rounded p-4 bg-white">
            <div className="font-medium mb-2">Properties Status</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={propertyData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {propertyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="border rounded p-4 bg-white md:col-span-2">
            <div className="font-medium mb-2">Bookings Overview</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <ReTooltip />
                  <Bar dataKey="value" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function HealthTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const load = async () => {
    setLoading(true); setError(null)
    try { setData(await AdminAPI.health()) } catch (e:any) { setError(e?.message || 'Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">System Health</h2>
      <button onClick={load} className="mb-3 text-sm px-3 py-1 border rounded">Refresh</button>
      {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
        <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-[420px]">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  )
}
