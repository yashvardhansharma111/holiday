import prisma from '../db.js'
import { errorResponse, HTTP_STATUS } from '../utils/responses.js'
import { createEvents } from 'ics'
import ical from 'node-ical'
import { IcalCache } from '../services/icalCache.service.js'

// Helper: convert a JS Date to [YYYY, M, D, H, M] array expected by ics
function toDateArray(date) {
  const d = new Date(date)
  return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()]
}

// POST /api/properties/:id/ical/sync  body: { url: string, force?: boolean }
export const syncPropertyIcal = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { url, urls, force } = req.body || {}
    if (!Number.isFinite(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('Invalid property id', HTTP_STATUS.BAD_REQUEST))
    }
    const list = Array.isArray(urls) && urls.length ? urls : (url ? [url] : [])
    if (list.length === 0 || list.some((u) => !/^https?:\/\//i.test(String(u)))) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('Invalid iCal URL(s)', HTTP_STATUS.BAD_REQUEST))
    }
    const ttl = Number(process.env.ICAL_CACHE_TTL_MS || 3 * 60 * 60 * 1000)
    if (!force && IcalCache.isFresh(id, ttl)) {
      const cached = IcalCache.get(id)
      return res.json({ success: true, message: 'Cache is fresh', data: { urls: cached?.urls || [], events: cached?.events?.length || 0, fetchedAt: cached?.fetchedAt } })
    }
    const feedsData = []
    for (const target of list) {
      const data = await ical.async.fromURL(target, { timeout: 10000 })
      const events = []
      for (const k of Object.keys(data)) {
        const v = data[k]
        if (v.type === 'VEVENT' && v.start && v.end) {
          events.push({ start: new Date(v.start), end: new Date(v.end), summary: v.summary || null, uid: v.uid || null })
        }
      }
      feedsData.push({ url: target, events, fetchedAt: Date.now() })
    }
    IcalCache.upsertMerged(id, list, feedsData)
    const meta = IcalCache.getMeta(id)
    return res.json({ success: true, message: 'iCal synced', data: meta })
  } catch (error) {
    console.error('syncPropertyIcal error:', error)
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to sync iCal', HTTP_STATUS.INTERNAL_SERVER_ERROR))
  }
}

// GET /api/properties/:id/ical/blocks?from=ISO&to=ISO
export const getPropertyIcalBlocks = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { from, to } = req.query
    const cached = IcalCache.get(id)
    if (!cached) return res.json({ success: true, message: 'No cached iCal', data: [] })
    if (!from || !to) return res.json({ success: true, message: 'All cached events', data: cached.events })
    const s = new Date(String(from))
    const e = new Date(String(to))
    const list = (cached.events || []).filter(ev => new Date(ev.start) < e && new Date(ev.end) > s)
    return res.json({ success: true, data: list })
  } catch (error) {
    console.error('getPropertyIcalBlocks error:', error)
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to read iCal blocks', HTTP_STATUS.INTERNAL_SERVER_ERROR))
  }
}

// GET /api/properties/:id/availability.ics
export const exportPropertyAvailabilityICS = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('Invalid property id', HTTP_STATUS.BAD_REQUEST))
    }

    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true, title: true, city: true, country: true, address: true }
    })
    if (!property) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse('Property not found', HTTP_STATUS.NOT_FOUND))
    }

    // Use bookings as unavailable windows (confirmed or pending)
    const bookings = await prisma.booking.findMany({
      where: { propertyId: id, status: { in: ['CONFIRMED', 'PENDING'] } },
      select: { id: true, startDate: true, endDate: true, userId: true }
    })

    const events = bookings.map((b) => ({
      start: toDateArray(b.startDate),
      end: toDateArray(b.endDate),
      title: `Unavailable – ${property.title}`,
      description: `Booking window blocked. Booking ID: ${b.id}`,
      location: [property.address, property.city, property.country].filter(Boolean).join(', '),
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      productId: 'book-holiday-rentals',
      uid: `property-${property.id}-booking-${b.id}@bhr`
    }))

    createEvents(events, (err, ics) => {
      if (err) {
        console.error('ICS generation error:', err)
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to generate calendar', HTTP_STATUS.INTERNAL_SERVER_ERROR))
      }
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="property-${property.id}-availability.ics"`)
      return res.send(ics)
    })
  } catch (error) {
    console.error('exportPropertyAvailabilityICS error:', error)
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to export availability', HTTP_STATUS.INTERNAL_SERVER_ERROR))
  }
}

// GET /api/bookings/:id/event.ics
export const exportBookingICS = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse('Invalid booking id', HTTP_STATUS.BAD_REQUEST))
    }
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { property: { select: { id: true, title: true, address: true, city: true, country: true } } }
    })
    if (!booking) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse('Booking not found', HTTP_STATUS.NOT_FOUND))
    }

    const event = {
      start: toDateArray(booking.startDate),
      end: toDateArray(booking.endDate),
      title: `Stay at ${booking.property.title}`,
      description: `Booking #${booking.id}`,
      location: [booking.property.address, booking.property.city, booking.property.country].filter(Boolean).join(', '),
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      productId: 'book-holiday-rentals',
      uid: `booking-${booking.id}@bhr`
    }

    createEvents([event], (err, ics) => {
      if (err) {
        console.error('ICS generation error:', err)
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to generate booking event', HTTP_STATUS.INTERNAL_SERVER_ERROR))
      }
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="booking-${booking.id}.ics"`)
      return res.send(ics)
    })
  } catch (error) {
    console.error('exportBookingICS error:', error)
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to export booking', HTTP_STATUS.INTERNAL_SERVER_ERROR))
  }
}
