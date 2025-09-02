import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/auth'
import { BookingsAPI, PublicPropertiesAPI, ReviewsAPI } from '../../lib/api'
import { 
  Search, 
  Calendar, 
  CreditCard, 
  Star, 
  User, 
  Home, 
  Filter, 
  RefreshCw, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Eye,
  X,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-14">
      {/* Sidebar */}
      <aside className="fixed left-0 top-14 h-[calc(100%-56px)] w-72 bg-white border-r border-purple-100 shadow-2xl z-30">
        {/* Header */}
        <div className="relative p-6 border-b border-purple-100 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">User Dashboard</h1>
              <p className="text-purple-100 text-sm">Welcome, {user?.name}</p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-1 top-4 w-8 h-8 bg-white/10 rounded-full blur-sm"></div>
          <div className="absolute right-4 bottom-2 w-4 h-4 bg-purple-300/30 rounded-full"></div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {[
            { key: 'browse', label: 'Browse Properties', icon: Search },
            { key: 'bookings', label: 'My Bookings', icon: Calendar },
            { key: 'payments', label: 'Payments', icon: CreditCard },
            { key: 'reviews', label: 'My Reviews', icon: Star },
            { key: 'profile', label: 'Profile', icon: User }
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
        {/* Booking Status Summary */}
        <div className="p-4">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Booking Status
            </h4>
            <div className="space-y-2">
              {Object.keys(bookingSummary).length===0 && (
                <div className="text-center py-4">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No bookings yet</p>
                </div>
              )}
              {Object.entries(bookingSummary).map(([k,v])=> (
                <div key={k} className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2">
                    {k === 'CONFIRMED' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {k === 'PENDING' && <Clock className="w-4 h-4 text-yellow-500" />}
                    {k === 'CANCELLED' && <X className="w-4 h-4 text-red-500" />}
                    {!['CONFIRMED', 'PENDING', 'CANCELLED'].includes(k) && <AlertCircle className="w-4 h-4 text-gray-500" />}
                    <span className="text-sm font-medium text-gray-700">{k.toLowerCase()}</span>
                  </div>
                  <span className="font-semibold text-purple-600">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        {bookings.length > 0 && (
          <div className="p-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <h4 className="font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Bookings
              </h4>
              <div className="space-y-3">
                {bookings.slice(0,3).map((b:any)=> (
                  <div key={b.id} className="p-3 bg-white rounded-lg border border-indigo-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{b.property?.title || 'Property'}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                        b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Filters Section (only for Browse tab) */}
        {activeTab === 'browse' && (
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
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                    placeholder="City" 
                    value={filters.city} 
                    onChange={e=>setFilters(f=>({...f, city:e.target.value}))} 
                  />
                </div>
                <input 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                  placeholder="Country" 
                  value={filters.country} 
                  onChange={e=>setFilters(f=>({...f, country:e.target.value}))} 
                />
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
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                      placeholder="Guests" 
                      type="number" 
                      value={filters.guests} 
                      onChange={e=>setFilters(f=>({...f, guests:e.target.value}))} 
                    />
                  </div>
                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                      placeholder="Beds" 
                      type="number" 
                      value={filters.bedrooms} 
                      onChange={e=>setFilters(f=>({...f, bedrooms:e.target.value}))} 
                    />
                  </div>
                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                      placeholder="Baths" 
                      type="number" 
                      value={filters.bathrooms} 
                      onChange={e=>setFilters(f=>({...f, bathrooms:e.target.value}))} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Min Rating</label>
                  <select 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                    value={filters.minRating} 
                    onChange={e=>setFilters(f=>({...f, minRating:e.target.value}))}
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ stars</option>
                    <option value="3">3+ stars</option>
                    <option value="2">2+ stars</option>
                    <option value="1">1+ stars</option>
                  </select>
                </div>
                <select 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors" 
                  value={filters.sort} 
                  onChange={e=>setFilters(f=>({...f, sort:e.target.value}))}
                >
                  <option value="">Sort by</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    onClick={loadProps} 
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Apply
                  </button>
                  <button 
                    onClick={()=>{setFilters({search:'',city:'',country:'',minPrice:'',maxPrice:'',guests:'',bedrooms:'',bathrooms:'',sort:'', minRating:''}); setTimeout(loadProps,0)}} 
                    className="px-3 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Popular Cities */}
            {popularCities.length > 0 && (
              <div className="mt-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-indigo-700 mb-3">Popular Cities</h5>
                  <div className="flex flex-wrap gap-2">
                    {popularCities.map((c:any)=> (
                      <button 
                        key={c.id} 
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-indigo-200 rounded-full text-sm text-indigo-600 hover:bg-indigo-50 transition-colors" 
                        onClick={()=>{ setFilters(f=>({ ...f, city:c.name, country:c.country })); setTimeout(loadProps,0) }}
                      >
                        <MapPin className="w-3 h-3" />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
      
      {/* Main Content */}
      <main className="ml-72 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Mobile Navigation */}
          <div className="md:hidden mb-6">
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'browse', label: 'Browse', icon: Search },
                { key: 'bookings', label: 'Bookings', icon: Calendar },
                { key: 'payments', label: 'Payments', icon: CreditCard },
                { key: 'reviews', label: 'Reviews', icon: Star },
                { key: 'profile', label: 'Profile', icon: User }
              ].map(t => {
                const Icon = t.icon
                const isActive = activeTab === t.key
                return (
                  <button 
                    key={t.key}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-white border border-purple-200 text-purple-600 hover:bg-purple-50'
                    }`} 
                    onClick={()=>setActiveTab(t.key as any)}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
          {/* Browse Properties Tab */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Browse Properties</h2>
                      <p className="text-purple-600">Discover your perfect getaway</p>
                    </div>
                  </div>
                  <button 
                    onClick={loadProps} 
                    disabled={propsLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${propsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Unified Search Bar */}
              <div className="bg-white border border-purple-100 rounded-xl shadow-sm p-6">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      className="w-full border border-gray-200 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="Search e.g. 'Mumbai, India' or 'Beach cottage'"
                      value={query}
                      onChange={e=>setQuery(e.target.value)}
                      onKeyDown={(e)=>{ if (e.key==='Enter') applyUnifiedSearch() }}
                    />
                  </div>
                  <button 
                    onClick={applyUnifiedSearch} 
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {propsLoading && (
                <div className="space-y-4">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="animate-pulse bg-white border border-purple-100 rounded-xl p-6">
                      <div className="h-48 bg-purple-100 rounded-lg mb-4" />
                      <div className="h-4 bg-purple-100 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-purple-100 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-purple-100 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {propsError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 font-medium">{propsError}</p>
                </div>
              )}

              {/* Properties Grid */}
              {!propsLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {propsList.map((p:any) => (
                    <div key={p.id} className="group bg-white border border-purple-100 rounded-xl shadow-sm hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 overflow-hidden">
                      {/* Property Image */}
                      {(() => { 
                        const src = firstImage(p); 
                        return src ? (
                          <div className="relative h-48 overflow-hidden">
                            <img src={src} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            {p.instantBooking && (
                              <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                <CheckCircle className="w-3 h-3" />
                                Instant Book
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="h-48 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                            <Home className="w-12 h-12 text-purple-400" />
                          </div>
                        )
                      })()}
                      
                      {/* Property Details */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <MapPin className="w-3 h-3" />
                            {p.city}, {p.country}
                          </div>
                        </div>

                        {/* Rating */}
                        {(() => {
                          const avg = Number(p.averageRating ?? p.avgRating ?? p.rating ?? p.reviewsAvg ?? 0)
                          const count = Number(p.reviewsCount ?? p.reviewCount ?? p.reviews?.length ?? 0)
                          return (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{avg ? avg.toFixed(1) : 'N/A'}</span>
                              {count > 0 && <span className="text-sm text-gray-500">({count})</span>}
                            </div>
                          )
                        })()}

                        {/* Property Attributes */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {p.bedrooms != null && (
                            <div className="flex items-center gap-1">
                              <Bed className="w-4 h-4" />
                              {p.bedrooms}
                            </div>
                          )}
                          {p.bathrooms != null && (
                            <div className="flex items-center gap-1">
                              <Bath className="w-4 h-4" />
                              {p.bathrooms}
                            </div>
                          )}
                          {p.guests != null && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {p.guests}
                            </div>
                          )}
                        </div>

                        {/* Price and Action */}
                        <div className="flex items-center justify-between pt-2 border-t border-purple-50">
                          <div>
                            <span className="text-lg font-bold text-gray-900">${p.price}</span>
                            <span className="text-sm text-gray-600"> / night</span>
                          </div>
                          <a 
                            href={`#/properties/${p.id}`} 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!propsLoading && propsList.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4">
                    <Search className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-600 text-lg mb-2">No properties found</p>
                  <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                </div>
              )}
            </div>
          )}

          {/* My Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
                      <p className="text-purple-600">Manage your reservations</p>
                    </div>
                  </div>
                  <button 
                    onClick={loadBookings} 
                    disabled={loadingB}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingB ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loadingB && (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse bg-white border border-purple-100 rounded-xl p-6">
                      <div className="h-4 bg-purple-100 rounded w-1/3 mb-3" />
                      <div className="h-3 bg-purple-100 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-purple-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {errorB && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 font-medium">{errorB}</p>
                </div>
              )}

              {/* Bookings List */}
              {!loadingB && (
                <div className="space-y-4">
                  {bookings.map((b:any) => (
                    <div key={b.id} className="bg-white border border-purple-100 rounded-xl shadow-sm hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Home className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{b.property?.title || 'Property'}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-3 h-3" />
                                {b.guests} guests
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="font-medium">Check-in</div>
                                <div className="text-gray-600">{new Date(b.startDate).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="font-medium">Check-out</div>
                                <div className="text-gray-600">{new Date(b.endDate).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="font-medium">Duration</div>
                                <div className="text-gray-600">{b.nights} nights</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 border border-green-200' :
                            b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            b.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {b.status === 'CONFIRMED' && <CheckCircle className="w-3 h-3" />}
                            {b.status === 'PENDING' && <Clock className="w-3 h-3" />}
                            {b.status === 'CANCELLED' && <X className="w-3 h-3" />}
                            {b.status}
                          </span>
                          
                          {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                            <button 
                              onClick={() => cancel(b.id)} 
                              className="inline-flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loadingB && bookings.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-600 text-lg mb-2">No bookings yet</p>
                  <p className="text-gray-500 mb-4">Browse properties to create your first booking</p>
                  <button 
                    onClick={() => setActiveTab('browse')} 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    Browse Properties
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
                      <p className="text-purple-600">Track your payment history</p>
                    </div>
                  </div>
                  <button 
                    onClick={loadBookings} 
                    disabled={loadingB}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingB ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loadingB && (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse bg-white border border-purple-100 rounded-xl p-6">
                      <div className="h-4 bg-purple-100 rounded w-1/3 mb-3" />
                      <div className="h-3 bg-purple-100 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-purple-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {errorB && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 font-medium">{errorB}</p>
                </div>
              )}

              {/* Payments List */}
              {!loadingB && (
                <div className="space-y-4">
                  {payments.map((p:any)=> (
                    <div key={p.id} className="bg-white border border-purple-100 rounded-xl shadow-sm hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <CreditCard className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{p.propertyTitle}</h3>
                            <div className="text-sm text-gray-600">{new Date(p.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{p.currency} {p.amount}</div>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            p.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {p.status === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                            {p.status === 'PENDING' && <Clock className="w-3 h-3" />}
                            {p.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loadingB && payments.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-600 text-lg mb-2">No payments yet</p>
                  <p className="text-gray-500">Your payment history will appear here</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">My Reviews</h2>
                      <p className="text-purple-600">Your property reviews and ratings</p>
                    </div>
                  </div>
                  <button 
                    onClick={loadMyReviews} 
                    disabled={rLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${rLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {rLoading && (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse bg-white border border-purple-100 rounded-xl p-6">
                      <div className="h-4 bg-purple-100 rounded w-1/3 mb-3" />
                      <div className="h-3 bg-purple-100 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-purple-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {rError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 font-medium">{rError}</p>
                </div>
              )}

              {/* Reviews List */}
              {!rLoading && (
                <div className="space-y-4">
                  {myReviews.map((r:any)=>(
                    <div key={r.id} className="bg-white border border-purple-100 rounded-xl shadow-sm hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Home className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{r.property?.title || `Property #${r.propertyId}`}</h3>
                            <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        {r.isVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-4 h-4 ${i <= r.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{r.rating}/5</span>
                      </div>
                      
                      {r.comment && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{r.comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!rLoading && myReviews.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4">
                    <Star className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-600 text-lg mb-2">No reviews yet</p>
                  <p className="text-gray-500">Your property reviews will appear here after your stays</p>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                    <p className="text-purple-600">Manage your account information</p>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="bg-white border border-purple-100 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Full Name</div>
                      <div className="text-gray-900">{user?.name || 'Not provided'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Email Address</div>
                      <div className="text-gray-900">{user?.email || 'Not provided'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Account Type</div>
                      <div className="text-gray-900 capitalize">{user?.role?.toLowerCase() || 'User'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
