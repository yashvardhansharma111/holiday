import React, { useEffect, useMemo, useState } from 'react'
import { PublicPropertiesAPI, BookingsAPI, ReviewsAPI } from '../lib/api'
import { useAuth } from '../context/auth'

export default function PropertyDetails() {
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [moreCityProps, setMoreCityProps] = useState<any[]>([])
  const [moreLoading, setMoreLoading] = useState(false)
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsHasMore, setReviewsHasMore] = useState(false)
  const [filterRating, setFilterRating] = useState<number | undefined>(undefined)
  const [filterVerified, setFilterVerified] = useState<boolean | undefined>(undefined)
  const [newReviewRating, setNewReviewRating] = useState<number>(5)
  const [newReviewComment, setNewReviewComment] = useState<string>('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [guests, setGuests] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')

  const { user } = useAuth()

  // parse id from hash e.g. #/properties/123
  const propertyId = useMemo(() => {
    const hash = window.location.hash || '#/'
    const path = hash.replace('#', '')
    const parts = path.split('/')
    const idStr = parts[2]
    const idNum = Number(idStr)
    return Number.isFinite(idNum) ? idNum : null
  }, [])

  useEffect(() => {
    let ignore = false
    async function load() {
      if (!propertyId) {
        setError('Invalid property id')
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const data = await PublicPropertiesAPI.get(propertyId)
        if (!ignore) setProperty(data)
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Failed to load property')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [propertyId])

  // Load more rentals in the same city after main property is loaded
  useEffect(() => {
    let ignore = false
    async function loadMore() {
      if (!property?.city) return
      setMoreLoading(true)
      try {
        const citySlug = String(property.city)
          .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
          .toLowerCase().trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
        const data = await PublicPropertiesAPI.list({ citySlug, page: 1, limit: 8 })
        const list = Array.isArray((data as any).properties) ? (data as any).properties : Array.isArray(data) ? data : []
        const filtered = list.filter((p: any) => (p.propertyId ?? p.id) !== propertyId)
        if (!ignore) setMoreCityProps(filtered)
      } catch (_) {
        if (!ignore) setMoreCityProps([])
      } finally {
        if (!ignore) setMoreLoading(false)
      }
    }
    loadMore()
    return () => { ignore = true }
  }, [property?.city, propertyId])

  // Load reviews
  useEffect(() => {
    let ignore = false
    async function loadReviews() {
      if (!propertyId) return
      setReviewsLoading(true)
      setReviewsError(null)
      try {
        const data = await ReviewsAPI.listForProperty(propertyId, {
          page: reviewsPage,
          limit: 10,
          rating: filterRating,
          verified: filterVerified,
        })
        // Expecting data to be like { reviews, pagination, summary? }
        const list = Array.isArray((data as any).reviews) ? (data as any).reviews : Array.isArray(data) ? data : []
        const pagination = (data as any).pagination
        if (!ignore) {
          setReviews(list)
          if (pagination) {
            setReviewsHasMore(pagination.currentPage < pagination.totalPages)
          } else {
            setReviewsHasMore(false)
          }
        }
      } catch (e: any) {
        if (!ignore) setReviewsError(e?.message || 'Failed to load reviews')
      } finally {
        if (!ignore) setReviewsLoading(false)
      }
    }
    loadReviews()
    return () => { ignore = true }
  }, [propertyId, reviewsPage, filterRating, filterVerified])

  async function submitReview() {
    if (!user) {
      alert('Please login to write a review')
      window.location.hash = '#/login'
      return
    }
    if (!propertyId) return
    if (newReviewRating < 1 || newReviewRating > 5) {
      alert('Rating must be between 1 and 5')
      return
    }
    setSubmittingReview(true)
    try {
      await ReviewsAPI.add(propertyId, { rating: newReviewRating, comment: newReviewComment || undefined })
      setNewReviewComment('')
      setNewReviewRating(5)
      // reload reviews
      setReviewsPage(1)
      const refreshed = await ReviewsAPI.listForProperty(propertyId, { page: 1, limit: 10, rating: filterRating, verified: filterVerified })
      const list = Array.isArray((refreshed as any).reviews) ? (refreshed as any).reviews : Array.isArray(refreshed) ? refreshed : []
      setReviews(list)
      alert('Review submitted')
    } catch (e: any) {
      alert(e?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Compute images list from property in a stable hook before any conditional returns
  const images = useMemo<string[]>(() => {
    const media = Array.isArray(property?.media) ? property.media : []
    const arr: string[] = media
      .map((m: any) => {
        if (typeof m === 'string') return m
        if (m && typeof m === 'object') {
          // common keys: url, src, image
          return m.url || m.src || m.image || ''
        }
        return ''
      })
      .filter((u: any) => typeof u === 'string' && u.trim().length > 0)
    if (arr.length === 0 && typeof property?.coverImageUrl === 'string' && property.coverImageUrl.trim() !== '') {
      return [property.coverImageUrl]
    }
    return arr
  }, [property])

  // Carousel state and helpers (must be declared unconditionally)
  const [idx, setIdx] = useState(0)
  useEffect(() => { if (idx >= images.length) setIdx(0) }, [images.length, idx])
  function prev() { setIdx((i) => (images.length ? (i - 1 + images.length) % images.length : 0)) }
  function next() { setIdx((i) => (images.length ? (i + 1) % images.length : 0)) }

  // basic touch swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  function onTouchStart(e: React.TouchEvent) { setTouchStartX(e.touches[0].clientX) }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX == null) return
    const dx = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev() }
    setTouchStartX(null)
  }

  async function book() {
    if (!user) {
      alert('Please login to book')
      window.location.hash = '#/login'
      return
    }
    if (!propertyId) return
    if (!startDate || !endDate) {
      alert('Please select start and end dates')
      return
    }
    if (new Date(startDate) >= new Date(endDate)) {
      alert('End date must be after start date')
      return
    }
    setBookingLoading(true)
    setSuccessMsg(null)
    try {
      const startISO = new Date(startDate).toISOString()
      const endISO = new Date(endDate).toISOString()
      await BookingsAPI.create({ propertyId, startDate: startISO, endDate: endISO, guests, specialRequests: specialRequests || undefined })
      setSuccessMsg('Booking requested successfully. The property owner/agent will see your details with this booking.')
    } catch (e: any) {
      alert(e?.message || 'Booking failed')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-10">
        <div className="text-center text-gray-600">Loading property…</div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Property not found</h1>
          <p className="text-gray-600 mb-4">{error || 'We could not load this property.'}</p>
          <a className="text-purple-700 hover:underline" href="#/">Go Home</a>
        </div>
      </div>
    )
  }

  

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-4">
        <a href="#/" className="text-sm text-purple-700 hover:underline">← Back to Home</a>
      </div>

      <div className="md:flex md:items-start md:gap-8">
        <div className="md:w-2/3">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">{property.title}</h1>
          <div className="text-gray-600 mb-4">{property.city}, {property.country}</div>

          {images.length > 0 ? (
            <div>
              <div className="relative w-full overflow-hidden rounded border bg-gray-50" style={{height:'380px'}} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                {/* main image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[idx]} alt={property.title} className="w-full h-full object-cover block" />
                {images.length > 1 && (
                  <>
                    <button aria-label="Previous image" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-9 h-9 flex items-center justify-center border">‹</button>
                    <button aria-label="Next image" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-9 h-9 flex items-center justify-center border">›</button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.slice(0,6).map((_, i) => (
                        <span key={i} className={`w-2 h-2 rounded-full ${i===idx? 'bg-purple-700':'bg-white border'} `} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-4 md:grid-cols-6 gap-2">
                  {images.slice(0, 12).map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={src} onClick={()=>setIdx(i)} alt={`${property.title}-${i+1}`} className={`w-full h-20 object-cover rounded border cursor-pointer ${i===idx ? 'ring-2 ring-purple-700' : ''}`} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video w-full rounded border bg-gray-100 flex items-center justify-center text-gray-500">
              No images provided
            </div>
          )}

          <div className="mt-6 space-y-2">
            <p className="text-gray-800 whitespace-pre-wrap">{property.description}</p>
            <div className="text-sm text-gray-600">Type: {property.propertyType || 'N/A'}</div>
            <div className="text-sm text-gray-600">Max Guests: {property.maxGuests || 'N/A'} · Bedrooms: {property.bedrooms ?? 'N/A'} · Bathrooms: {property.bathrooms ?? 'N/A'}</div>
            {property.avgRating != null && (
              <div className="text-sm text-gray-600">Rating: {property.avgRating} ({property._count?.reviews || 0} reviews)</div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Guest Reviews</h2>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Rating</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={filterRating ?? ''}
                  onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">All</option>
                  <option value="5">5</option>
                  <option value="4">4+</option>
                  <option value="3">3+</option>
                  <option value="2">2+</option>
                  <option value="1">1+</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Verified only</label>
                <input
                  type="checkbox"
                  checked={!!filterVerified}
                  onChange={(e) => setFilterVerified(e.target.checked ? true : undefined)}
                />
              </div>
              <button
                className="text-sm text-purple-700 hover:underline"
                onClick={() => { setFilterRating(undefined); setFilterVerified(undefined); setReviewsPage(1); }}
              >
                Reset
              </button>
            </div>

            {/* List */}
            {reviewsLoading && <div className="text-gray-600">Loading reviews…</div>}
            {reviewsError && <div className="text-red-600 text-sm mb-2">{reviewsError}</div>}
            {!reviewsLoading && !reviewsError && reviews.length === 0 && (
              <div className="text-gray-600 text-sm">No reviews yet. Be the first to review this property.</div>
            )}
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.user?.name || 'Guest'}</div>
                    <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-gray-800 mt-1">Rating: {r.rating} {r.isVerified ? <span className="ml-2 text-green-700 bg-green-50 border border-green-200 rounded px-2 py-0.5 text-xs">Verified</span> : null}</div>
                  {r.comment && <div className="text-gray-700 mt-2 whitespace-pre-wrap">{r.comment}</div>}
                  {r.adminResponse && (
                    <div className="mt-2 text-sm text-gray-700 bg-gray-50 border rounded p-2">
                      <div className="font-medium">Owner/Admin response</div>
                      <div>{r.adminResponse}</div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {reviewsHasMore && (
              <div className="mt-3">
                <button className="text-sm text-purple-700 hover:underline" onClick={() => setReviewsPage((p) => p + 1)}>Load more</button>
              </div>
            )}

            {/* Add Review */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Write a review</h3>
              {!user ? (
                <div className="text-sm text-gray-700">
                  <a href="#/login" className="text-purple-700 hover:underline">Login</a> to write a review.
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Rating</label>
                    <select className="border rounded px-3 py-2" value={newReviewRating} onChange={(e) => setNewReviewRating(Number(e.target.value))}>
                      {[5,4,3,2,1].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Comment (optional)</label>
                    <textarea className="w-full border rounded px-3 py-2" rows={3} value={newReviewComment} onChange={(e) => setNewReviewComment(e.target.value)} />
                  </div>
                  <button onClick={submitReview} disabled={submittingReview} className="bg-purple-700 text-white rounded px-4 py-2 hover:bg-purple-800 disabled:opacity-60">
                    {submittingReview ? 'Submitting…' : 'Submit review'}
                  </button>
                  <p className="text-xs text-gray-500">Only one review per property. Verified badge appears for guests who completed a booking.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:w-1/3 mt-6 md:mt-0">
          <div className="border rounded p-4 sticky top-4">
            <div className="text-xl font-semibold mb-1">${property.price} <span className="text-sm font-normal text-gray-600">/ night</span></div>
            <div className="text-sm text-gray-600 mb-4">Instant booking: {property.instantBooking ? 'Yes' : 'No'}</div>
            {successMsg && <div className="mb-3 p-2 text-sm bg-green-50 border border-green-200 text-green-700 rounded">{successMsg}</div>}

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Check-in</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={startDate} onChange={e=>setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Check-out</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={endDate} onChange={e=>setEndDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Guests</label>
                <input type="number" min={1} className="w-full border rounded px-3 py-2" value={guests} onChange={e=>setGuests(Number(e.target.value)||1)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Special requests (optional)</label>
                <textarea className="w-full border rounded px-3 py-2" rows={3} value={specialRequests} onChange={e=>setSpecialRequests(e.target.value)} />
              </div>
              <button onClick={book} disabled={bookingLoading} className="w-full bg-purple-700 text-white rounded px-4 py-2 hover:bg-purple-800 disabled:opacity-60">
                {bookingLoading ? 'Booking…' : 'Book now'}
              </button>
              <p className="text-xs text-gray-500">On booking, the owner/agent will be able to see your name and contact details with the booking.</p>
            </div>
          </div>
        </div>
      </div>

      {/* More rentals in this city */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">More rentals in {property.city}</h2>
        {moreLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded p-4 animate-pulse">
                <div className="h-24 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : moreCityProps.length === 0 ? (
          <div className="text-sm text-gray-600">No other rentals found in this city.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {moreCityProps.map((p) => (
              <a key={p.id} href={`#/properties/${p.propertyId || p.id}`} className="border rounded p-3 hover:shadow transition flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={(p.media && p.media[0]?.url) || p.media?.[0] || property?.coverImageUrl || ''} alt={p.title} className="w-24 h-24 object-cover rounded" />
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-sm text-gray-600 truncate">${p.price} / night</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Below the return above, add additional JSX rendering within the main returned layout
