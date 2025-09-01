import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/auth'
import { AdminAPI } from '../../lib/api'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts'

type TabKey = 'users' | 'queue' | 'plans' | 'subscriptions' | 'analytics' | 'health'

export default function SuperAdminDashboard() {
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      location.hash = '#/auth/super-admin'
    }
  }, [user?.role])

  if (user?.role !== 'SUPER_ADMIN') return null

  return <SuperAdminContent />
}

function SuperAdminContent() {
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
        <div className="p-4 font-bold text-lg">Super Admin</div>
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
  // create admin form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState<string | null>(null)
  // create agent form
  const [agentName, setAgentName] = useState('')
  const [agentEmail, setAgentEmail] = useState('')
  const [agentPassword, setAgentPassword] = useState('')
  const [creatingAgent, setCreatingAgent] = useState(false)
  const [createAgentMsg, setCreateAgentMsg] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const resp = await AdminAPI.listUsers(search ? { search } : undefined)
      // Backend returns { data: [...], pagination: {...} }
      setUsers(Array.isArray(resp) ? resp : (resp?.data || []))
    } catch (e: any) {
      setError(e?.message || 'Failed to load users')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const onCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true); setCreateMsg(null); setError(null)
    try {
      await AdminAPI.createAdminUser({ name, email, password })
      setCreateMsg('Admin user created')
      setName(''); setEmail(''); setPassword('')
      load()
    } catch (e: any) {
      setError(e?.message || 'Failed to create admin user')
    } finally { setCreating(false) }
  }

  const onCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingAgent(true); setCreateAgentMsg(null); setError(null)
    try {
      await AdminAPI.createAgentUser({ name: agentName, email: agentEmail, password: agentPassword })
      setCreateAgentMsg('Agent user created')
      setAgentName(''); setAgentEmail(''); setAgentPassword('')
      load()
    } catch (e:any) {
      setError(e?.message || 'Failed to create agent user')
    } finally { setCreatingAgent(false) }
  }

  const toggleOwnerPaid = async (u: any) => {
    setTogglingId(u.id)
    try {
      const next = !Boolean(u.ownerPaid)
      await AdminAPI.updateUser(u.id, { ownerPaid: next })
      await load()
    } catch (e:any) {
      alert(e?.message || 'Failed to toggle owner paid')
    } finally { setTogglingId(null) }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      <div className="mb-3 text-xs text-gray-600 bg-purple-50 border border-purple-200 rounded px-3 py-2">
        <strong>Super Admin:</strong> can create Admins and Agents, toggle Owner Paid for Owners, manage all users and subscriptions.
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h3 className="font-medium mb-3">Create Admin</h3>
          <form className="space-y-2" onSubmit={onCreateAdmin}>
            <input className="w-full border rounded px-3 py-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
            <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            {createMsg && <p className="text-green-700 text-sm">{createMsg}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button disabled={creating} className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-60">{creating ? 'Creating...' : 'Create Admin'}</button>
          </form>
        </div>
        <div className="border rounded p-4">
          <h3 className="font-medium mb-3">Create Agent</h3>
          <form className="space-y-2" onSubmit={onCreateAgent}>
            <input className="w-full border rounded px-3 py-2" placeholder="Name" value={agentName} onChange={e=>setAgentName(e.target.value)} required />
            <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={agentEmail} onChange={e=>setAgentEmail(e.target.value)} required />
            <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={agentPassword} onChange={e=>setAgentPassword(e.target.value)} required />
            {createAgentMsg && <p className="text-green-700 text-sm">{createAgentMsg}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button disabled={creatingAgent} className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-60">{creatingAgent ? 'Creating...' : 'Create Agent'}</button>
          </form>
        </div>
        <div className="border rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">All Users</h3>
            <div className="flex items-center gap-2">
              <input className="border rounded px-3 py-1 text-sm" placeholder="Search name/email" value={search} onChange={e=>setSearch(e.target.value)} />
              <button onClick={load} className="text-sm px-3 py-1 border rounded">Search</button>
            </div>
          </div>
          {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
            <div className="overflow-auto max-h-[420px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-2">ID</th>
                    <th className="py-2 pr-2">Name</th>
                    <th className="py-2 pr-2">Email</th>
                    <th className="py-2 pr-2">Role</th>
                    <th className="py-2 pr-2">Owner Paid</th>
                    <th className="py-2 pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-2 pr-2">{u.id}</td>
                      <td className="py-2 pr-2">{u.name}</td>
                      <td className="py-2 pr-2">{u.email}</td>
                      <td className="py-2 pr-2">{u.role}</td>
                      <td className="py-2 pr-2">
                        {u.role === 'OWNER' ? (
                          <span className={`px-2 py-0.5 rounded text-xs ${u.ownerPaid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{u.ownerPaid ? 'PAID' : 'UNPAID'}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        {u.role === 'OWNER' ? (
                          <button disabled={togglingId === u.id} onClick={() => toggleOwnerPaid(u)} className="px-3 py-1 border rounded text-xs disabled:opacity-60">{togglingId === u.id ? '...' : 'Toggle Paid'}</button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
  const [form, setForm] = useState<any>({ name: '', type: '', price: 0, durationDays: 30, maxProperties: 1, features: {} })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true); setError(null)
    try { setPlans(await AdminAPI.listPlans()) } catch (e:any) { setError(e?.message || 'Failed to load plans') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try { await AdminAPI.createPlan(form); setForm({ name: '', type: '', price: 0, durationDays: 30, maxProperties: 1, features: {} }); load() }
    catch (e:any) { alert(e?.message || 'Failed to create') }
    finally { setSaving(false) }
  }
  const del = async (id:number) => { if (!confirm('Delete plan?')) return; try { await AdminAPI.deletePlan(id); load() } catch (e:any) { alert(e?.message || 'Failed') } }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Subscription Plans</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h3 className="font-medium mb-3">Create Plan</h3>
          <form className="space-y-2" onSubmit={create}>
            <input className="w-full border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={e=>setForm((f:any)=>({ ...f, name:e.target.value }))} required />
            <input className="w-full border rounded px-3 py-2" placeholder="Type (unique)" value={form.type} onChange={e=>setForm((f:any)=>({ ...f, type:e.target.value }))} required />
            <input className="w-full border rounded px-3 py-2" placeholder="Price" type="number" value={form.price} onChange={e=>setForm((f:any)=>({ ...f, price:Number(e.target.value) }))} required />
            <input className="w-full border rounded px-3 py-2" placeholder="Duration (days)" type="number" value={form.durationDays} onChange={e=>setForm((f:any)=>({ ...f, durationDays:Number(e.target.value) }))} required />
            <input className="w-full border rounded px-3 py-2" placeholder="Max Properties" type="number" value={form.maxProperties} onChange={e=>setForm((f:any)=>({ ...f, maxProperties:Number(e.target.value) }))} required />
            <button disabled={saving} className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-60">{saving?'Saving...':'Save Plan'}</button>
          </form>
        </div>
        <div className="border rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Plans</h3>
            <button onClick={load} className="text-sm px-3 py-1 border rounded">Refresh</button>
          </div>
          {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
            <ul className="space-y-2">
              {plans.map((p:any) => (
                <li key={p.id} className="border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.name} (${p.price})</div>
                    <div className="text-xs text-gray-600">Type: {p.type} • Duration: {p.durationDays}d • Max Props: {p.maxProperties}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => del(p.id)} className="px-3 py-1 rounded border text-red-600 border-red-600">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function SubscriptionsTab() {
  const [userId, setUserId] = useState<number | ''>('' as any)
  const [planId, setPlanId] = useState<number | ''>('' as any)
  const [subscriptionId, setSubscriptionId] = useState<number | ''>('' as any)
  const [message, setMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [togglingId, setTogglingId] = useState<number | null>(null)

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
  const setPaid = async (paid:boolean) => {
    setMessage(null)
    try { await AdminAPI.setSubscriptionPaidStatus(Number(subscriptionId), { paid }); setMessage('Updated paid status') }
    catch (e:any) { alert(e?.message || 'Failed') }
  }

  const searchUsers = async () => {
    setSearching(true); setMessage(null)
    try {
      const resp = await AdminAPI.listUsers(search ? { search } : undefined)
      setResults(Array.isArray(resp) ? resp : (resp?.data || []))
    } catch (e:any) {
      alert(e?.message || 'Search failed')
    } finally { setSearching(false) }
  }

  const togglePaidForUser = async (u:any) => {
    setTogglingId(u.id)
    try {
      const next = !Boolean(u.ownerPaid)
      await AdminAPI.updateUser(u.id, { ownerPaid: next })
      setResults(prev => prev.map(x => x.id === u.id ? { ...x, ownerPaid: next } : x))
      setMessage(`User #${u.id}: ownerPaid ${next ? 'PAID' : 'UNPAID'}`)
    } catch (e:any) {
      alert(e?.message || 'Failed to toggle paid')
    } finally { setTogglingId(null) }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Subscriptions</h2>
      <div className="mb-3 text-xs text-gray-600 bg-purple-50 border border-purple-200 rounded px-3 py-2">
        <strong>Tip:</strong> Only Super Admin can mark a subscription as paid/unpaid. Use Search to quickly locate users and toggle Owner Paid for Owners.
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
            <button onClick={() => setPaid(true)} className="px-3 py-2 rounded border">Mark Paid</button>
            <button onClick={() => setPaid(false)} className="px-3 py-2 rounded border">Mark Unpaid</button>
          </div>
        </div>
      </div>
      <div className="mt-6 border rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Find Users</h3>
          <div className="flex items-center gap-2">
            <input className="border rounded px-3 py-2 text-sm" placeholder="Search by name or email" value={search} onChange={e=>setSearch(e.target.value)} />
            <button onClick={searchUsers} disabled={searching} className="text-sm px-3 py-2 border rounded disabled:opacity-60">{searching ? 'Searching...' : 'Search'}</button>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-2">ID</th>
                <th className="py-2 pr-2">Name</th>
                <th className="py-2 pr-2">Email</th>
                <th className="py-2 pr-2">Role</th>
                <th className="py-2 pr-2">Owner Paid</th>
                <th className="py-2 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((u:any) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-2 pr-2">{u.id}</td>
                  <td className="py-2 pr-2">{u.name}</td>
                  <td className="py-2 pr-2">{u.email}</td>
                  <td className="py-2 pr-2">{u.role}</td>
                  <td className="py-2 pr-2">
                    {u.role === 'OWNER' ? (
                      <span className={`px-2 py-0.5 rounded text-xs ${u.ownerPaid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{u.ownerPaid ? 'PAID' : 'UNPAID'}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-2 flex gap-2">
                    <button onClick={() => setUserId(u.id)} className="px-3 py-1 border rounded text-xs">Use ID</button>
                    {u.role === 'OWNER' ? (
                      <button disabled={togglingId === u.id} onClick={() => togglePaidForUser(u)} className="px-3 py-1 border rounded text-xs disabled:opacity-60">{togglingId === u.id ? '...' : 'Toggle Paid'}</button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr><td colSpan={5} className="py-3 text-center text-gray-500">No users yet. Search above.</td></tr>
              )}
            </tbody>
          </table>
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
