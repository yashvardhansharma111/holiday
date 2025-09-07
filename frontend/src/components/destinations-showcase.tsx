import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { PublicPropertiesAPI } from '../lib/api'

export default function DestinationsShowcase() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sections, setSections] = useState<Array<{ city: { id: number; name: string; country?: string }, propertyCount: number, properties: any[] }>>([])

  // Load popular rentals by city (single request)
  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        setLoading(true)
        const data = await PublicPropertiesAPI.popularRentalsByCity({ citiesLimit: 6, propsPerCity: 6 })
        const list = Array.isArray(data) ? data : (data?.data || [])
        if (!ignore) setSections(Array.isArray(list) ? list : [])
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Failed to load cities')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

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

  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Top Vacation Rentals by City</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Browse properties by city. Click a city to view all rentals available there.</p>
        </div>

        {/* Per-city sections with sample property links */}
        <div className="space-y-10">
          {sections.map((s) => {
            const c = s.city
            const slug = String(c.name || '')
              .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
              .toLowerCase().trim()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
            const samples = s.properties || []
            return (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" /> Popular Rentals in {c.name}
                  </h3>
                  <a href={`#/cities/${slug}`} className="text-sm text-blue-700 hover:underline">View all in {c.name}</a>
                </div>
                {samples.length === 0 ? (
                  <div className="text-sm text-gray-500">No properties found yet in {c.name}.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {samples.map((p: any) => (
                      <a key={p.id} href={`#/properties/${p.propertyId || p.id}`} className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center justify-between min-w-0">
                        <span className="truncate">{p.title || 'Property'}</span>
                        <span className="ml-2 bg-blue-600 px-2 py-1 rounded-full text-xs">${p.price ?? ''}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
