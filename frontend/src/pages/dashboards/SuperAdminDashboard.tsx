import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/auth'
import { AdminAPI } from '../../lib/api'

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

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const resp = await AdminAPI.listUsers()
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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Users</h2>
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">All Users</h3>
            <button onClick={load} className="text-sm px-3 py-1 border rounded">Refresh</button>
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
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-2 pr-2">{u.id}</td>
                      <td className="py-2 pr-2">{u.name}</td>
                      <td className="py-2 pr-2">{u.email}</td>
                      <td className="py-2 pr-2">{u.role}</td>
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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Subscriptions</h2>
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
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Platform Analytics</h2>
      <button onClick={load} className="mb-3 text-sm px-3 py-1 border rounded">Refresh</button>
      {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
        <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-[420px]">{JSON.stringify(data, null, 2)}</pre>
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
