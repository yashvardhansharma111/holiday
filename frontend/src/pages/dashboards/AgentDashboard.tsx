import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/auth'
import { PropertiesAPI, BookingsAPI, MediaAPI } from '../../lib/api'

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
      setProperties(Array.isArray(list) ? list : (list?.items || []))
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
    <div className="min-h-[70vh] flex">
      <aside className="w-60 border-r bg-white">
        <div className="p-4 font-bold text-lg">Agent</div>
        <nav className="p-2 space-y-1">
          <button
            className={'w-full text-left px-3 py-2 rounded ' + (activeTab === 'my-properties' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100')}
            onClick={() => setActiveTab('my-properties')}
          >My Properties</button>
          <button
            className={'w-full text-left px-3 py-2 rounded ' + (activeTab === 'new-property' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100')}
            onClick={() => setActiveTab('new-property')}
          >Create Property</button>
          <button
            className={'w-full text-left px-3 py-2 rounded ' + (activeTab === 'help' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100')}
            onClick={() => setActiveTab('help')}
          >Help</button>
        </nav>

        {activeTab==='my-properties' && (
          <div className="p-4 space-y-2">
            <h4 className="font-medium">Filters</h4>
            <input className="border rounded w-full px-2 py-1" placeholder="Search" value={filters.search} onChange={e=>setFilters(f=>({...f, search:e.target.value}))} />
            <input className="border rounded w-full px-2 py-1" placeholder="City" value={filters.city} onChange={e=>setFilters(f=>({...f, city:e.target.value}))} />
            <select className="border rounded w-full px-2 py-1" value={filters.status} onChange={e=>setFilters(f=>({...f, status:e.target.value}))}>
              <option value="">Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="LIVE">Live</option>
              <option value="DISABLED">Disabled</option>
            </select>
            <div className="flex gap-2">
              <input className="border rounded w-full px-2 py-1" placeholder="Min Price" type="number" value={filters.minPrice} onChange={e=>setFilters(f=>({...f, minPrice:e.target.value}))} />
              <input className="border rounded w-full px-2 py-1" placeholder="Max Price" type="number" value={filters.maxPrice} onChange={e=>setFilters(f=>({...f, maxPrice:e.target.value}))} />
            </div>
            <div className="flex gap-2">
              <button onClick={loadProps} className="border rounded px-3 py-1 w-full">Refresh</button>
              <button onClick={()=>setFilters({search:'', city:'', status:'', minPrice:'', maxPrice:''})} className="border rounded px-3 py-1 w-full">Reset</button>
            </div>
          </div>
        )}
      </aside>
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Agent Dashboard</h1>
          <button onClick={loadProps} className="text-sm px-3 py-1 border rounded">Reload</button>
        </div>
        {activeTab==='help' && (
          <div className="text-sm text-gray-700">
            Use the filters on the left to narrow your properties. Expand a property to view and confirm pending bookings.
          </div>
        )}
        {activeTab==='new-property' && (
          <CreatePropertyTab onCreated={() => setActiveTab('my-properties')} />
        )}
        {activeTab==='my-properties' && (
          loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
            <div className="space-y-4">
              {filtered.map((p:any) => (
                <AgentPropertyCard key={p.id} prop={p} onChanged={loadProps} />
              ))}
              {filtered.length===0 && <p className="text-sm text-gray-600">No properties found with current filters.</p>}
            </div>
          )
        )}
        <p className="text-xs text-gray-600 mt-4">Welcome {user?.name} ({myRole}). Manage bookings for your properties.</p>
      </main>
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

  return (
    <div className="border rounded p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <div className="flex-1 grid md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="City" value={city} onChange={e=>setCity(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Price" type="number" value={price as any} onChange={e=>setPrice(e.target.value as any)} />
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={instantBooking} onChange={e=>setInstantBooking(e.target.checked)} />
            Instant booking
          </label>
          <div className="text-xs text-gray-600">Status: {prop.status}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="px-3 py-2 rounded bg-purple-600 text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
          <button onClick={remove} disabled={deleting} className="px-3 py-2 rounded border">{deleting ? 'Deleting...' : 'Delete'}</button>
          <button onClick={toggleBookings} className="px-3 py-2 rounded border">{openBookings ? 'Hide' : 'View'} bookings</button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-2">Images</h4>
        <div className="flex flex-wrap gap-3">
          {media?.map((m:any) => (
            <div key={m.url} className="w-32">
              <img src={m.url} className="w-32 h-20 object-cover rounded" />
              <button onClick={() => deleteImage(m.url)} className="w-full mt-1 text-xs border rounded px-2 py-1">Delete</button>
            </div>
          ))}
          <label className="w-32 h-20 border-dashed border rounded flex items-center justify-center text-xs cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if (f) onUpload(f) }} />
            + Upload
          </label>
        </div>
      </div>

      {openBookings && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium mb-2">Bookings</h4>
          <div className="grid gap-3">
            {(bookingsList || []).map((b:any) => (
              <div key={b.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{b.user?.name || 'Guest'} • {b.guests} guests</div>
                  <div className="text-sm text-gray-600">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()} • {b.nights} nights • {b.status}</div>
                </div>
                <div className="flex items-center gap-2">
                  {b.status === 'PENDING' && (
                    <button disabled={busy===b.id} onClick={() => confirmBooking(b.id)} className="px-3 py-1 text-sm border rounded">
                      {busy===b.id? 'Confirming...' : 'Confirm'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {(!bookingsList || bookingsList.length===0) && <p className="text-sm text-gray-600">No bookings yet.</p>}
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
    <div>
      <h2 className="text-xl font-semibold mb-4">Create Property</h2>
      <form className="grid md:grid-cols-2 gap-3 max-w-3xl" onSubmit={submit}>
        <input className="border rounded px-3 py-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="Location (e.g., neighborhood or area)" value={location} onChange={e=>setLocation(e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="City" value={city} onChange={e=>setCity(e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Price per night" type="number" value={price as any} onChange={e=>setPrice(e.target.value as any)} required />
        <input className="border rounded px-3 py-2" placeholder="Max Guests" type="number" value={maxGuests as any} onChange={e=>setMaxGuests(e.target.value as any)} />
        <input className="border rounded px-3 py-2" placeholder="Bedrooms" type="number" value={bedrooms as any} onChange={e=>setBedrooms(e.target.value as any)} />
        <input className="border rounded px-3 py-2" placeholder="Bathrooms" type="number" value={bathrooms as any} onChange={e=>setBathrooms(e.target.value as any)} />
        <select className="border rounded px-3 py-2" value={propertyType} onChange={e=>setPropertyType(e.target.value)}>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="cabin">Cabin</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={instantBooking} onChange={e=>setInstantBooking(e.target.checked)} />
          Instant booking
        </label>
        <input className="border rounded px-3 py-2" placeholder="Initial Rating (0-5)" type="number" step="0.1" min={0} max={5} value={initialRating as any} onChange={e=>setInitialRating(e.target.value as any)} />
        <input className="border rounded px-3 py-2" placeholder="Header Ribbon Text" value={headerRibbonText} onChange={e=>setHeaderRibbonText(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Header Ribbon Price" type="number" value={headerRibbonPrice as any} onChange={e=>setHeaderRibbonPrice(e.target.value as any)} />
        <textarea className="md:col-span-2 border rounded px-3 py-2" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <div className="md:col-span-2">
          <h4 className="font-medium mb-2">Amenities</h4>
          <div className="grid grid-cols-2 gap-2">
            {amenityOptions.map(opt => (
              <label key={opt} className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={amenitiesSel.includes(opt)} onChange={(e)=>{
                  setAmenitiesSel(prev => e.target.checked ? [...prev, opt] : prev.filter(x=>x!==opt))
                }} />
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
        {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
        <div className="md:col-span-2">
          <button disabled={creating} className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-60">{creating ? 'Creating...' : 'Create Property'}</button>
        </div>
      </form>
      <p className="text-xs text-gray-600 mt-3">New properties require admin approval before going live.</p>
    </div>
  )
}
