import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/auth'
import { MediaAPI, PropertiesAPI, BookingsAPI } from '../../lib/api'
import { 
  Home, 
  Plus, 
  Calendar,
  RefreshCw,
  Check,
  X,
  Upload,
  Trash2,
  Edit3,
  MapPin,
  Users,
  Star
} from 'lucide-react'

type TabKey = 'my-properties' | 'new-property' | 'bookings'

export default function OwnerDashboard() {
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role !== 'OWNER') {
      location.hash = '#/dashboard'
    }
  }, [user?.role])

  if (user?.role !== 'OWNER') return null

  return <OwnerContent />
}

function OwnerContent() {
  const [active, setActive] = useState<TabKey>('my-properties')
  const tabs: { key: TabKey; label: string }[] = useMemo(() => ([
    { key: 'my-properties', label: 'My Properties' },
    { key: 'bookings', label: 'Bookings' },
    { key: 'new-property', label: 'Create Property' },
  ]), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-14">
      {/* Sidebar */}
      <aside className="fixed left-0 top-14 h-[calc(100%-56px)] w-72 bg-white border-r border-purple-100 shadow-2xl z-30">
        {/* Header */}
        <div className="relative p-6 border-b border-purple-100 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Owner Panel</h1>
              <p className="text-purple-100 text-sm">Property Management</p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-1 top-4 w-8 h-8 bg-white/10 rounded-full blur-sm"></div>
          <div className="absolute right-4 bottom-2 w-4 h-4 bg-purple-300/30 rounded-full"></div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {tabs.map(t => {
            const Icon = t.key === 'my-properties' ? Home : t.key === 'bookings' ? Calendar : Plus
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
      </aside>
      {/* Main Content */}
      <main className="ml-72 p-6">
        <div className="max-w-7xl mx-auto">
          {active === 'my-properties' && <MyPropertiesTab />}
          {active === 'new-property' && <CreatePropertyTab onCreated={() => setActive('my-properties')} />}
          {active === 'bookings' && <OwnerBookingsTab />}
        </div>
      </main>
    </div>
  )
}

function MyPropertiesTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const resp = await PropertiesAPI.myProperties()
      setItems(Array.isArray(resp) ? resp : (resp?.data || []))
    } catch (e:any) { setError(e?.message || 'Failed to load properties') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const remove = async (id: number) => {
    if (!confirm('Delete this property?')) return
    try { await PropertiesAPI.remove(id); await load() } catch (e:any) { alert(e?.message || 'Delete failed') }
  }

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
            onClick={load} 
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
          {items.map((p:any) => (
            <PropertyCard key={p.id} prop={p} onChanged={load} onDelete={() => remove(p.id)} />
          ))}
          {items.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4">
                <Home className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-gray-600 text-lg mb-2">No properties yet</p>
              <p className="text-gray-500">Create your first property to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PropertyCard({ prop, onChanged, onDelete }: { prop: any; onChanged: () => void; onDelete: () => void }) {
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(prop.title || '')
  const [price, setPrice] = useState<number | ''>(prop.price || '')
  const [city, setCity] = useState(prop.city || '')
  const [country, setCountry] = useState(prop.country || '')
  const [instantBooking, setInstantBooking] = useState(!!prop.instantBooking)
  const [media, setMedia] = useState<any[]>(prop.media || [])
  const [openBookings, setOpenBookings] = useState(false)
  const [bookings, setBookings] = useState<any[] | null>(null)
  const [busy, setBusy] = useState<number | null>(null)

  const save = async () => {
    setSaving(true)
    try {
      await PropertiesAPI.update(prop.id, { title, price: Number(price), city, country, instantBooking })
      onChanged()
    } catch (e:any) { alert(e?.message || 'Save failed') }
    finally { setSaving(false) }
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
      setBookings(list)
    } catch (e:any) { alert(e?.message || 'Failed to load bookings') }
  }

  const toggleBookings = async () => {
    const next = !openBookings
    setOpenBookings(next)
    if (next && bookings == null) await loadBookings()
  }

  const confirmBooking = async (bookingId: number) => {
    setBusy(bookingId)
    try {
      await BookingsAPI.confirm(bookingId)
      await loadBookings()
    } catch (e:any) { alert(e?.message || 'Failed to confirm booking') }
    finally { setBusy(null) }
  }

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
        
        <div className="flex items-center gap-4 mb-6">
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
            onClick={onDelete}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
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
            {(bookings || []).map((b:any) => (
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
            {(!bookings || bookings.length===0) && (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No bookings yet</p>
              </div>
            )}
          </div>
        </div>
      )}
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
  const amenityOptions = ['Bedroom - Wifi', 'Linens are provided', '1 Queen Bed', 'Sleeps:10', 'Twin/single - Child -Baby', 'Air Conditioning']
  const [amenitiesSel, setAmenitiesSel] = useState<string[]>([])
  const [nearbyAttractions, setNearbyAttractions] = useState<string[]>([])
  const [newAttraction, setNewAttraction] = useState('')
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
      // Basic client-side validation to match backend schema
      if (title.trim().length < 5) throw new Error('Title must be at least 5 characters')
      if (description.trim().length < 20) throw new Error('Description must be at least 20 characters')
      if (location.trim().length < 5) throw new Error('Location must be at least 5 characters')
      if (address.trim().length < 10) throw new Error('Address must be at least 10 characters')
      if (images.length < 1) throw new Error('Please upload at least one image')
      // Normalize pricing ranges
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
        headerRibbonPrice: headerRibbonPrice === '' ? undefined : Number(headerRibbonPrice),
        nearbyAttractions: nearbyAttractions.length ? nearbyAttractions : undefined,
        videos: videos.length ? videos : undefined,
        pricingRanges: pr.length ? pr : undefined,
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
        <form className="grid md:grid-cols-2 gap-4 max-w-4xl" onSubmit={submit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Property Title *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" placeholder="Enter property title" value={title} onChange={e=>setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Location *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" placeholder="Neighborhood or area" value={location} onChange={e=>setLocation(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">City *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" placeholder="City" value={city} onChange={e=>setCity(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Country *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" placeholder="Full address" value={address} onChange={e=>setAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Price per night *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" placeholder="0" type="number" value={price as any} onChange={e=>setPrice(e.target.value as any)} required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Max Guests</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" placeholder="Number of guests" type="number" value={maxGuests as any} onChange={e=>setMaxGuests(e.target.value as any)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Bedrooms</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" placeholder="Number of bedrooms" type="number" value={bedrooms as any} onChange={e=>setBedrooms(e.target.value as any)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Bathrooms</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" placeholder="Number of bathrooms" type="number" value={bathrooms as any} onChange={e=>setBathrooms(e.target.value as any)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Property Type</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" value={propertyType} onChange={e=>setPropertyType(e.target.value)}>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="cabin">Cabin</option>
          </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Initial Rating</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" placeholder="0-5 stars" type="number" step="0.1" min={0} max={5} value={initialRating as any} onChange={e=>setInitialRating(e.target.value as any)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Header Ribbon Text</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" placeholder="Special offer text" value={headerRibbonText} onChange={e=>setHeaderRibbonText(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Header Ribbon Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" placeholder="Special price" type="number" value={headerRibbonPrice as any} onChange={e=>setHeaderRibbonPrice(e.target.value as any)} />
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Description *</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" rows={4} placeholder="Describe your property..." value={description} onChange={e=>setDescription(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={instantBooking} onChange={e=>setInstantBooking(e.target.checked)} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
              Enable instant booking
            </label>
          </div>
          <div className="md:col-span-2 bg-purple-50 border border-purple-100 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-600" />
              Amenities
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenityOptions.map(opt => (
                <label key={opt} className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={amenitiesSel.includes(opt)} onChange={(e)=>{
                    setAmenitiesSel(prev => e.target.checked ? [...prev, opt] : prev.filter(x=>x!==opt))
                  }} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        <div className="md:col-span-2">
          <h4 className="font-medium mb-2">Images (at least 1)</h4>
          <div className="flex flex-wrap gap-3">
            {images.map(url => (
              <div key={url} className="w-32">
                <img src={url} className="w-32 h-20 object-cover rounded" />
                <button type="button" onClick={() => setImages(prev => prev.filter(u => u !== url))} className="w-full mt-1 text-xs border rounded px-2 py-1">Remove</button>
              </div>
            ))}
            <label className="w-32 h-20 border-dashed border rounded flex items-center justify-center text-xs cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={async e=>{ const f=e.target.files?.[0]; if (!f) return; try { const { presignedUrl, url } = await MediaAPI.generatePresigned(f); await MediaAPI.uploadToPresigned(presignedUrl, f); setImages(prev => [...prev, url]) } catch(err:any){ alert(err?.message || 'Upload failed') } }} />
              + Upload
            </label>
          </div>
        </div>
        <div className="md:col-span-2">
          <h4 className="font-medium mb-2">Nearby Attractions</h4>
          <div className="flex gap-2 mb-2">
            <input className="border rounded px-3 py-2 flex-1" placeholder="Add attraction" value={newAttraction} onChange={e=>setNewAttraction(e.target.value)} />
            <button type="button" className="border rounded px-3" onClick={()=>{ if(newAttraction.trim()){ setNearbyAttractions(prev=>[...prev, newAttraction.trim()]); setNewAttraction('') } }}>Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {nearbyAttractions.map((a,i)=> (
              <span key={i} className="text-xs border rounded px-2 py-1">{a} <button type="button" className="ml-1" onClick={()=>setNearbyAttractions(prev=>prev.filter((_,idx)=>idx!==i))}>×</button></span>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <h4 className="font-medium mb-2">Property Videos (YouTube embed URLs)</h4>
          <div className="flex gap-2 mb-2">
            <input className="border rounded px-3 py-2 flex-1" placeholder="https://www.youtube.com/embed/..." value={newVideo} onChange={e=>setNewVideo(e.target.value)} />
            <button type="button" className="border rounded px-3" onClick={()=>{ if(newVideo.trim()){ setVideos(prev=>[...prev, newVideo.trim()]); setNewVideo('') } }}>Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {videos.map((v,i)=> (
              <span key={i} className="text-xs border rounded px-2 py-1">{v} <button type="button" className="ml-1" onClick={()=>setVideos(prev=>prev.filter((_,idx)=>idx!==i))}>×</button></span>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <h4 className="font-medium mb-2">Pricing (Date Ranges)</h4>
          <div className="hidden md:grid grid-cols-4 gap-2 text-xs text-gray-600 mb-1">
            <div>Category</div><div>Date Range</div><div>Rate</div><div>Min Stay</div>
          </div>
          <div className="space-y-2">
            {pricingRanges.map((r, idx) => (
              <div key={idx} className="grid md:grid-cols-4 gap-2 items-center">
                <input className="border rounded px-2 py-1" placeholder="Low/Medium/High" value={r.category||''} onChange={e=>updateRange(idx, { category: e.target.value })} />
                <div className="flex gap-2">
                  <input className="border rounded px-2 py-1" type="date" value={r.startDate} onChange={e=>updateRange(idx, { startDate: e.target.value })} />
                  <input className="border rounded px-2 py-1" type="date" value={r.endDate} onChange={e=>updateRange(idx, { endDate: e.target.value })} />
                </div>
                <input className="border rounded px-2 py-1" placeholder="e.g. 100" type="number" value={r.rate as any} onChange={e=>updateRange(idx, { rate: e.target.value as any })} />
                <div className="flex gap-2 items-center">
                  <input className="border rounded px-2 py-1 flex-1" placeholder="e.g. 2" type="number" value={r.minStay as any} onChange={e=>updateRange(idx, { minStay: e.target.value as any })} />
                  <button type="button" className="text-red-600 text-xs border rounded px-2 py-1" onClick={()=>removeRange(idx)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <button type="button" className="border rounded px-3 py-1 text-sm" onClick={addPricingRange}>Add Price Range</button>
          </div>
        </div>
          {error && (
            <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}
          <div className="md:col-span-2 pt-4 border-t border-gray-100">
            <button 
              disabled={creating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              {creating ? 'Creating Property...' : 'Create Property'}
            </button>
          </div>
        </form>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">💡 New properties require admin approval before going live.</p>
        </div>
      </div>
    </div>
  )
}

function OwnerBookingsTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [busy, setBusy] = useState<number | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const resp = await BookingsAPI.ownerAggregated()
      const list = Array.isArray(resp?.bookings) ? resp.bookings : (Array.isArray(resp) ? resp : [])
      setItems(list)
    } catch (e:any) {
      setError(e?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const confirmBooking = async (id: number) => {
    setBusy(id)
    try {
      await BookingsAPI.confirm(id)
      await load()
    } catch (e:any) { alert(e?.message || 'Failed to confirm booking') }
    finally { setBusy(null) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Bookings</h2>
              <p className="text-purple-600">Manage bookings across all properties</p>
            </div>
          </div>
          <button 
            onClick={load} 
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
        <div className="space-y-4">
          {items.map((b:any) => (
            <div key={b.id} className="bg-white border border-purple-100 rounded-xl shadow-sm hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">{b.user?.name || 'Guest'} • {b.guests} guests</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()} • {b.nights} nights
                    </div>
                    <div className="text-sm font-medium text-gray-700 mt-1">Property: {b.property?.title}</div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                      b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 border border-green-200' :
                      b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {b.status === 'CONFIRMED' && <Check className="w-3 h-3" />}
                      {b.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {b.status === 'PENDING' && (
                    <button 
                      disabled={busy===b.id} 
                      onClick={() => confirmBooking(b.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      {busy===b.id? 'Confirming...' : 'Confirm Booking'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-gray-600 text-lg mb-2">No bookings yet</p>
              <p className="text-gray-500">Bookings will appear here when guests make reservations</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
