import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/footer'
import { MapPin, Users, Bed, Bath, Star, ArrowLeft, Heart } from 'lucide-react'
import { PublicPropertiesAPI } from '../lib/api'

export default function CityProperties() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cityName, setCityName] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { citySlug, checkInQS, checkOutQS } = useMemo(() => {
    const hasHash = !!window.location.hash
    const url = new URL(window.location.href)
    let slug = ''
    if (hasHash) {
      const path = (window.location.hash || '#/').replace('#', '')
      const parts = path.split('?')[0].split('/')
      slug = parts[2] || ''
    } else {
      const parts = url.pathname.split('/')
      // /cities/:slug
      slug = parts[2] || ''
    }
    const checkIn = url.searchParams.get('checkIn') || ''
    const checkOut = url.searchParams.get('checkOut') || ''
    return { citySlug: slug, checkInQS: checkIn, checkOutQS: checkOut }
  }, [])

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const resp = await PublicPropertiesAPI.list({ citySlug, page: currentPage, limit: 12, checkIn: checkInQS || undefined, checkOut: checkOutQS || undefined }) as any
        // Normalize multiple possible payload shapes
        // 1) { success, data: { data: [...], pagination: {...} } }
        // 2) { success, data: { properties: [...], total: N } }
        // 3) direct array
        const root = resp?.data ?? resp
        const inner = root?.data ?? root
        const propertiesArr = inner?.properties ?? inner?.data ?? (Array.isArray(root) ? root : [])
        const totalItems = inner?.pagination?.totalItems ?? inner?.total ?? propertiesArr.length
        const list = Array.isArray(propertiesArr) ? propertiesArr : []
        if (!ignore) {
          setProperties(list)
          setTotalPages(Math.ceil((totalItems || 0) / 12) || 1)
          if (list.length > 0) setCityName(list[0].city)
          else setCityName(citySlug.replace(/-/g, ' '))
        }
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Failed to load properties')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [citySlug, currentPage])

  function goHome() { window.location.hash = '#/' }
  function onCardClick(p: any) {
    window.location.hash = `#/properties/${p.propertyId || p.id}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-8 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={goHome} className="flex items-center text-white/80 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </button>
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">{cityName ? `Vacation Rentals in ${cityName}` : 'Vacation Rentals'}</h1>
            <p className="text-white/90">Browse properties by city</p>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8">
                <p className="text-red-600 font-medium mb-2">{error}</p>
                <button onClick={()=>window.location.reload()} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">Retry</button>
              </div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600">No properties found for this city.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id} onClick={()=>onCardClick(property)} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="relative h-48 overflow-hidden">
                      {Array.isArray(property.media) && property.media.length > 0 ? (
                        <img src={property.media[0]?.url || property.media[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center"><MapPin className="w-8 h-8 text-gray-400" /></div>
                      )}
                      {(property.isFeatured || property.isPopular) && (
                        <div className="absolute top-2 left-2 flex gap-1">
                          {property.isFeatured && <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">Featured</span>}
                          {property.isPopular && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">Popular</span>}
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <button className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"><Heart className="w-4 h-4 text-gray-600" /></button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{property.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 flex items-center"><MapPin className="w-3 h-3 mr-1" />{property.city}, {property.country}</p>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center"><Users className="w-3 h-3 mr-1" />{property.maxGuests}</span>
                          <span className="flex items-center"><Bed className="w-3 h-3 mr-1" />{property.bedrooms}</span>
                          <span className="flex items-center"><Bath className="w-3 h-3 mr-1" />{property.bathrooms}</span>
                        </div>
                        {property.avgRating != null && (
                          <div className="flex items-center"><Star className="w-3 h-3 text-yellow-400 mr-1" /><span>{property.avgRating}</span></div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">${property.price}</span>
                          <span className="text-sm text-gray-600">/night</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{property.propertyType}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-2">
                  <button onClick={()=>setCurrentPage((p)=>Math.max(1, p-1))} disabled={currentPage===1} className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Previous</button>
                  <div className="flex gap-1">
                    {Array.from({length: totalPages}).map((_, i) => (
                      <button key={i} onClick={()=>setCurrentPage(i+1)} className={`px-3 py-2 rounded-lg ${currentPage===i+1 ? 'bg-purple-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{i+1}</button>
                    ))}
                  </div>
                  <button onClick={()=>setCurrentPage((p)=>Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
