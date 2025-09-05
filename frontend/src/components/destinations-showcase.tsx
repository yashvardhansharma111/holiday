import { useState, useEffect } from 'react'
import { MapPin, ArrowRight } from 'lucide-react'
import { DestinationsAPI } from '../api'

interface Destination {
  id: number
  name: string
  slug: string
  propertyCount: number
}

interface Region {
  id: number
  name: string
  slug: string
  destinations: Destination[]
  children: Region[]
}

export default function DestinationsShowcase() {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRegions = async () => {
      try {
        setLoading(true)
        const response = await DestinationsAPI.getRegionsWithDestinations()
        setRegions(response.data || [])
      } catch (error: any) {
        setError(error.message || 'Failed to load destinations')
      } finally {
        setLoading(false)
      }
    }

    loadRegions()
  }, [])

  const DestinationButton = ({ destination }: { destination: Destination }) => (
    <button 
      onClick={() => { window.location.hash = `#/destinations/${destination.slug}` }}
      className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center justify-between min-w-0"
    >
      <span className="truncate">{destination.name}</span>
      {destination.propertyCount > 0 && (
        <span className="ml-2 bg-blue-600 px-2 py-1 rounded-full text-xs">
          {destination.propertyCount}
        </span>
      )}
    </button>
  )

  const RegionSection = ({ region }: { region: Region }) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-600" />
        Top Vacation Rentals in {region.name}
      </h3>
      
      {/* Direct destinations for this region */}
      {region.destinations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {region.destinations.map((destination) => (
            <DestinationButton key={destination.id} destination={destination} />
          ))}
        </div>
      )}

      {/* Child regions (sub-regions) */}
      {region.children.map((childRegion) => (
        <div key={childRegion.id} className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">
            Top Vacation Rentals in {childRegion.name}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {childRegion.destinations.map((destination) => (
              <DestinationButton key={destination.id} destination={destination} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
          </div>
          
          {[1, 2, 3].map(i => (
            <div key={i} className="mb-8">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(j => (
                  <div key={j} className="h-10 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-600 font-medium mb-2">Failed to load destinations</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (regions.length === 0) {
    return (
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-blue-800 font-medium mb-2">No destinations available</p>
            <p className="text-blue-600 text-sm">Destinations will appear here once they are added by administrators</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Top Vacation Destinations
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover amazing vacation rentals across the world's most popular destinations
          </p>
        </div>

        <div className="space-y-8">
          {regions.map((region) => (
            <RegionSection key={region.id} region={region} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            View All Destinations
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
