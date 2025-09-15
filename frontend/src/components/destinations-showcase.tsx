import { useState, useEffect } from 'react'
import { MapPin, ArrowRight, Star, Sparkles, TrendingUp, Globe } from 'lucide-react'
import { PublicPropertiesAPI } from '../lib/api'

export default function DestinationsShowcase() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sections, setSections] = useState<Array<{ city: { id: number; name: string; country?: string }, propertyCount: number, properties: any[] }>>([])
  const [hoveredCity, setHoveredCity] = useState<number | null>(null)

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
      <section className="py-24 px-6 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl animate-pulse" />
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-80 animate-pulse" />
            </div>
            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-96 mx-auto animate-pulse" />
          </div>
          
          {/* City Sections Skeleton */}
          <div className="space-y-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl animate-pulse" />
                    <div>
                      <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-48 mb-2 animate-pulse" />
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-10 w-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl animate-pulse" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(j => (
                    <div key={j} className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-72 animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-24 px-6 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-red-100 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-red-500 text-2xl">⚠</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Unable to Load Destinations</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Luxury Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600 tracking-wide uppercase">Premium Destinations</span>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Discover Extraordinary 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Escapes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Curated collection of luxury vacation rentals in the world's most coveted destinations. 
            Each property handpicked for exceptional quality and unforgettable experiences.
          </p>
        </div>

        {/* City Sections */}
        <div className="space-y-12">
          {sections.map((s, index) => {
            const c = s.city
            const slug = String(c.name || '')
              .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
              .toLowerCase().trim()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
            const samples = s.properties || []
            
            return (
              <div 
                key={c.id}
                className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
                onMouseEnter={() => setHoveredCity(c.id)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                {/* City Header */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 p-8 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white to-transparent rounded-full -translate-x-16 -translate-y-16" />
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-white to-transparent rounded-full translate-x-24 translate-y-24" />
                  </div>
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-2">
                          {c.name}
                          {c.country && <span className="text-blue-200 font-normal">, {c.country}</span>}
                        </h3>
                        <div className="flex items-center gap-4 text-blue-100">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-medium">{s.propertyCount} Properties</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">Premium Selection</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <a 
                      href={`#/cities/${slug}`} 
                      className="group bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium flex items-center gap-2 border border-white/20 hover:border-white/40"
                    >
                      <span>Explore {c.name}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>

                {/* Properties Grid */}
                <div className="p-8">
                  {samples.length === 0 ? (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-lg">No properties available yet in {c.name}</p>
                      <p className="text-gray-500 text-sm mt-2">Be the first to discover this destination</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {samples.map((p: any, propIndex: number) => (
                        <a 
                          key={p.id} 
                          href={`#/properties/${p.propertyId || p.id}`}
                          className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                          style={{ 
                            animationDelay: `${propIndex * 100}ms`,
                            animation: hoveredCity === c.id ? `fadeInUp 0.6s ease-out forwards` : 'none'
                          }}
                        >
                          {/* Property Image Placeholder */}
                          <div className="h-48 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            <div className="absolute top-4 right-4">
                              <div className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                                FEATURED
                              </div>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-bold text-gray-900">4.9</span>
                                  </div>
                                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                    LUXURY
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Property Info */}
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                {p.title || 'Luxury Property'}
                              </h4>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  ${p.price || '---'}
                                </span>
                                <span className="text-gray-600 text-sm">/ night</span>
                              </div>
                              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                PREMIUM
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Exceptional Host
                                </span>
                                <span className="group-hover:text-blue-600 transition-colors font-medium">
                                  View Details →
                                </span>
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-black to-gray-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPgo=')] opacity-20" />
            <div className="relative">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Sparkles className="w-8 h-8" />
                <h3 className="text-3xl font-bold">Ready for Your Next Adventure?</h3>
              </div>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Browse our complete collection of handpicked luxury properties worldwide
              </p>
              <a 
                href="#/properties/popular" 
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Globe className="w-5 h-5" />
                Explore All Properties
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  )
}