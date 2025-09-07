import { useEffect, useState } from 'react'
import { PropertiesAPI } from '../api'
import { Star, MapPin, Users, Bed, ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/footer'

function PropertyCard({ property }: { property: any }) {
  const img = Array.isArray(property.media) && property.media.length > 0 ? (property.media[0]?.url || property.media[0]) : '/placeholder.svg'
  const rating = property.reviews?.length > 0
    ? (property.reviews.reduce((s: number, r: any) => s + r.rating, 0) / property.reviews.length).toFixed(1)
    : property.initialRating || '4.5'
  const visit = () => {
    const pid = property.propertyId || property.id
    window.location.hash = `#/properties/${pid}`
  }
  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-xl mb-3 aspect-[16/9]">
        <img src={img} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onClick={visit} />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800 flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500" /> Featured
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{property.maxGuests} guests</span>
          <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{property.bedrooms} bedrooms</span>
        </div>
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors text-base" onClick={visit}>{property.title}</h3>
        <div className="flex items-center gap-1 text-gray-600 text-xs"><MapPin className="w-3 h-3" /><span>{property.city}, {property.country}</span></div>
        <div className="flex items-center justify-between pt-1.5">
          <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-current" /><span className="text-xs font-medium">{rating}</span><span className="text-xs text-gray-500">({property.reviews?.length || 0})</span></div>
          <div className="text-sm font-semibold text-gray-900">${property.price}{property.pricePerNight? '/night':''}</div>
        </div>
        <div className="pt-2"><button onClick={visit} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">Visit</button></div>
      </div>
    </div>
  )
}

export default function FeaturedList() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        setLoading(true)
        // Load many featured
        const res = await PropertiesAPI.getFeatured(30)
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        if (!ignore) setList(arr)
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Failed to load featured properties')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <button onClick={() => { window.location.hash = '#/' }} className="flex items-center text-purple-700 hover:underline mb-4"><ArrowLeft className="w-4 h-4 mr-2"/>Back to Home</button>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">All Featured Properties</h1>
          <p className="text-gray-600">Browse all curated featured rentals.</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({length:9}).map((_,i)=>(
              <div key={i} className="animate-pulse"><div className="bg-gray-200 rounded-2xl aspect-[16/9] mb-4"/><div className="h-4 bg-gray-200 rounded w-2/3 mb-2"/><div className="h-4 bg-gray-200 rounded w-1/2"/></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : list.length === 0 ? (
          <div className="text-center text-gray-600">No featured properties available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
