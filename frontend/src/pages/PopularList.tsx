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
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden">
      {/* Image Section */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={img}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
          onClick={visit}
        />
        <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
          Popular
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Capacity */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {property.maxGuests} Guests</span>
          <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {property.bedrooms} Bedrooms</span>
        </div>

        {/* Title */}
        <h3
          onClick={visit}
          className="font-semibold text-gray-900 line-clamp-2 text-lg group-hover:text-purple-600 transition-colors cursor-pointer"
        >
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{property.city}, {property.country}</span>
        </div>

        {/* Rating & Price */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-xs text-gray-500">({property.reviews?.length || 0})</span>
          </div>
          <div className="text-base font-semibold text-gray-900">
            ${property.price}{property.pricePerNight ? '/night' : ''}
          </div>
        </div>

        {/* Button */}
        <button
          onClick={visit}
          className="w-full mt-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow hover:opacity-90 transition"
        >
          View Details
        </button>
      </div>
    </div>
  )
}

export default function PopularList() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        setLoading(true)
        // Load many popular
        const res = await PropertiesAPI.getPopular(30)
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        if (!ignore) setList(arr)
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Failed to load popular properties')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <button
          onClick={() => { window.location.hash = '#/' }}
          className="flex items-center text-purple-700 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
            Popular Properties
          </h1>
          <p className="text-gray-600 mt-2">Discover stays trending with travelers worldwide</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl aspect-[16/9] mb-4" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : list.length === 0 ? (
          <div className="text-center text-gray-600">No popular properties available.</div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {list.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
