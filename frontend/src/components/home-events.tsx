import { useEffect, useState } from 'react'
import { EventsAPI } from '../lib/api'
import { Calendar, MapPin, ChevronRight } from 'lucide-react'

export default function HomeEvents() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null)
      try {
        const resp = await EventsAPI.list({ limit: 6, startFrom: new Date().toISOString() }) as any
        const list = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : [])
        setEvents(list)
      } catch (e:any) { setError(e?.message || 'Failed to load events') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <section className="py-10 bg-gradient-to-r from-red-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Upcoming Events</h2>
            <p className="text-red-600">Discover stays near popular events</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse bg-white border border-red-100 rounded-xl p-4 h-36" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map(ev => (
              <div key={ev.id} className="bg-white border border-red-100 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">{ev.title}</h3>
                  <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(ev.startDateTime).toLocaleDateString()} → {new Date(ev.endDateTime).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{[ev.city, ev.country].filter(Boolean).join(', ') || '—'}</span>
                  </div>
                </div>
                <div className="pt-4">
                  <a href={`#/events/${ev.id}`} className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Visit Event <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="md:col-span-3 text-gray-600">No upcoming events</div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
