import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/auth'
import { BookingsAPI, PublicPropertiesAPI, ReviewsAPI } from '../../lib/api'

export default function UserDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'browse'|'bookings'|'payments'|'reviews'|'profile'>('browse')

  // Bookings state
  const [loadingB, setLoadingB] = useState(false)
  const [errorB, setErrorB] = useState<string|null>(null)
  const [bookings, setBookings] = useState<any[]>([])

  const loadBookings = async () => {
    setLoadingB(true)
    setErrorB(null)
    try {
      const resp = await BookingsAPI.myBookings()
      const items = Array.isArray(resp?.bookings) ? resp.bookings : (Array.isArray(resp)? resp: [])
      setBookings(items)
    } catch (e:any) { setErrorB(e?.message || 'Failed to load') }
    finally { setLoadingB(false) }
  }

  useEffect(() => { if (activeTab==='bookings') loadBookings() }, [activeTab])

  const cancel = async (id:number) => {
    if (!confirm('Cancel this booking?')) return
    try {
      await BookingsAPI.cancel(id)
      await loadBookings()
    } catch(e:any){ alert(e?.message || 'Failed to cancel') }
  }

  // Browse properties state
  const [propsLoading, setPropsLoading] = useState(false)
  const [propsError, setPropsError] = useState<string|null>(null)
  const [propsList, setPropsList] = useState<any[]>([])
  const [filters, setFilters] = useState({ search:'', city:'', country:'', minPrice:'', maxPrice:'', guests:'', bedrooms:'', bathrooms:'', sort:'', minRating:'' })
  const [query, setQuery] = useState('')
  const [popularCities, setPopularCities] = useState<any[]>([])

  const loadProps = async () => {
    setPropsLoading(true)
    setPropsError(null)
    try {
      const params:any = {}
      Object.entries(filters).forEach(([k,v])=>{ if(String(v).trim()!=='') params[k]=v })
      const resp = await PublicPropertiesAPI.list(params)
      const items = Array.isArray(resp?.properties) ? resp.properties : (Array.isArray(resp)? resp: (resp?.data||[]))
      setPropsList(items)
    } catch (e:any) { setPropsError(e?.message || 'Failed to load properties') }
    finally { setPropsLoading(false) }
  }

  useEffect(() => { if (activeTab==='browse') loadProps() }, [activeTab])
  useEffect(() => {
    let ignore = false
    async function loadCities(){
      try {
        const data = await PublicPropertiesAPI.popularCities()
        if (!ignore) setPopularCities(Array.isArray(data)? data: (data?.data||[]))
      } catch(_) {}
    }
    if (activeTab==='browse') loadCities()
    return ()=>{ ignore = true }
  }, [activeTab])

  // Unified search: accepts "city, country" or keywords; Enter applies
  const applyUnifiedSearch = () => {
    const q = query.trim()
    if (!q) return setFilters(f=>({ ...f, search:'', city:'', country:'' }))
    if (q.includes(',')) {
      const [c, co] = q.split(',')
      setFilters(f=>({ ...f, city: (c||'').trim(), country: (co||'').trim(), search:'' }))
    } else {
      setFilters(f=>({ ...f, search: q }))
    }
    setTimeout(loadProps, 0)
  }

  // Safe media url extractor
  const firstImage = (p:any) => {
    if (typeof p?.coverImageUrl === 'string' && p.coverImageUrl.trim()) return p.coverImageUrl
    const media = Array.isArray(p?.media) ? p.media : []
    for (const m of media) {
      if (typeof m === 'string' && m.trim()) return m
      if (m && typeof m === 'object') {
        const u = m.url || m.src || m.image
        if (typeof u === 'string' && u.trim()) return u
      }
    }
    return ''
  }

  // Reviews tab state
  const [rLoading, setRLoading] = useState(false)
  const [rError, setRError] = useState<string|null>(null)
  const [myReviews, setMyReviews] = useState<any[]>([])
  const loadMyReviews = async () => {
    setRLoading(true); setRError(null)
    try {
      const resp = await ReviewsAPI.myReviews({ page:1, limit:20 })
      const items = Array.isArray(resp?.reviews)? resp.reviews : (Array.isArray(resp)? resp : [])
      setMyReviews(items)
    } catch(e:any){ setRError(e?.message || 'Failed to load reviews') }
    finally{ setRLoading(false) }
  }
  useEffect(()=>{ if (activeTab==='reviews') loadMyReviews() }, [activeTab])

  // Payments tab derived from bookings list (fallback)
  const payments = useMemo(() => {
    return bookings.map((b:any)=>({
      id: b.id,
      propertyTitle: b.property?.title || 'Property',
      amount: b.totalAmount ?? b.amount ?? 0,
      currency: 'USD',
      status: b.paymentStatus || 'PENDING',
      date: b.updatedAt || b.createdAt,
    }))
  }, [bookings])

  // Derived booking status summary for sidebar
  const bookingSummary = useMemo(() => {
    const acc: Record<string, number> = {}
    for (const b of bookings) {
      const s = String(b.status || 'UNKNOWN').toUpperCase()
      acc[s] = (acc[s]||0)+1
    }
    return acc
  }, [bookings])

  return (
    <div className="flex min-h-screen pt-16">
      <aside className="w-72 border-r p-4 space-y-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-auto">
        <div className="space-y-2">
          <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='browse'?'bg-gray-100':''}`} onClick={()=>setActiveTab('browse')}>Browse</button>
          <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='bookings'?'bg-gray-100':''}`} onClick={()=>setActiveTab('bookings')}>My Bookings</button>
          <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='payments'?'bg-gray-100':''}`} onClick={()=>setActiveTab('payments')}>Payments</button>
          <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='reviews'?'bg-gray-100':''}`} onClick={()=>setActiveTab('reviews')}>My Reviews</button>
          <button className={`w-full text-left px-3 py-2 rounded ${activeTab==='profile'?'bg-gray-100':''}`} onClick={()=>setActiveTab('profile')}>Profile</button>
        </div>
        {/* Booking responses & status summary */}
        <div className="border rounded p-3">
          <div className="font-medium mb-2">Booking Status</div>
          <div className="space-y-1 text-sm">
            {Object.keys(bookingSummary).length===0 && <div className="text-gray-500">No bookings yet.</div>}
            {Object.entries(bookingSummary).map(([k,v])=> (
              <div key={k} className="flex items-center justify-between">
                <span className="uppercase text-gray-600">{k}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Recent bookings */}
        {bookings.length>0 && (
          <div className="border rounded p-3">
            <div className="font-medium mb-2">Recent Bookings</div>
            <div className="space-y-2 text-sm">
              {bookings.slice(0,5).map((b:any)=> (
                <div key={b.id} className="flex items-start justify-between">
                  <div className="truncate pr-2">
                    <div className="truncate max-w-[9rem]">{b.property?.title || 'Property'}</div>
                    <div className="text-gray-500">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</div>
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded border self-start">{b.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab==='browse' && (
          <div className="space-y-2">
            <h4 className="font-medium">Filters</h4>
            <input className="border rounded w-full px-2 py-1" placeholder="Search" value={filters.search} onChange={e=>setFilters(f=>({...f, search:e.target.value}))} />
            <input className="border rounded w-full px-2 py-1" placeholder="City" value={filters.city} onChange={e=>setFilters(f=>({...f, city:e.target.value}))} />
            <input className="border rounded w-full px-2 py-1" placeholder="Country" value={filters.country} onChange={e=>setFilters(f=>({...f, country:e.target.value}))} />
            <div className="flex gap-2">
              <input className="border rounded w-full px-2 py-1" placeholder="Min Price" type="number" value={filters.minPrice} onChange={e=>setFilters(f=>({...f, minPrice:e.target.value}))} />
              <input className="border rounded w-full px-2 py-1" placeholder="Max Price" type="number" value={filters.maxPrice} onChange={e=>setFilters(f=>({...f, maxPrice:e.target.value}))} />
            </div>
            <div className="flex gap-2">
              <input className="border rounded w-full px-2 py-1" placeholder="Guests" type="number" value={filters.guests} onChange={e=>setFilters(f=>({...f, guests:e.target.value}))} />
              <input className="border rounded w-full px-2 py-1" placeholder="Bedrooms" type="number" value={filters.bedrooms} onChange={e=>setFilters(f=>({...f, bedrooms:e.target.value}))} />
              <input className="border rounded w-full px-2 py-1" placeholder="Bathrooms" type="number" value={filters.bathrooms} onChange={e=>setFilters(f=>({...f, bathrooms:e.target.value}))} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Min Rating</label>
              <select className="border rounded w-full px-2 py-1" value={filters.minRating} onChange={e=>setFilters(f=>({...f, minRating:e.target.value}))}>
                <option value="">Any</option>
                <option value="4">4+ stars</option>
                <option value="3">3+ stars</option>
                <option value="2">2+ stars</option>
                <option value="1">1+ stars</option>
              </select>
            </div>
            <select className="border rounded w-full px-2 py-1" value={filters.sort} onChange={e=>setFilters(f=>({...f, sort:e.target.value}))}>
              <option value="">Sort</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
            <div className="flex gap-2">
              <button onClick={loadProps} className="border rounded px-3 py-1 w-full">Apply</button>
              <button onClick={()=>{setFilters({search:'',city:'',country:'',minPrice:'',maxPrice:'',guests:'',bedrooms:'',bathrooms:'',sort:'', minRating:''}); setTimeout(loadProps,0)}} className="border rounded px-3 py-1 w-full">Reset</button>
            </div>
            {/* Popular Cities quick filter */}
            {popularCities.length>0 && (
              <div className="pt-2">
                <h5 className="text-sm font-medium mb-1">Popular Cities</h5>
                <div className="flex flex-wrap gap-2">
                  {popularCities.map((c:any)=> (
                    <button key={c.id} className="text-xs border rounded px-2 py-1 hover:bg-gray-50" onClick={()=>{ setFilters(f=>({ ...f, city:c.name, country:c.country })); setTimeout(loadProps,0) }}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
      <main className="flex-1 p-4 min-h-[calc(100vh-3.5rem)]">
        {/* Mobile top tabs */}
        <div className="md:hidden mb-3 flex gap-2 flex-wrap">
          <button className={`px-3 py-1 border rounded ${activeTab==='browse'?'bg-gray-100':''}`} onClick={()=>setActiveTab('browse')}>Browse</button>
          <button className={`px-3 py-1 border rounded ${activeTab==='bookings'?'bg-gray-100':''}`} onClick={()=>setActiveTab('bookings')}>Bookings</button>
          <button className={`px-3 py-1 border rounded ${activeTab==='payments'?'bg-gray-100':''}`} onClick={()=>setActiveTab('payments')}>Payments</button>
          <button className={`px-3 py-1 border rounded ${activeTab==='reviews'?'bg-gray-100':''}`} onClick={()=>setActiveTab('reviews')}>Reviews</button>
          <button className={`px-3 py-1 border rounded ${activeTab==='profile'?'bg-gray-100':''}`} onClick={()=>setActiveTab('profile')}>Profile</button>
        </div>
        {activeTab==='browse' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Browse Properties</h2>
              <button onClick={loadProps} className="border rounded px-3 py-1">Refresh</button>
            </div>
            {/* Unified search bar */}
            <div className="mb-4 flex gap-2">
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Search e.g. 'Mumbai, India' or 'Beach cottage'"
                value={query}
                onChange={e=>setQuery(e.target.value)}
                onKeyDown={(e)=>{ if (e.key==='Enter') applyUnifiedSearch() }}
              />
              <button onClick={applyUnifiedSearch} className="border rounded px-3 py-2">Search</button>
            </div>
            {propsLoading && <p>Loading...</p>}
            {propsError && <p className="text-red-600 text-sm">{propsError}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {propsList.map((p:any) => (
                <div key={p.id} className="border rounded overflow-hidden">
                  { (() => { const src = firstImage(p); return src ? <img src={src} className="w-full h-36 object-cover" /> : null })() }
                  <div className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate pr-2">{p.title}</div>
                      {p.instantBooking && <span className="text-[10px] px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">Instant</span>}
                    </div>
                    <div className="text-sm text-gray-600">{p.city}, {p.country}</div>
                    {/* Rating */}
                    {(() => {
                      const avg = Number(p.averageRating ?? p.avgRating ?? p.rating ?? p.reviewsAvg ?? 0)
                      const count = Number(p.reviewsCount ?? p.reviewCount ?? p.reviews?.length ?? 0)
                      return (
                        <div className="text-xs text-gray-700">
                          <span className="mr-1">⭐ {avg ? avg.toFixed(1) : 'N/A'}</span>
                          {count>0 && <span className="text-gray-500">({count})</span>}
                        </div>
                      )
                    })()}
                    {/* Attributes */}
                    <div className="text-xs text-gray-600 flex gap-3">
                      {p.bedrooms!=null && <span>{p.bedrooms} bd</span>}
                      {p.bathrooms!=null && <span>{p.bathrooms} ba</span>}
                      {p.guests!=null && <span>{p.guests} guests</span>}
                    </div>
                    <div className="mt-1 font-semibold">${p.price} <span className="font-normal text-gray-600">/ night</span></div>
                    <a href={`#/properties/${p.id}`} className="inline-block mt-2 text-sm px-3 py-1 border rounded">View details & reviews</a>
                  </div>
                </div>
              ))}
            </div>
            {!propsLoading && propsList.length===0 && <p className="text-sm text-gray-600">No properties found.</p>}
          </div>
        )}

        {activeTab==='bookings' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">My Bookings</h2>
              <div className="flex gap-2">
                <button onClick={loadBookings} className="border rounded px-3 py-1">Refresh</button>
              </div>
            </div>
            {loadingB && <p>Loading...</p>}
            {errorB && <p className="text-red-600 text-sm">{errorB}</p>}
            {(!loadingB && bookings.length === 0) && <p className="text-sm text-gray-600">No bookings yet.
              <br/>Browse properties to create bookings.</p>}
            <div className="grid gap-3">
              {bookings.map((b:any) => (
                <div key={b.id} className="border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{b.property?.title || 'Property'} • {b.guests} guests</div>
                    <div className="text-sm text-gray-600">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()} • {b.nights} nights • {b.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(b.status==='PENDING' || b.status==='CONFIRMED') && (
                      <button onClick={()=>cancel(b.id)} className="px-3 py-1 text-sm border rounded">Cancel</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab==='payments' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Payments</h2>
              <button onClick={loadBookings} className="border rounded px-3 py-1">Refresh</button>
            </div>
            {loadingB && <p>Loading...</p>}
            {errorB && <p className="text-red-600 text-sm">{errorB}</p>}
            <div className="grid gap-3">
              {payments.map((p:any)=> (
                <div key={p.id} className="border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.propertyTitle}</div>
                    <div className="text-sm text-gray-600">{new Date(p.date).toLocaleDateString()} • {p.status}</div>
                  </div>
                  <div className="font-semibold">{p.currency} {p.amount}</div>
                </div>
              ))}
            </div>
            {!loadingB && payments.length===0 && <p className="text-sm text-gray-600">No payments yet.</p>}
          </div>
        )}

        {activeTab==='reviews' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">My Reviews</h2>
              <button onClick={loadMyReviews} className="border rounded px-3 py-1">Refresh</button>
            </div>
            {rLoading && <p>Loading...</p>}
            {rError && <p className="text-red-600 text-sm">{rError}</p>}
            <div className="grid gap-3">
              {myReviews.map((r:any)=>(
                <div key={r.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.property?.title || `Property #${r.propertyId}`}</div>
                    <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-gray-800 mt-1">Rating: {r.rating} {r.isVerified ? <span className="ml-2 text-green-700 bg-green-50 border border-green-200 rounded px-2 py-0.5 text-xs">Verified</span> : null}</div>
                  {r.comment && <div className="text-gray-700 mt-2 whitespace-pre-wrap">{r.comment}</div>}
                </div>
              ))}
            </div>
            {!rLoading && myReviews.length===0 && <p className="text-sm text-gray-600">You haven't written any reviews yet.</p>}
          </div>
        )}

        {activeTab==='profile' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Profile</h2>
            <div className="border rounded p-4 max-w-md">
              <div className="mb-2"><span className="text-gray-600">Name:</span> {user?.name}</div>
              <div className="mb-2"><span className="text-gray-600">Email:</span> {user?.email}</div>
              <div className="mb-2"><span className="text-gray-600">Role:</span> {user?.role}</div>
            </div>
          </div>
        )}
      </main>
      <div className="hidden md:block p-4 text-xs text-gray-600">Welcome {user?.name}. Use the sidebar to browse properties or manage your bookings.</div>
    </div>
  )
}
