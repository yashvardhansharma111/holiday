import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/auth'
import { PropertiesAPI, BookingsAPI, MediaAPI } from '../../lib/api'
import { PropertiesAPI as NewPropertiesAPI } from '../../api'
import { 
  Home, 
  Plus, 
  HelpCircle,
  RefreshCw,
  Check,
  X,
  Upload,
  Trash2,
  Edit3,
  MapPin,
  Users,
  Star,
  Calendar,
  Filter,
  Search
} from 'lucide-react'

export default function AgentDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'my-properties'|'new-property'|'help'>('my-properties')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [filters, setFilters] = useState({ search:'', city:'', status:'', minPrice:'', maxPrice:'' })

  // Role guard: only AGENT can access
  useEffect(() => {
    if (user && user.role !== 'AGENT') {
      location.hash = '#/dashboard'
    }
  }, [user])

  if (user?.role !== 'AGENT') return null

  const loadProps = async () => {
    setLoading(true); setError(null)
    try {
      const list = await PropertiesAPI.myProperties()
      // Normalize paginated or direct array responses
      const arr = (list as any)?.data?.data || (list as any)?.data?.items || (list as any)?.data || (list as any)?.items || list || []
      setProperties(Array.isArray(arr) ? arr : [])
    } catch (e: any) { setError(e?.message || 'Failed to load properties') }
    finally { setLoading(false) }
  }
  useEffect(() => { loadProps() }, [])

  // removed legacy inline bookings toggling in favor of per-card control

  const myRole = useMemo(() => user?.role, [user])
  const filtered = useMemo(() => {
    const s = filters.search.toLowerCase()
    const city = filters.city.toLowerCase()
    const status = filters.status
    const min = filters.minPrice ? Number(filters.minPrice) : null
    const max = filters.maxPrice ? Number(filters.maxPrice) : null
    return properties.filter(p => {
      if (s && !(`${p.title||''} ${p.city||''} ${p.country||''}`.toLowerCase().includes(s))) return false
      if (city && String(p.city||'').toLowerCase().indexOf(city) === -1) return false
      if (status && String(p.status||'') !== status) return false
      if (min!=null && Number(p.price) < min) return false
      if (max!=null && Number(p.price) > max) return false
      return true
    })
  }, [properties, filters])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-14">
      {/* Sidebar */}
      <aside className="fixed left-0 top-14 h-[calc(100%-56px)] w-72 bg-white border-r border-purple-100 shadow-2xl z-30">
        {/* Header */}
        <div className="relative p-6 border-b border-purple-100 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Agent Panel</h1>
              <p className="text-purple-100 text-sm">Property Management</p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-1 top-4 w-8 h-8 bg-white/10 rounded-full blur-sm"></div>
          <div className="absolute right-4 bottom-2 w-4 h-4 bg-purple-300/30 rounded-full"></div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {[
            { key: 'my-properties', label: 'My Properties', icon: Home },
            { key: 'new-property', label: 'Create Property', icon: Plus },
            { key: 'help', label: 'Help', icon: HelpCircle }
          ].map(t => {
            const Icon = t.icon
            const isActive = activeTab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
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
                
                <Icon className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-white' : 'text-purple-600 group-hover:text-purple-700'
                }`} />
                
                <span className="font-medium">{t.label}</span>
                
                {/* Hover effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-indigo-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Filters Section (only for My Properties) */}
        {activeTab === 'my-properties' && (
          <div className="p-4">
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
              <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h4>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                    placeholder="Search properties..." 
                    value={filters.search} 
                    onChange={e=>setFilters(f=>({...f, search:e.target.value}))} 
                  />
                </div>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                  placeholder="City" 
                  value={filters.city} 
                  onChange={e=>setFilters(f=>({...f, city:e.target.value}))} 
                />
                <select 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                  value={filters.status} 
                  onChange={e=>setFilters(f=>({...f, status:e.target.value}))}
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="LIVE">Live</option>
                  <option value="DISABLED">Disabled</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                    placeholder="Min $" 
                    type="number" 
                    value={filters.minPrice} 
                    onChange={e=>setFilters(f=>({...f, minPrice:e.target.value}))} 
                  />
                  <input 
                    className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                    placeholder="Max $" 
                    type="number" 
                    value={filters.maxPrice} 
                    onChange={e=>setFilters(f=>({...f, maxPrice:e.target.value}))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    onClick={loadProps} 
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                  <button 
                    onClick={()=>setFilters({search:'', city:'', status:'', minPrice:'', maxPrice:''})} 
                    className="px-3 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
      
      {/* Main Content */}
      <main className="ml-72 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === 'help' && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Help & Guide</h2>
                  <p className="text-purple-600">Learn how to manage your properties</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 text-gray-700">
                <p className="mb-2">📋 <strong>Property Management:</strong> Use the filters on the left to narrow your properties by search, city, status, and price range.</p>
                <p className="mb-2">📅 <strong>Booking Management:</strong> Expand any property card to view and confirm pending bookings from guests.</p>
                <p>✨ <strong>Create Properties:</strong> Add new properties using the Create Property tab. All new properties require admin approval.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'new-property' && (
            <CreatePropertyTab onCreated={() => setActiveTab('my-properties')} />
          )}
          
          {activeTab === 'my-properties' && (
            <MyPropertiesTab 
              loading={loading} 
              error={error} 
              filtered={filtered} 
              loadProps={loadProps} 
            />
          )}
          
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Welcome {user?.name} ({myRole}). Manage bookings for your properties.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

function MyPropertiesTab({ loading, error, filtered, loadProps }: { loading: boolean; error: string | null; filtered: any[]; loadProps: () => void }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
              <p className="text-purple-600">Manage your property listings</p>
            </div>
          </div>
          <button 
            onClick={loadProps} 
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse bg-white border border-purple-100 rounded-xl p-6">
              <div className="h-4 bg-purple-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-purple-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-purple-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((p:any) => (
            <AgentPropertyCard key={p.id} prop={p} onChanged={loadProps} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4">
                <Home className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-gray-600 text-lg mb-2">No properties found</p>
              <p className="text-gray-500">Try adjusting your filters or create a new property</p>
            </div>
          )}
        </div>
      )}

      
    </div>
  )
}

function AgentPropertyCard({ prop, onChanged }: { prop: any; onChanged: () => void }) {
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(prop.title || '')
  const [price, setPrice] = useState<number | ''>(prop.price || '')
  const [city, setCity] = useState(prop.city || '')
  const [country, setCountry] = useState(prop.country || '')
  const [instantBooking, setInstantBooking] = useState(!!prop.instantBooking)
  const [media, setMedia] = useState<any[]>(prop.media || [])
  const [openBookings, setOpenBookings] = useState(false)
  const [bookingsList, setBookingsList] = useState<any[] | null>(null)
  const [busy, setBusy] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  // iCal runtime cache controls
  const [icalUrl, setIcalUrl] = useState('')
  const [icalStatus, setIcalStatus] = useState<string | null>(null)
  const [icalLoading, setIcalLoading] = useState(false)
  const [icalBlocks, setIcalBlocks] = useState<any[] | null>(null)

  const save = async () => {
    setSaving(true)
    try {
      await PropertiesAPI.update(prop.id, { title, price: Number(price), city, country, instantBooking })
      onChanged()
    } catch (e:any) { alert(e?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const remove = async () => {
    if (!confirm('Delete this property?')) return
    setDeleting(true)
    try { await PropertiesAPI.remove(prop.id); onChanged() } catch (e:any) { alert(e?.message || 'Delete failed') }
    finally { setDeleting(false) }
  }

  const onUpload = async (file: File) => {
    try {
      const { presignedUrl, url } = await MediaAPI.generatePresigned(file)
      await MediaAPI.uploadToPresigned(presignedUrl, file)
      const newItem = { type: 'image', url, caption: '', isPrimary: media.length === 0 }
      setMedia(prev => [...prev, newItem])
      await PropertiesAPI.addMedia(prop.id, [url])
      onChanged()
    } catch (e:any) { alert(e?.message || 'Upload failed') }
  }

  const deleteImage = async (url: string) => {
    if (!confirm('Delete this image?')) return
    try {
      await PropertiesAPI.removeMedia(prop.id, [url])
      setMedia(prev => prev.filter((m:any) => m.url !== url))
      onChanged()
    } catch (e:any) { alert(e?.message || 'Delete failed') }
  }

  const loadBookings = async () => {
    try {
      const resp = await BookingsAPI.propertyBookings(prop.id)
      const list = Array.isArray(resp?.bookings) ? resp.bookings : (Array.isArray(resp) ? resp : [])
      setBookingsList(list)
    } catch (e:any) { alert(e?.message || 'Failed to load bookings') }
  }

  const toggleBookings = async () => {
    const next = !openBookings
    setOpenBookings(next)
    if (next && bookingsList == null) await loadBookings()
  }

  const confirmBooking = async (bookingId: number) => {
    setBusy(bookingId)
    try {
      await BookingsAPI.confirm(bookingId)
      await loadBookings()
    } catch (e:any) { alert(e?.message || 'Failed to confirm booking') }
    finally { setBusy(null) }
  }

  // Feature flags are Super Admin-only; Agent UI removed

  return (
    <div className="group bg-white border border-purple-100 rounded-xl shadow-sm hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300">
      {/* Header with status badge */}
      <div className="flex items-center justify-between p-6 border-b border-purple-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Home className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{prop.title || 'Untitled Property'}</h3>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-sm text-gray-600">{prop.city}, {prop.country}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            prop.status === 'LIVE' ? 'bg-green-100 text-green-700 border border-green-200' :
            prop.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
            'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {prop.status === 'LIVE' && <Check className="w-3 h-3" />}
            {prop.status}
          </span>
        </div>
      </div>

      {/* Property Details Form */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
              placeholder="Property title" 
              value={title} 
              onChange={e=>setTitle(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Price per night</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input 
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                placeholder="0" 
                type="number" 
                value={price as any} 
                onChange={e=>setPrice(e.target.value as any)} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">City</label>
            <input 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
              placeholder="City" 
              value={city} 
              onChange={e=>setCity(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Country</label>
            <input 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
              placeholder="Country" 
              value={country} 
              onChange={e=>setCountry(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <input 
                type="checkbox" 
                checked={instantBooking} 
                onChange={e=>setInstantBooking(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" 
              />
              Instant booking available
            </label>
          </div>
          
          {/* Feature Flags: not available for Agents */}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={save} 
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            onClick={remove}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button 
            onClick={toggleBookings}
            className="inline-flex items-center gap-2 px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            {openBookings ? 'Hide' : 'View'} Bookings
          </button>
        </div>
      </div>

      {/* Images Section */}
      <div className="px-6 pb-6">
        <h4 className="font-medium text-gray-900 mb-3">Property Images</h4>
        <div className="flex flex-wrap gap-4">
          {media?.map((m:any) => (
            <div key={m.url} className="relative group">
              <div className="w-32 h-24 rounded-lg overflow-hidden border border-gray-200">
                <img src={m.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <button 
                onClick={() => deleteImage(m.url)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="w-32 h-24 border-2 border-dashed border-purple-200 rounded-lg flex flex-col items-center justify-center text-purple-600 cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors">
            <Upload className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Upload</span>
            <input type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if (f) onUpload(f) }} />
          </label>
        </div>
      </div>

      {/* Bookings Section */}
      {openBookings && (
        <div className="border-t border-purple-50 px-6 py-4">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Property Bookings
          </h4>
          <div className="space-y-3">
            {(bookingsList || []).map((b:any) => (
              <div key={b.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{b.user?.name || 'Guest'} • {b.guests} guests</div>
                    <div className="text-sm text-gray-600">
                      {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()} • {b.nights} nights
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {b.status === 'PENDING' && (
                    <button 
                      disabled={busy===b.id} 
                      onClick={() => confirmBooking(b.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      {busy===b.id? 'Confirming...' : 'Confirm'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {(!bookingsList || bookingsList.length===0) && (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No bookings yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* iCal Sync (runtime cache, no DB) */}
      <div className="px-6 pb-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">iCal Sync</h4>
          <p className="text-sm text-gray-600 mb-3">Paste an external iCal URL and sync to server memory. This will immediately affect availability filtering for searches.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={icalUrl} onChange={e=>setIcalUrl(e.target.value)} placeholder="https://...calendar.ics" className="flex-1 border rounded px-3 py-2" />
            <button disabled={icalLoading || !icalUrl} onClick={async ()=>{
              try {
                setIcalLoading(true); setIcalStatus(null)
                const res = await fetch(`/api/properties/${prop.id}/ical/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: icalUrl }) })
                const data = await res.json()
                if (data?.success) setIcalStatus(`Synced. Events: ${data?.data?.events ?? 0}`)
                else setIcalStatus(data?.message || 'Sync failed')
              } catch (e:any) { setIcalStatus(e?.message || 'Sync failed') } finally { setIcalLoading(false) }
            }} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-60">{icalLoading? 'Syncing…' : 'Sync iCal'}</button>
            <button onClick={async ()=>{
              try {
                const params = new URLSearchParams()
                const from = new Date(); const to = new Date(); to.setMonth(to.getMonth()+6)
                params.set('from', from.toISOString()); params.set('to', to.toISOString())
                const r = await fetch(`/api/properties/${prop.id}/ical/blocks?`+params.toString())
                const d = await r.json();
                setIcalBlocks(Array.isArray(d?.data) ? d.data : [])
              } catch (_) { setIcalBlocks([]) }
            }} className="px-4 py-2 border rounded hover:bg-gray-50">View Cached Blocks</button>
          </div>
          {icalStatus && <p className="text-sm mt-2">{icalStatus}</p>}
          {Array.isArray(icalBlocks) && (
            <div className="mt-3 text-sm text-gray-700">
              <div className="font-medium mb-1">Cached blocks (next 6 months): {icalBlocks.length}</div>
              <div className="max-h-40 overflow-auto border rounded p-2 bg-white">
                {icalBlocks.length === 0 ? <div className="text-gray-500">No cached blocks</div> : icalBlocks.map((b: any, i: number)=> (
                  <div key={i} className="flex items-center justify-between py-1 border-b last:border-b-0">
                    <span>{new Date(b.start).toLocaleDateString()} → {new Date(b.end).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-500">{b.summary || ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
function CreatePropertyTab({ onCreated }: { onCreated: () => void }) {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [address, setAddress] = useState('')
  const [location, setLocation] = useState('')
  const [latitude, setLatitude] = useState<number | ''>('' as any)
  const [longitude, setLongitude] = useState<number | ''>('' as any)
  const [price, setPrice] = useState<number | ''>('' as any)
  const [maxGuests, setMaxGuests] = useState<number | ''>('' as any)
  const [bedrooms, setBedrooms] = useState<number | ''>('' as any)
  const [bathrooms, setBathrooms] = useState<number | ''>('' as any)
  const [propertyType, setPropertyType] = useState('apartment')
  const [instantBooking, setInstantBooking] = useState(false)
  const [images, setImages] = useState<string[]>([])
  // New fields
  const [initialRating, setInitialRating] = useState<number | ''>('' as any)
  const [headerRibbonText, setHeaderRibbonText] = useState('')
  const [headerRibbonPrice, setHeaderRibbonPrice] = useState<number | ''>('' as any)
  const [regionId, setRegionId] = useState<number | ''>('' as any)
  const [destinationId, setDestinationId] = useState<number | ''>('' as any)
  const [amenitiesSel, setAmenitiesSel] = useState<string[]>([])
  const [newAmenity, setNewAmenity] = useState('')
  const [nearbyAttractions, setNearbyAttractions] = useState<string[]>([])
  const [newAttraction, setNewAttraction] = useState('')

  const addAmenity = () => {
    if (newAmenity.trim() && !amenitiesSel.includes(newAmenity.trim())) {
      setAmenitiesSel(prev => [...prev, newAmenity.trim()])
      setNewAmenity('')
    }
  }

  const removeAmenity = (amenity: string) => {
    setAmenitiesSel(prev => prev.filter(a => a !== amenity))
  }
  const [videos, setVideos] = useState<string[]>([])
  const [newVideo, setNewVideo] = useState('')
  // Seasonal pricing
  type PricingRange = { category?: string; startDate: string; endDate: string; rate: number | ''; minStay?: number | '' }
  const [pricingRanges, setPricingRanges] = useState<PricingRange[]>([])
  const addPricingRange = () => setPricingRanges(prev => [...prev, { category: '', startDate: '', endDate: '', rate: '' as any, minStay: '' as any }])
  const updateRange = (idx:number, patch: Partial<PricingRange>) => setPricingRanges(prev => prev.map((r,i)=> i===idx ? { ...r, ...patch } : r))
  const removeRange = (idx:number) => setPricingRanges(prev => prev.filter((_,i)=>i!==idx))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCreating(true)
    try {
      if (title.trim().length < 5) throw new Error('Title must be at least 5 characters')
      if (description.trim().length < 20) throw new Error('Description must be at least 20 characters')
      if (location.trim().length < 5) throw new Error('Location must be at least 5 characters')
      if (address.trim().length < 10) throw new Error('Address must be at least 10 characters')
      if (images.length < 1) throw new Error('Please upload at least one image')
      // Validate pricing ranges
      const pr = pricingRanges
        .filter(r => r.startDate && r.endDate && r.rate !== '' )
        .map(r => ({
          category: r.category || undefined,
          startDate: new Date(r.startDate).toISOString(),
          endDate: new Date(r.endDate).toISOString(),
          rate: Number(r.rate),
          minStay: r.minStay === '' || r.minStay == null ? undefined : Number(r.minStay)
        }))
      
      const body = {
        title,
        description,
        location,
        city,
        country,
        address,
        ...(latitude !== '' ? { latitude: Number(latitude) } : {}),
        ...(longitude !== '' ? { longitude: Number(longitude) } : {}),
        price: Number(price),
        pricePerNight: true,
        amenities: amenitiesSel,
        media: images.map((url, idx) => ({ type: 'image', url, caption: '', isPrimary: idx === 0 })),
        maxGuests: Number(maxGuests || 1),
        bedrooms: Number(bedrooms || 1),
        bathrooms: Number(bathrooms || 1),
        propertyType,
        instantBooking,
        initialRating: initialRating === '' ? undefined : Number(initialRating),
        headerRibbonText: headerRibbonText || undefined,
        headerRibbonPrice: headerRibbonPrice === ''
          ? undefined
          : (Number(headerRibbonPrice) < 0 ? undefined : Number(headerRibbonPrice)),
        nearbyAttractions: nearbyAttractions.length ? nearbyAttractions : undefined,
        videos: videos.length ? videos : undefined,
        pricingRanges: pr.length ? pr : undefined,
        ...(regionId !== '' ? { regionId: Number(regionId) } : {}),
        ...(destinationId !== '' ? { destinationId: Number(destinationId) } : {}),
      }
      await PropertiesAPI.create(body)
      onCreated()
    } catch (e:any) { setError(e?.message || 'Create failed') }
    finally { setCreating(false) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Property</h2>
            <p className="text-purple-600">Add a new property to your portfolio</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-purple-100 rounded-xl shadow-sm p-6">
        <form className="space-y-6" onSubmit={submit}>
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Property Title *</label>
              <input 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                placeholder="Enter property title" 
                value={title} 
                onChange={e=>setTitle(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Location *</label>
              <input 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                placeholder="Neighborhood or area" 
                value={location} 
                onChange={e=>setLocation(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">City *</label>
              <input 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                placeholder="City" 
                value={city} 
                onChange={e=>setCity(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Country *</label>
              <input 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                placeholder="Country" 
                value={country} 
                onChange={e=>setCountry(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <input 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                placeholder="Full address" 
                value={address} 
                onChange={e=>setAddress(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Latitude</label>
              <input 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                placeholder="e.g., 37.7749" 
                type="number" 
                step="any" 
                value={latitude as any} 
                onChange={e=>setLatitude(e.target.value === '' ? '' : Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Longitude</label>
              <input 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                placeholder="e.g., -122.4194" 
                type="number" 
                step="any" 
                value={longitude as any} 
                onChange={e=>setLongitude(e.target.value === '' ? '' : Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Price per night *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input 
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                  placeholder="0" 
                  type="number" 
                  value={price as any} 
                  onChange={e=>setPrice(e.target.value as any)} 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Max Guests</label>
              <input 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                placeholder="1" 
                type="number" 
                value={maxGuests as any} 
                onChange={e=>setMaxGuests(e.target.value as any)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Bedrooms</label>
              <input 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                placeholder="1" 
                type="number" 
                value={bedrooms as any} 
                onChange={e=>setBedrooms(e.target.value as any)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Bathrooms</label>
              <input 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                placeholder="1" 
                type="number" 
                value={bathrooms as any} 
                onChange={e=>setBathrooms(e.target.value as any)} 
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Property Type</label>
              <select 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                value={propertyType} 
                onChange={e=>setPropertyType(e.target.value)}
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="cabin">Cabin</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                <input 
                  type="checkbox" 
                  checked={instantBooking} 
                  onChange={e=>setInstantBooking(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" 
                />
                Enable instant booking
              </label>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Initial Rating (0-5)</label>
              <input 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                placeholder="4.5" 
                type="number" 
                step="0.1" 
                min={0} 
                max={5} 
                value={initialRating as any} 
                onChange={e=>setInitialRating(e.target.value as any)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Header Ribbon Text</label>
              <input 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                placeholder="Featured" 
                value={headerRibbonText} 
                onChange={e=>setHeaderRibbonText(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Header Ribbon Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input 
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                  placeholder="0" 
                  type="number" 
                  value={headerRibbonPrice as any} 
                  onChange={e=>setHeaderRibbonPrice(e.target.value as any)} 
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description *</label>
            <textarea 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
              placeholder="Describe your property in detail..." 
              rows={4}
              value={description} 
              onChange={e=>setDescription(e.target.value)} 
            />
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">Amenities</h4>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter amenity (e.g., WiFi, Pool, Parking)"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Selected Amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {amenitiesSel.map((amenity) => (
                    <div
                      key={amenity}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      <span>{amenity}</span>
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="hover:text-blue-900 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {amenitiesSel.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No amenities added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">Property Images *</h4>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <div className="flex flex-wrap gap-4">
                {images.map(url => (
                  <div key={url} className="relative group">
                    <div className="w-32 h-24 rounded-lg overflow-hidden border border-gray-200">
                      <img src={url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setImages(prev => prev.filter(u => u !== url))} 
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-32 h-24 border-2 border-dashed border-purple-200 rounded-lg flex flex-col items-center justify-center text-purple-600 cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">Upload Image</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={async e=>{ 
                      const f=e.target.files?.[0]; 
                      if (!f) return; 
                      try { 
                        const { presignedUrl, url } = await MediaAPI.generatePresigned(f); 
                        await MediaAPI.uploadToPresigned(presignedUrl, f); 
                        setImages(prev => [...prev, url]) 
                      } catch(err:any){ 
                        alert(err?.message || 'Upload failed') 
                      } 
                    }} 
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Nearby Attractions */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">Nearby Attractions</h4>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <div className="flex gap-2 mb-3">
                <input 
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                  placeholder="Add nearby attraction" 
                  value={newAttraction} 
                  onChange={e=>setNewAttraction(e.target.value)} 
                />
                <button 
                  type="button" 
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors" 
                  onClick={()=>{ if(newAttraction.trim()){ setNearbyAttractions(prev=>[...prev, newAttraction.trim()]); setNewAttraction('') } }}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {nearbyAttractions.map((a,i)=> (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-purple-200 rounded-full text-sm">
                    {a} 
                    <button 
                      type="button" 
                      className="text-red-500 hover:text-red-700 ml-1" 
                      onClick={()=>setNearbyAttractions(prev=>prev.filter((_,idx)=>idx!==i))}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Property Videos */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">Property Videos</h4>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <div className="flex gap-2 mb-3">
                <input 
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                  placeholder="https://www.youtube.com/embed/..." 
                  value={newVideo} 
                  onChange={e=>setNewVideo(e.target.value)} 
                />
                <button 
                  type="button" 
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors" 
                  onClick={()=>{ if(newVideo.trim()){ setVideos(prev=>[...prev, newVideo.trim()]); setNewVideo('') } }}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {videos.map((v,i)=> (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-purple-200 rounded-full text-sm">
                    {v.length > 30 ? `${v.substring(0, 30)}...` : v}
                    <button 
                      type="button" 
                      className="text-red-500 hover:text-red-700 ml-1" 
                      onClick={()=>setVideos(prev=>prev.filter((_,idx)=>idx!==i))}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Ranges */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">Seasonal Pricing</h4>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <div className="hidden md:grid grid-cols-4 gap-2 text-xs font-medium text-gray-600 mb-3">
                <div>Category</div><div>Date Range</div><div>Rate ($)</div><div>Min Stay</div>
              </div>
              <div className="space-y-3">
                {pricingRanges.map((r, idx) => (
                  <div key={idx} className="grid md:grid-cols-4 gap-2 items-center p-3 bg-white rounded-lg border border-gray-200">
                    <input 
                      className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                      placeholder="Low/Medium/High" 
                      value={r.category||''} 
                      onChange={e=>updateRange(idx, { category: e.target.value })} 
                    />
                    <div className="flex gap-2">
                      <input 
                        className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                        type="date" 
                        value={r.startDate} 
                        onChange={e=>updateRange(idx, { startDate: e.target.value })} 
                      />
                      <input 
                        className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                        type="date" 
                        value={r.endDate} 
                        onChange={e=>updateRange(idx, { endDate: e.target.value })} 
                      />
                    </div>
                    <input 
                      className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                      placeholder="100" 
                      type="number" 
                      value={r.rate as any} 
                      onChange={e=>updateRange(idx, { rate: e.target.value as any })} 
                    />
                    <div className="flex gap-2 items-center">
                      <input 
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                        placeholder="2" 
                        type="number" 
                        value={r.minStay as any} 
                        onChange={e=>updateRange(idx, { minStay: e.target.value as any })} 
                      />
                      <button 
                        type="button" 
                        className="px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors" 
                        onClick={()=>removeRange(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <button 
                  type="button" 
                  className="px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors" 
                  onClick={addPricingRange}
                >
                  Add Price Range
                </button>
              </div>
            </div>
          </div>

          {/* Submit Section */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-6 border-t border-purple-100">
            <p className="text-sm text-gray-600">New properties require admin approval before going live.</p>
            <button 
              disabled={creating} 
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              {creating ? 'Creating Property...' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
