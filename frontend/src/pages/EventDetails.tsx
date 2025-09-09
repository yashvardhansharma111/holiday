import { useEffect, useMemo, useState } from 'react'
import { EventsAPI, PublicPropertiesAPI } from '../lib/api'
import { Calendar, MapPin, Clock, Star, RefreshCw } from 'lucide-react'

function useRouteId(): number | null {
  // supports hash-based routing like #/events/123 and path-based /events/123
  const [hash, setHash] = useState<string>(window.location.hash || window.location.pathname)
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || window.location.pathname)
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('popstate', onHashChange)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('popstate', onHashChange)
    }
  }, [])
  const id = useMemo(() => {
    const val = (hash.startsWith('#') ? hash.slice(1) : hash)
    const parts = val.split('?')[0].split('/')
    const idx = parts.indexOf('events')
    const maybe = idx >= 0 ? parts[idx+1] : parts[1]
    const n = Number(maybe)
    return Number.isFinite(n) ? n : null
  }, [hash])
  return id
}

export default function EventDetails() {
  const id = useRouteId()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [event, setEvent] = useState<any | null>(null)
  const [nearby, setNearby] = useState<any[]>([])
  const [tick, setTick] = useState(0)

  const load = async () => {
    if (!id) return
    setLoading(true); setError(null)
    try {
      const ev = await EventsAPI.get(id)
      setEvent(ev)
      // Fetch properties in same city as event (fallback to country if city missing)
      const props = await PublicPropertiesAPI.list({ city: ev?.city || undefined, country: ev?.city ? undefined : (ev?.country || undefined), limit: 24 } as any)
      const items = Array.isArray(props?.items) ? props.items : (Array.isArray(props?.data) ? props.data : (Array.isArray(props) ? props : []))
      setNearby(items)
    } catch (e:any) {
      setError(e?.message || 'Failed to load event')
      setEvent(null)
      setNearby([])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  // Shuffle carousel every 7 seconds
  useEffect(() => {
    const t = setInterval(() => setTick(prev => prev + 1), 7000)
    return () => clearInterval(t)
  }, [])

  const shuffledNearby = useMemo(() => {
    if (!nearby.length) return [] as any[]
    const arr = [...nearby]
    // rotate by tick
    const shift = tick % arr.length
    return arr.slice(shift).concat(arr.slice(0, shift))
  }, [nearby, tick])

  const mapSrc = useMemo(() => {
    if (!event) return ''
    if (event.latitude != null && event.longitude != null && event.latitude !== '' && event.longitude !== '') {
      const lat = Number(event.latitude)
      const lon = Number(event.longitude)
      const bbox = `${lon-0.02},${lat-0.02},${lon+0.02},${lat+0.02}`
      return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lon}`
    }
    const q = encodeURIComponent([event.address, event.city, event.state, event.country].filter(Boolean).join(', ') || 'World')
    return `https://www.openstreetmap.org/export/embed.html?search=${q}`
  }, [event])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 pt-14">
      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Event</h1>
              <p className="text-red-600">Book stays near the event</p>
            </div>
          </div>
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse bg-white border border-red-100 rounded-xl h-72 mb-6" />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">{error}</div>
        ) : event ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left: details */}
            <div className="bg-white border border-red-100 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h2>
              {event.category && <div className="inline-block px-2 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-200 mb-3">{event.category}</div>}
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> <span>{new Date(event.startDateTime).toLocaleString()} → {new Date(event.endDateTime).toLocaleString()}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> <span>{[event.address, event.city, event.state, event.country].filter(Boolean).join(', ') || '—'}</span></div>
              </div>
              {event.description && (
                <div className="mt-4 prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </div>
            {/* Right: map */}
            <div className="bg-white border border-red-100 rounded-xl overflow-hidden">
              {mapSrc ? (
                <iframe title="map" src={mapSrc} className="w-full h-[360px]" loading="lazy" />
              ) : (
                <div className="h-[360px] flex items-center justify-center text-gray-500">Map unavailable</div>
              )}
            </div>
          </div>
        ) : null}

        {/* Nearby properties carousel */}
        <div className="bg-white border border-red-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Properties near this event</h3>
            <div className="text-sm text-gray-500">Auto-rotating every 7s</div>
          </div>
          {shuffledNearby.length === 0 ? (
            <div className="text-gray-600">No nearby properties found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shuffledNearby.slice(0, 6).map((p:any) => (
                <div key={p.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
                  <div className="h-40 bg-gray-100">
                    {p.media?.[0]?.url ? (
                      <img src={p.media[0].url} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 truncate mr-2">{p.title}</h4>
                      {p.rating != null && (
                        <div className="inline-flex items-center gap-1 text-sm text-yellow-600"><Star className="w-4 h-4" /> {p.rating}</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{[p.city, p.country].filter(Boolean).join(', ')}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-bold text-red-600">${p.price}<span className="text-xs text-gray-500">/night</span></div>
                      <a href={`#/properties/${p.id}`} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">Book now</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
