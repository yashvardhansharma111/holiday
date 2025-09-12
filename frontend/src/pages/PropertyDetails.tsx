"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { PublicPropertiesAPI, BookingsAPI, ReviewsAPI } from "../lib/api"
import { useAuth } from "../context/auth"
import { Star, MapPin, Users, Bed, Bath, Wifi, Car, Coffee, Tv, Heart, Share2, Calendar, Clock } from "lucide-react"

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
  const [icalBlocks, setIcalBlocks] = useState<any[] | null>(null)
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
  const [isLiked, setIsLiked] = useState(false)

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

  // basic touch swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  function onTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX)
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX == null) return
    const dx = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(dx) > 40) {
      dx < 0 ? next() : prev()
    }
    setTouchStartX(null)
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
    <div className="min-h-screen bg-gradient-to-br from-card/30 to-background">
      {/* Navigation */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <a
            href="#/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Properties
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 text-balance leading-tight">
                {property.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">
                    {property.city}, {property.country}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-medium">{property.avgRating}</span>
                  <span>({property._count?.reviews || 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {images.length > 0 ? (
              <div className="space-y-4">
                <div
                  className="relative w-full overflow-hidden rounded-2xl bg-muted shadow-2xl"
                  style={{ height: "600px" }}
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                >
                  <img
                    src={images[idx] || "/placeholder.svg"}
                    alt={property.title}
                    className="w-full h-full object-cover object-center"
                    style={{ objectPosition: "center" }}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        aria-label="Previous image"
                        onClick={prev}
                        className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-full w-14 h-14 flex items-center justify-center border border-white/20 shadow-2xl transition-all hover:scale-110 duration-300"
                      >
                        <span className="text-2xl font-light">‹</span>
                      </button>
                      <button
                        aria-label="Next image"
                        onClick={next}
                        className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-full w-14 h-14 flex items-center justify-center border border-white/20 shadow-2xl transition-all hover:scale-110 duration-300"
                      >
                        <span className="text-2xl font-light">›</span>
                      </button>
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
                        {images.slice(0, 6).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setIdx(i)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${i === idx ? "bg-white scale-125 shadow-lg" : "bg-white/50 hover:bg-white/80"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {images.slice(0, 12).map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setIdx(i)}
                        className={`relative overflow-hidden rounded-xl aspect-square transition-all hover:scale-105 duration-300 shadow-lg ${i === idx ? "ring-3 ring-primary ring-offset-2 shadow-xl" : "hover:shadow-xl"}`}
                      >
                        <img
                          src={src || "/placeholder.svg"}
                          alt={`${property.title}-${i + 1}`}
                          className="w-full h-full object-cover object-center"
                        />
                        {i === idx && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full shadow-lg" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-muted-foreground shadow-inner">
                <div className="text-center">
                  <div className="text-4xl mb-2">🏠</div>
                  <div>No images available</div>
                </div>
              </div>
            )}

            {/* Property Details */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-2xl font-serif font-bold mb-4">About this property</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>{property.maxGuests} guests</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bed className="w-5 h-5" />
                  <span>{property.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bath className="w-5 h-5" />
                  <span>{property.bathrooms} bathrooms</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm font-medium">{property.propertyType}</span>
                </div>
              </div>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-2xl font-serif font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <amenity.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold">Guest Reviews</h2>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-primary text-primary" />
                  <span className="text-lg font-bold">{property.avgRating}</span>
                  <span className="text-muted-foreground">({property._count?.reviews || 0} reviews)</span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-muted-foreground">Rating</label>
                  <select
                    className="border border-border rounded-lg px-3 py-1 text-sm bg-background"
                    value={filterRating ?? ""}
                    onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">All</option>
                    <option value="5">5 stars</option>
                    <option value="4">4+ stars</option>
                    <option value="3">3+ stars</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={!!filterVerified}
                    onChange={(e) => setFilterVerified(e.target.checked ? true : undefined)}
                    className="rounded border-border"
                  />
                  <label htmlFor="verified" className="text-sm font-medium text-muted-foreground">
                    Verified only
                  </label>
                </div>
                <button
                  className="text-sm text-primary hover:text-primary/80 font-medium"
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
              {reviewsLoading && <div className="text-muted-foreground">Loading reviews…</div>}
              {reviewsError && <div className="text-destructive text-sm mb-4">{reviewsError}</div>}
              {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                <div className="text-muted-foreground text-center py-8">
                  No reviews yet. Be the first to review this property.
                </div>
              )}

              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-background rounded-lg p-4 border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-medium text-sm">
                            {review.user?.name?.charAt(0) || "G"}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{review.user?.name || "Guest"}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`}
                                />
                              ))}
                            </div>
                            <span>•</span>
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            {review.isVerified && (
                              <>
                                <span>•</span>
                                <span className="text-green-600 font-medium">Verified</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {review.comment && <p className="text-foreground leading-relaxed mb-3">{review.comment}</p>}
                    {review.adminResponse && (
                      <div className="bg-muted/50 rounded-lg p-3 border-l-4 border-primary">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Owner response</div>
                        <p className="text-sm">{review.adminResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {reviewsHasMore && (
                <div className="text-center mt-6">
                  <button
                    className="text-primary hover:text-primary/80 font-medium"
                    onClick={() => setReviewsPage((p) => p + 1)}
                  >
                    Load more reviews
                  </button>
                </div>
              )}

              {/* Add Review */}
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-lg font-serif font-bold mb-4">Write a review</h3>
                {!user ? (
                  <div className="text-center py-6 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground mb-3">Share your experience with other travelers</p>
                    <a
                      href="#/login"
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      Login to write a review
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Rating</label>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button key={i} onClick={() => setNewReviewRating(i + 1)} className="p-1">
                            <Star
                              className={`w-6 h-6 ${i < newReviewRating ? "fill-primary text-primary" : "text-muted hover:text-primary/50"} transition-colors`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Comment (optional)</label>
                      <textarea
                        className="w-full border border-border rounded-lg px-4 py-3 bg-background resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        rows={4}
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="Share your experience..."
                      />
                    </div>
                    <button
                      onClick={submitReview}
                      disabled={submittingReview}
                      className="bg-primary text-primary-foreground rounded-lg px-6 py-3 hover:bg-primary/90 disabled:opacity-60 font-medium transition-colors"
                    >
                      {submittingReview ? "Submitting…" : "Submit review"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 border border-border sticky top-24 shadow-lg">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-serif font-bold">${property.price}</span>
                  <span className="text-muted-foreground">/ night</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Instant booking: {property.instantBooking ? "Available" : "Request required"}</span>
                </div>
              </div>

              {successMsg && (
                <div className="mb-4 p-4 text-sm bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  {successMsg}
                </div>
              )}

              {availabilityNote && (
                <div
                  className={`mb-4 p-4 text-sm rounded-lg border ${isAvailable ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-amber-50 border-amber-200 text-amber-800"}`}
                >
                  {availabilityNote}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Check-in</label>
                    <input
                      type="date"
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Check-out</label>
                    <input
                      type="date"
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Guests</label>
                  <select
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
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
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Special requests (optional)
                  </label>
                  <textarea
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requirements..."
                  />
                </div>

                <button
                  onClick={book}
                  disabled={bookingLoading || isAvailable === false}
                  className="group relative w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl px-8 py-5 hover:from-primary/90 hover:to-primary disabled:opacity-60 font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <div className="relative flex items-center justify-center gap-3">
                    {bookingLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent"></div>
                        <span>Processing your request...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5 border-black" />
                        <span>Reserve this luxury stay</span>
                      </>
                    )}
                  </div>
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <a
                    href={`/api/properties/${property.id}/availability.ics`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Download availability calendar
                  </a>
                </div>

                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  You won't be charged yet. The owner will review your booking request.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* More Properties */}
        <div className="mt-16">
          <h2 className="text-3xl font-serif font-bold mb-8">More luxury stays in {property.city}</h2>
          {moreLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl p-4 border border-border animate-pulse">
                  <div className="h-48 bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : moreCityProps.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No other properties found in this city.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moreCityProps.map((p) => (
                <a
                  key={p.id}
                  href={`#/properties/${p.propertyId || p.id}`}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={
                        (p.media && p.media[0]?.url) ||
                        p.media?.[0] ||
                        "/placeholder.svg?height=300&width=400&query=luxury property"
                      }
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">${p.price}</span>
                      <span className="text-muted-foreground text-sm">/ night</span>
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
            <div className="mt-16 bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-xl font-serif font-bold mb-4">Property Management Tools</h3>
              <p className="text-muted-foreground mb-6">
                Sync external calendars to manage availability across platforms.
              </p>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={icalUrl}
                    onChange={(e) => setIcalUrl(e.target.value)}
                    placeholder="https://calendar.example.com/calendar.ics"
                    className="flex-1 border border-border rounded-lg px-4 py-2 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
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
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 font-medium transition-colors whitespace-nowrap"
                  >
                    {icalLoading ? "Syncing…" : "Sync Calendar"}
                  </button>
                </div>

                {icalStatus && <div className="p-3 bg-muted/50 rounded-lg text-sm">{icalStatus}</div>}
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
