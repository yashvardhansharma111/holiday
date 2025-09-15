"use client"

import { useEffect, useMemo, useState } from "react"
import { PublicPropertiesAPI, BookingsAPI, ReviewsAPI } from "../lib/api"
import { useAuth } from "../context/auth"
import { Star, MapPin, Users, Bed, Bath, Wifi, Car, Coffee, Tv, Clock } from "lucide-react"

export default function PropertyDetails() {
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [moreCityProps, setMoreCityProps] = useState<any[]>([])
  const [moreLoading, setMoreLoading] = useState(false)
  // iCal runtime sync (owner/agent tools)
  const [icalUrl, setIcalUrl] = useState("")
  const [icalStatus, setIcalStatus] = useState<string | null>(null)
  const [icalLoading, setIcalLoading] = useState(false)
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsHasMore, setReviewsHasMore] = useState(false)
  const [filterRating, setFilterRating] = useState<number | undefined>(undefined)
  const [filterVerified, setFilterVerified] = useState<boolean | undefined>(undefined)
  const [newReviewRating, setNewReviewRating] = useState<number>(5)
  const [newReviewComment, setNewReviewComment] = useState<string>("")
  const [submittingReview, setSubmittingReview] = useState(false)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [guests, setGuests] = useState(1)
  const [specialRequests, setSpecialRequests] = useState("")
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [availabilityNote, setAvailabilityNote] = useState<string | null>(null)

  const { user } = useAuth()

  // parse id from hash e.g. #/properties/123
  const propertyId = useMemo(() => {
    const hash = window.location.hash || "#/"
    const path = hash.replace("#", "")
    const parts = path.split("/")
    const idStr = parts[2]
    const idNum = Number(idStr)
    return Number.isFinite(idNum) ? idNum : null
  }, [])

  useEffect(() => {
    let ignore = false
    async function load() {
      if (!propertyId) {
        setError("Invalid property id")
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const data = await PublicPropertiesAPI.get(propertyId)
        if (!ignore) setProperty(data)
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load property")
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [propertyId])

  // Load more rentals in the same city after main property is loaded
  useEffect(() => {
    let ignore = false
    async function loadMore() {
      if (!property?.city) return
      setMoreLoading(true)
      try {
        const citySlug = String(property.city)
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
        const data = await PublicPropertiesAPI.list({ citySlug, page: 1, limit: 8 })
        const list = Array.isArray((data as any).properties)
          ? (data as any).properties
          : Array.isArray(data)
            ? data
            : []
        const filtered = list.filter((p: any) => (p.propertyId ?? p.id) !== propertyId)
        if (!ignore) setMoreCityProps(filtered)
      } catch (_) {
        if (!ignore) setMoreCityProps([])
      } finally {
        if (!ignore) setMoreLoading(false)
      }
    }
    loadMore()
    return () => {
      ignore = true
    }
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
        if (!ignore) setReviewsError(e?.message || "Failed to load reviews")
      } finally {
        if (!ignore) setReviewsLoading(false)
      }
    }
    loadReviews()
    return () => {
      ignore = true
    }
  }, [propertyId, reviewsPage, filterRating, filterVerified])

  // Check availability when dates change
  useEffect(() => {
    let ignore = false
    async function check() {
      if (!propertyId || !startDate || !endDate) {
        setIsAvailable(null)
        setAvailabilityNote(null)
        return
      }
      try {
        const qs = new URLSearchParams({
          start: new Date(startDate).toISOString(),
          end: new Date(endDate).toISOString(),
        })
        const res = await fetch(`/api/properties/${propertyId}/availability-check?` + qs.toString())
        const data = await res.json()
        if (ignore) return
        const available = !!data?.data?.available
        setIsAvailable(available)
        if (!available) {
          const byBooking = data?.data?.bookingConflict
          const byIcal = data?.data?.icalConflict
          if (byBooking && byIcal)
            setAvailabilityNote("Dates blocked due to an existing booking and an external calendar block.")
          else if (byBooking) setAvailabilityNote("Dates blocked due to an existing booking.")
          else if (byIcal) setAvailabilityNote("Dates blocked by the property's external calendar (iCal).")
          else setAvailabilityNote("Selected dates are not available.")
        } else {
          setAvailabilityNote("Dates appear to be available.")
        }
      } catch (_) {
        if (!ignore) {
          setIsAvailable(null)
          setAvailabilityNote(null)
        }
      }
    }
    check()
    return () => {
      ignore = true
    }
  }, [propertyId, startDate, endDate])

  async function submitReview() {
    if (!user) {
      alert("Please login to write a review")
      window.location.hash = "#/login"
      return
    }
    if (!propertyId) return
    if (newReviewRating < 1 || newReviewRating > 5) {
      alert("Rating must be between 1 and 5")
      return
    }
    setSubmittingReview(true)
    try {
      await ReviewsAPI.add(propertyId, { rating: newReviewRating, comment: newReviewComment || undefined })
      setNewReviewComment("")
      setNewReviewRating(5)
      // reload reviews
      setReviewsPage(1)
      const refreshed = await ReviewsAPI.listForProperty(propertyId, {
        page: 1,
        limit: 10,
        rating: filterRating,
        verified: filterVerified,
      })
      const list = Array.isArray((refreshed as any).reviews)
        ? (refreshed as any).reviews
        : Array.isArray(refreshed)
          ? refreshed
          : []
      setReviews(list)
      alert("Review submitted")
    } catch (e: any) {
      alert(e?.message || "Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  // Compute images list from property in a stable hook before any conditional returns
  const images = useMemo<string[]>(() => {
    const media = Array.isArray(property?.media) ? property.media : []
    const arr: string[] = media
      .map((m: any) => {
        if (typeof m === "string") return m
        if (m && typeof m === "object") {
          return m.url || m.src || m.image || ""
        }
        return ""
      })
      .filter((u: any) => typeof u === "string" && u.trim().length > 0)
    if (arr.length === 0 && typeof property?.coverImageUrl === "string" && property.coverImageUrl.trim() !== "") {
      return [property.coverImageUrl]
    }
    return arr
  }, [property])

  // Carousel state and helpers (must be declared unconditionally)
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (idx >= images.length) setIdx(0)
  }, [images.length, idx])
  function prev() {
    setIdx((i) => (images.length ? (i - 1 + images.length) % images.length : 0))
  }
  function next() {
    setIdx((i) => (images.length ? (i + 1) % images.length : 0))
  }


  async function book() {
    if (!user) {
      alert("Please login to book")
      window.location.hash = "#/login"
      return
    }
    if (!propertyId) return
    if (!startDate || !endDate) {
      alert("Please select start and end dates")
      return
    }
    if (new Date(startDate) >= new Date(endDate)) {
      alert("End date must be after start date")
      return
    }
    setBookingLoading(true)
    setSuccessMsg(null)
    try {
      const startISO = new Date(startDate).toISOString()
      const endISO = new Date(endDate).toISOString()
      await BookingsAPI.create({
        propertyId,
        startDate: startISO,
        endDate: endISO,
        guests,
        specialRequests: specialRequests || undefined,
      })
      setSuccessMsg("Booking requested successfully. The property owner/agent will see your details with this booking.")
    } catch (e: any) {
      alert(e?.message || "Booking failed")
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-card to-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground font-medium">Loading your luxury escape…</div>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-card to-background p-10">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-serif font-bold mb-4 text-foreground">Property not found</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">{error || "We could not load this property."}</p>
          <a
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            href="#/"
          >
            Return Home
          </a>
        </div>
      </div>
    )
  }

  const amenities = [
    { icon: Wifi, label: "High-speed WiFi" },
    { icon: Car, label: "Private parking" },
    { icon: Coffee, label: "Coffee machine" },
    { icon: Tv, label: "Smart TV" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Full Screen Hero Image */}
      <div className="relative w-full h-screen">
        {images.length > 0 ? (
          <img
            src={images[idx] || "/placeholder.svg"}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">🏠</div>
              <div className="text-xl">No images available</div>
            </div>
          </div>
        )}
        
        {/* Navigation Overlay */}
        <div className="absolute top-0 left-0 right-0 bg-black/20 backdrop-blur-sm">
          {/* <div className="max-w-7xl mx-auto px-6 py-4">
            <a
              href="#/"
              className="inline-flex items-center gap-2 text-white hover:text-gray-200 transition-colors font-medium"
            >
              <span className="text-xl">←</span>
              <span>Back to Properties</span>
            </a>
          </div> */}
        </div>

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300"
            >
              <span className="text-xl">‹</span>
            </button>
            <button
              onClick={next}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300"
            >
              <span className="text-xl">›</span>
            </button>
          </>
        )}

        {/* Property Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{property.title}</h1>
            <div className="flex items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">{property.city}, {property.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{property.avgRating}</span>
                <span>({property._count?.reviews || 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="bg-white pt-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                    i === idx 
                      ? "ring-2 ring-blue-500 shadow-lg scale-105" 
                      : "hover:shadow-md hover:scale-102"
                  }`}
                >
                  <img
                    src={src || "/placeholder.svg"}
                    alt={`${property.title}-${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
<div className="max-w-7xl mx-auto px-6 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <div className="lg:col-span-2">
      
          {/* Back Button */}
          <div className="mb-8">
            <a
              href="#/"
              className="inline-flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-all duration-300 font-medium group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-all duration-300">
                <span className="text-lg">←</span>
              </div>
              <span className="text-lg">Back to Properties</span>
            </a>
          </div>
      
          {/* Main Content */}
          <div className="space-y-8">
            
            {/* Property Features */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-8 border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Property Features</h2>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white/90 transition-all duration-300 group">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-slate-900 font-semibold text-lg">{property.maxGuests}</span>
                    <p className="text-slate-600 text-sm">guests</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white/90 transition-all duration-300 group">
                  <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <Bed className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-slate-900 font-semibold text-lg">{property.bedrooms}</span>
                    <p className="text-slate-600 text-sm">bedrooms</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white/90 transition-all duration-300 group">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Bath className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-slate-900 font-semibold text-lg">{property.bathrooms}</span>
                    <p className="text-slate-600 text-sm">bathrooms</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white/90 transition-all duration-300">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <div className="w-6 h-6 bg-amber-600 rounded-md"></div>
                  </div>
                  <div>
                    <span className="text-slate-900 font-semibold text-lg">{property.propertyType}</span>
                    <p className="text-slate-600 text-sm">type</p>
                  </div>
                </div>
              </div>
              
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">{property.description}</p>
              </div>
            </div>
      
            {/* Amenities */}
            <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-8 border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Amenities</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {amenities.map((amenity, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200/50 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 transition-colors">
                      <amenity.icon className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <span className="text-slate-900 font-medium group-hover:text-emerald-900 transition-colors">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>
      
            {/* Reviews Section */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full"></div>
                  <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Guest Reviews</h2>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                  <div className="p-1 bg-amber-100 rounded-full">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-xl font-bold text-slate-800">{property.avgRating}</span>
                  <span className="text-slate-600">({property._count?.reviews || 0} reviews)</span>
                </div>
              </div>
      
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 mb-8 p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-slate-700">Rating</label>
                  <select
                    className="border border-slate-300 rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    value={filterRating ?? ""}
                    onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">All</option>
                    <option value="5">5 stars</option>
                    <option value="4">4+ stars</option>
                    <option value="3">3+ stars</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={!!filterVerified}
                    onChange={(e) => setFilterVerified(e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="verified" className="text-sm font-semibold text-slate-700">
                    Verified only
                  </label>
                </div>
                <button
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold px-3 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200"
                  onClick={() => {
                    setFilterRating(undefined)
                    setFilterVerified(undefined)
                    setReviewsPage(1)
                  }}
                >
                  Reset filters
                </button>
              </div>
      
              {/* Reviews List */}
              {reviewsLoading && <div className="text-slate-600 text-center py-8">Loading reviews…</div>}
              {reviewsError && <div className="text-red-600 text-sm mb-4 p-4 bg-red-50 rounded-lg border border-red-200">{reviewsError}</div>}
              {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                <div className="text-slate-600 text-center py-12 bg-slate-50 rounded-xl">
                  No reviews yet. Be the first to review this property.
                </div>
              )}
      
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-lg">
                            {review.user?.name?.charAt(0) || "G"}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-lg">{review.user?.name || "Guest"}</div>
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                                />
                              ))}
                            </div>
                            <span>•</span>
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            {review.isVerified && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full text-xs">Verified</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {review.comment && <p className="text-slate-700 leading-relaxed mb-4 text-lg">{review.comment}</p>}
                    {review.adminResponse && (
                      <div className="bg-blue-50/50 rounded-xl p-4 border-l-4 border-blue-500">
                        <div className="text-sm font-semibold text-slate-700 mb-2">Owner response</div>
                        <p className="text-slate-700">{review.adminResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
      
              {reviewsHasMore && (
                <div className="text-center mt-8">
                  <button
                    className="text-blue-600 hover:text-blue-800 font-semibold px-6 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all duration-300"
                    onClick={() => setReviewsPage((p) => p + 1)}
                  >
                    Load more reviews
                  </button>
                </div>
              )}
      
              {/* Add Review */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Write a review</h3>
                {!user ? (
                  <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border border-slate-200">
                    <p className="text-slate-600 mb-6 text-lg">Share your experience with other travelers</p>
                    <a
                      href="#/login"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Login to write a review
                    </a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Rating</label>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button key={i} onClick={() => setNewReviewRating(i + 1)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <Star
                              className={`w-8 h-8 ${i < newReviewRating ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-300"} transition-colors`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Comment (optional)</label>
                      <textarea
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        rows={5}
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="Share your experience..."
                      />
                    </div>
                    <button
                      onClick={submitReview}
                      disabled={submittingReview}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl px-8 py-4 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      {submittingReview ? "Submitting…" : "Submit review"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      
        {/* Professional Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-8 border border-slate-200/50 sticky top-24 shadow-xl hover:shadow-2xl transition-all duration-300 max-w-sm ml-auto">
            <div className="mb-8">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">${property.price}</span>
                <span className="text-slate-600 text-lg font-medium">/ night</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>Instant booking: {property.instantBooking ? 
                  <span className="text-emerald-600 font-semibold">Available</span> : 
                  <span className="text-amber-600 font-semibold">Request required</span>
                }</span>
              </div>
            </div>
      
            {successMsg && (
              <div className="mb-6 p-4 text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
                {successMsg}
              </div>
            )}
      
            {availabilityNote && (
              <div
                className={`mb-6 p-4 text-sm rounded-xl border ${isAvailable ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-amber-50 border-amber-200 text-amber-800"}`}
              >
                {availabilityNote}
              </div>
            )}
      
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Check-in</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Check-out</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
      
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Guests</label>
                <select
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value) || 1)}
                >
                  {Array.from({ length: property.maxGuests }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? "guest" : "guests"}
                    </option>
                  ))}
                </select>
              </div>
      
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Special requests (optional)
                </label>
                <textarea
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  rows={4}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requirements..."
                />
              </div>
      
              <button
                onClick={book}
                disabled={bookingLoading || isAvailable === false}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {bookingLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : isAvailable === false ? (
                  "Dates not available"
                ) : (
                  `Request to book • $${property.price}`
                )}
              </button>
      
              <p className="text-xs text-slate-600 text-center leading-relaxed">
                You won't be charged yet. The owner will review your booking request.
              </p>
            </div>
          </div>
        </div>
        
        {/* More Properties */}
        <div className="lg:col-span-3 mt-20">
          <h2 className="text-4xl font-bold text-slate-800 mb-10 tracking-tight">More luxury stays in {property.city}</h2>
          {moreLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
                  <div className="h-48 bg-slate-200 rounded-xl mb-6" />
                  <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : moreCityProps.length === 0 ? (
            <div className="text-center py-16 text-slate-600 bg-slate-50 rounded-2xl">No other properties found in this city.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {moreCityProps.map((p) => (
                <a
                  key={p.id}
                  href={`#/properties/${p.propertyId || p.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-slate-300"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={
                        (p.media && p.media[0]?.url) ||
                        p.media?.[0] ||
                        "/placeholder.svg?height=300&width=400&query=luxury property"
                      }
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-3 text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-slate-800">${p.price}</span>
                      <span className="text-slate-600 font-medium">/ night</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      
        {/* Owner/Agent Tools */}
        {user &&
          (user.role === "OWNER" || user.role === "AGENT" || user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <div className="lg:col-span-3 mt-20 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-8 border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Property Management Tools</h3>
              <p className="text-slate-600 mb-8 text-lg">
                Sync external calendars to manage availability across platforms.
              </p>
      
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    value={icalUrl}
                    onChange={(e) => setIcalUrl(e.target.value)}
                    placeholder="https://calendar.example.com/calendar.ics"
                    className="flex-1 border border-slate-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  />
                  <button
                    disabled={icalLoading || !icalUrl}
                    onClick={async () => {
                      try {
                        setIcalLoading(true)
                        setIcalStatus(null)
                        const res = await fetch(`/api/properties/${property.id}/ical/sync`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ url: icalUrl }),
                        })
                        const data = await res.json()
                        if (data?.success) setIcalStatus(`Synced successfully. Events: ${data?.data?.events ?? 0}`)
                        else setIcalStatus(data?.message || "Sync failed")
                      } catch (e: any) {
                        setIcalStatus(e?.message || "Sync failed")
                      } finally {
                        setIcalLoading(false)
                      }
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 font-semibold transition-all duration-300 whitespace-nowrap shadow-lg hover:shadow-xl"
                  >
                    {icalLoading ? "Syncing…" : "Sync Calendar"}
                  </button>
                </div>
      
                {icalStatus && <div className="p-4 bg-white/70 backdrop-blur-sm rounded-xl text-sm border border-white/50">{icalStatus}</div>}
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
