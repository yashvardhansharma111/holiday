import { useEffect, useState } from 'react'
import { PropertiesAPI } from '../api'
import { Star, MapPin, Users, Bed, ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/footer'

function PropertyCard({ property }: { property: any }) {
  const img =
    Array.isArray(property.media) && property.media.length > 0
      ? property.media[0]?.url || property.media[0]
      : '/placeholder.svg'

  const rating =
    property.reviews?.length > 0
      ? (
          property.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
          property.reviews.length
        ).toFixed(1)
      : property.initialRating || '4.5'

  const visit = () => {
    const pid = property.propertyId || property.id
    window.location.hash = `#/properties/${pid}`
  }

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={img}
          alt={property.title}
          onClick={visit}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
        />

        {/* Featured badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" /> Featured
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Guests & Bedrooms */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4 text-purple-500" />
            {property.maxGuests} guests
          </span>
          <span className="flex items-center gap-1">
            <Bed className="w-4 h-4 text-purple-500" />
            {property.bedrooms} bedrooms
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={visit}
          className="text-base font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-purple-600 cursor-pointer transition-colors"
        >
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="w-4 h-4 text-purple-400" />
          <span>
            {property.city}, {property.country}
          </span>
        </div>

        {/* Rating & Price */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-xs text-gray-500">
              ({property.reviews?.length || 0})
            </span>
          </div>
          <div className="text-right text-sm font-semibold text-gray-900">
            ${property.price}
            {property.pricePerNight ? '/night' : ''}
          </div>
        </div>

        {/* Visit button */}
        <button
          onClick={visit}
          className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium shadow hover:from-purple-700 hover:to-indigo-700 transition-colors text-sm"
        >
          Visit
        </button>
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
        const res = await PropertiesAPI.getFeatured(30)
        const arr = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : []
        if (!ignore) setList(arr)
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Failed to load featured properties')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        {/* Back */}
        <button
          onClick={() => {
            window.location.hash = '#/'
          }}
          className="flex items-center text-purple-700 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            All Featured Properties
          </h1>
          <p className="text-gray-600 mt-2">
            Browse our curated collection of premium rentals.
          </p>
        </div>

        {/* States */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <div className="text-center text-gray-600">
            No featured properties available.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {list.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
