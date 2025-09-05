import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'
import { PropertiesAPI, DestinationsAPI } from '../api'
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Star, 
  Heart,
  ArrowLeft,
  Calendar,
  DollarSign
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/footer'

interface Property {
  id: number
  propertyId: number
  title: string
  description: string
  location: string
  city: string
  country: string
  price: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  propertyType: string
  media: any[]
  isFeatured: boolean
  isPopular: boolean
  region?: { id: number; name: string; slug: string }
  destination?: { id: number; name: string; slug: string }
  reviews: any[]
  averageRating?: number
}

interface Destination {
  id: number
  name: string
  slug: string
  description?: string
  propertyCount: number
  region: {
    id: number
    name: string
    slug: string
  }
}

export default function DestinationProperties() {
  const { destinationSlug } = useParams<{ destinationSlug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [destination, setDestination] = useState<Destination | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    bedrooms: '',
    minGuests: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (destinationSlug) {
      fetchDestinationAndProperties()
    }
  }, [destinationSlug, filters, currentPage])

  const fetchDestinationAndProperties = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch destination info
      const regionsData = await DestinationsAPI.getRegionsWithDestinations()
      const allDestinations: Destination[] = []
      
      // Extract all destinations from all regions
      regionsData.data?.forEach((region: any) => {
        if (region.destinations) {
          allDestinations.push(...region.destinations)
        }
        // Also check child regions
        if (region.children) {
          region.children.forEach((childRegion: any) => {
            if (childRegion.destinations) {
              allDestinations.push(...childRegion.destinations)
            }
          })
        }
      })
      
      const foundDestination = allDestinations.find((d: Destination) => d.slug === destinationSlug)
      
      if (!foundDestination) {
        setError('Destination not found')
        return
      }
      
      setDestination(foundDestination)

      // Fetch properties for this destination
      const queryParams = new URLSearchParams()
      if (destinationSlug) queryParams.set('destinationSlug', destinationSlug)
      queryParams.set('page', currentPage.toString())
      queryParams.set('limit', '12')
      
      // Add non-empty filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') {
          queryParams.set(key, value)
        }
      })

      const response = await fetch(`/api/properties/public?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        setProperties(data.data.properties || [])
        setTotalPages(Math.ceil(data.data.total / 12))
      } else {
        setError(data.message || 'Failed to fetch properties')
      }
    } catch (err) {
      setError('Failed to load destination properties')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePropertyClick = (property: Property) => {
    if (!user) {
      navigate('/auth/login')
      return
    }
    
    if (user.role !== 'USER') {
      alert('Only users can book properties. Please login with a user account.')
      return
    }
    
    // Navigate to property details page
    navigate(`/property/${property.propertyId}`)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-20 pb-8 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">{destination?.name}</h1>
            <p className="text-xl text-white/90 mb-4">
              {destination?.region.name} • {destination?.propertyCount} properties available
            </p>
            {destination?.description && (
              <p className="text-white/80 max-w-2xl">{destination.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search properties..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
              <option value="Condo">Condo</option>
            </select>
            
            <select
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Any Bedrooms</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
            </select>
            
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                setFilters(prev => ({ ...prev, sortBy, sortOrder }))
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600">
                  No properties match your current filters. Try adjusting your search criteria.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => handlePropertyClick(property)}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {property.media && property.media.length > 0 ? (
                        <img
                          src={property.media[0].url || property.media[0]}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {property.isFeatured && (
                          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Featured
                          </span>
                        )}
                        {property.isPopular && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                      
                      <div className="absolute top-2 right-2">
                        <button className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                          <Heart className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{property.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {property.city}, {property.country}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {property.maxGuests}
                          </span>
                          <span className="flex items-center">
                            <Bed className="w-3 h-3 mr-1" />
                            {property.bedrooms}
                          </span>
                          <span className="flex items-center">
                            <Bath className="w-3 h-3 mr-1" />
                            {property.bathrooms}
                          </span>
                        </div>
                        
                        {property.averageRating && (
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 mr-1" />
                            <span>{property.averageRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">${property.price}</span>
                          <span className="text-sm text-gray-600">/night</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {property.propertyType}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-2 rounded-lg ${
                          currentPage === i + 1
                            ? 'bg-purple-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
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
