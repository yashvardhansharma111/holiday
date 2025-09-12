import { useEffect, useState } from 'react'
import { PropertiesAPI } from '../api'
import { Star, ArrowRight, MapPin, Users, Bed } from 'lucide-react'

export default function FeaturedProperties() {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([])
  const [popularProperties, setPopularProperties] = useState<any[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [popularLoading, setPopularLoading] = useState(true)
  const [featuredError, setFeaturedError] = useState<string | null>(null)
  const [popularError, setPopularError] = useState<string | null>(null)

  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        setFeaturedLoading(true)
        const response = await PropertiesAPI.getFeatured(3)
        const list = Array.isArray(response?.data)
          ? response.data
          : Array.isArray((response as any)?.properties)
            ? (response as any).properties
            : Array.isArray(response)
              ? (response as any)
              : []
        setFeaturedProperties(list)
      } catch (error: any) {
        setFeaturedError(error.message || 'Failed to load featured properties')
      } finally {
        setFeaturedLoading(false)
      }
    }

    const loadPopularProperties = async () => {
      try {
        setPopularLoading(true)
        const response = await PropertiesAPI.getPopular(3)
        const list = Array.isArray(response?.data)
          ? response.data
          : Array.isArray((response as any)?.properties)
            ? (response as any).properties
            : Array.isArray(response)
              ? (response as any)
              : []
        setPopularProperties(list)
      } catch (error: any) {
        setPopularError(error.message || 'Failed to load popular properties')
      } finally {
        setPopularLoading(false)
      }
    }

    loadFeaturedProperties()
    loadPopularProperties()
  }, [])

  const PropertyCard = ({ property, type }: { property: any; type: 'featured' | 'popular' }) => {
    const primaryImage = Array.isArray(property.media) && property.media.length > 0 
      ? property.media[0].url 
      : '/placeholder.svg'
    
    const averageRating = property.reviews?.length > 0 
      ? (property.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / property.reviews.length).toFixed(1)
      : property.initialRating || '4.5'

    function visit() {
      const pid = property.propertyId || property.id
      window.location.hash = `#/properties/${pid}`
    }

    return (
      <div className="group transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl rounded-tl-3xl rounded-br-3xl overflow-hidden bg-white">
  <div className="relative overflow-hidden h-64 sm:h-72 lg:h-80 rounded-tl-3xl rounded-br-3xl">
    <img
      src={primaryImage}
      alt={property.title}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      onClick={visit}
    />

    {/* Overlay gradient for readability */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>

    {/* Tag top-left */}
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800 flex items-center gap-1">
      <Star className={`w-3 h-3 ${type === 'featured' ? 'text-yellow-500' : 'text-orange-500'}`} />
      {type === 'featured' ? 'Featured' : 'Popular'}
    </div>

    {/* Instant Book badge */}
    {property.instantBooking && (
      <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow">
        Instant Book
      </div>
    )}
  </div>

  {/* Details */}
  <div className="p-4 space-y-2">
    <div className="flex items-center gap-3 text-xs text-gray-600">
      <div className="flex items-center gap-1">
        <Users className="w-3 h-3" />
        <span>{property.maxGuests} guests</span>
      </div>
      <div className="flex items-center gap-1">
        <Bed className="w-3 h-3" />
        <span>{property.bedrooms} bedrooms</span>
      </div>
    </div>

    <h3
      className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors text-base cursor-pointer"
      onClick={visit}
    >
      {property.title}
    </h3>

    <div className="flex items-center gap-1 text-gray-600 text-xs">
      <MapPin className="w-3 h-3" />
      <span>{property.city}, {property.country}</span>
    </div>

    <div className="flex items-center justify-between pt-1.5">
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="text-xs font-medium">{averageRating}</span>
        <span className="text-xs text-gray-500">({property.reviews?.length || 0})</span>
      </div>

      <div className="text-right">
        <div className="text-sm font-semibold text-gray-900">
          ${property.price}{property.pricePerNight ? '/night' : ''}
        </div>
      </div>
    </div>

    <div className="pt-2">
      <button
        onClick={visit}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
      >
        Visit
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
</div>

    )
  }

const PropertySection = ({ 
  title, 
  subtitle, 
  properties, 
  loading, 
  error, 
  type,
  linkPath 
}: { 
  title: string; 
  subtitle: string; 
  properties: any[] | any; 
  loading: boolean; 
  error: string | null; 
  type: 'featured' | 'popular';
  linkPath: string;
}) => (
  <div className="mb-16">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
    </div>

    {loading ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl aspect-[4/3] mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    ) : error ? (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
      </div>
    ) : (Array.isArray(properties) && properties.length > 0) ? (
      <>
        {/* Show max 10 (5 per row × 2 rows) */}
        <div className="grid grid-cols-4 sm:grid-cols-2  lg:grid-cols-5 gap-6 mb-6">
          {(Array.isArray(properties) ? properties.slice(0, 10) : []).map((property) => (
            <PropertyCard key={property.id} property={property} type={type} />
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => { window.location.hash = `#${linkPath}` }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            See All {title}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </>
    ) : (
      <div className="text-center py-8">
        <p className="text-gray-600">No {type} properties available at the moment.</p>
      </div>
    )}
  </div>
);


  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <PropertySection
          title="Featured Properties"
          subtitle="Handpicked exceptional properties that offer unforgettable experiences"
          properties={featuredProperties}
          loading={featuredLoading}
          error={featuredError}
          type="featured"
          linkPath="/properties/featured"
        />
        
        <PropertySection
          title="Popular Destination"
          subtitle="Most loved destinations chosen by our community of travelers"
          properties={popularProperties}
          loading={popularLoading}
          error={popularError}
          type="popular"
          linkPath="/properties/popular"
        />
      </div>
    </section>
  )
}