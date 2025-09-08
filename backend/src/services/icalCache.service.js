// Simple in-memory iCal cache with multi-feed support. No DB changes.
// Each entry:
// {
//   urls: string[],
//   events: [{ start: Date, end: Date, summary?: string, uid?: string }], // merged
//   fetchedAt: number, // last merged fetch time
//   feeds: [{ url: string, eventsCount: number, fetchedAt: number }]
// }

import ical from 'node-ical'

const store = new Map(); // key: propertyId:number -> value object

function normalizeEvents(list) {
  return (list || []).map((e) => ({
    start: new Date(e.start),
    end: new Date(e.end),
    summary: e.summary || null,
    uid: e.uid || null,
  }))
}

function set(propertyId, payload) {
  const urls = Array.isArray(payload.urls)
    ? payload.urls.filter((u) => typeof u === 'string')
    : (payload.url ? [payload.url] : [])
  const events = normalizeEvents(payload.events)
  const feeds = Array.isArray(payload.feeds) ? payload.feeds : (payload.url
    ? [{ url: payload.url, eventsCount: events.length, fetchedAt: payload.fetchedAt || Date.now() }]
    : [])

  store.set(Number(propertyId), {
    urls,
    events,
    fetchedAt: payload.fetchedAt || Date.now(),
    feeds,
  });
}

function upsertMerged(propertyId, urls, feedsData) {
  const id = Number(propertyId)
  const prev = store.get(id) || { urls: [], events: [], fetchedAt: 0, feeds: [] }
  const urlSet = new Set([...(prev.urls || []), ...urls])

  // merge events
  const allEvents = []
  for (const f of feedsData) {
    allEvents.push(...normalizeEvents(f.events))
  }
  // simple dedupe by uid+start+end
  const seen = new Set()
  const merged = []
  for (const ev of allEvents) {
    const key = `${ev.uid || ''}|${+new Date(ev.start)}|${+new Date(ev.end)}`
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(ev)
  }
  const now = Date.now()
  const feeds = feedsData.map(f => ({ url: f.url, eventsCount: (f.events || []).length, fetchedAt: f.fetchedAt || now }))
  store.set(id, { urls: Array.from(urlSet), events: merged, fetchedAt: now, feeds })
}

function get(propertyId) {
  const v = store.get(Number(propertyId));
  if (!v) return null;
  return {
    urls: (v.urls || []).slice(),
    events: (v.events || []).slice(),
    fetchedAt: v.fetchedAt,
    feeds: (v.feeds || []).map((f) => ({ ...f })),
  };
}

function getMeta(propertyId) {
  const v = store.get(Number(propertyId));
  if (!v) return { feedCount: 0, events: 0, lastFetchedAt: null };
  return { feedCount: (v.urls || []).length, events: (v.events || []).length, lastFetchedAt: v.fetchedAt || null };
}

function clear(propertyId) {
  store.delete(Number(propertyId));
}

function isFresh(propertyId, maxAgeMs) {
  const v = store.get(Number(propertyId));
  if (!v) return false;
  return Date.now() - (v.fetchedAt || 0) <= maxAgeMs;
}

function entries() {
  return Array.from(store.entries()).map(([id, v]) => ({ propertyId: id, ...v }));
}

function getBlockedPropertyIdsInRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const ids = [];
  for (const [propertyId, v] of store.entries()) {
    const hasOverlap = (v.events || []).some((ev) => {
      const a = new Date(ev.start);
      const b = new Date(ev.end);
      return a < e && b > s; // overlap test
    });
    if (hasOverlap) ids.push(propertyId);
  }
  return ids;
}

async function refreshFeedsForProperty(id, timeoutMs) {
  const v = store.get(Number(id));
  if (!v || !Array.isArray(v.urls) || v.urls.length === 0) return;
  try {
    const feedsData = []
    for (const url of v.urls) {
      const data = await ical.async.fromURL(url, { timeout: timeoutMs || 10000 })
      const events = []
      for (const k of Object.keys(data)) {
        const item = data[k]
        if (item.type === 'VEVENT' && item.start && item.end) {
          events.push({ start: new Date(item.start), end: new Date(item.end), summary: item.summary || null, uid: item.uid || null })
        }
      }
      feedsData.push({ url, events, fetchedAt: Date.now() })
    }
    upsertMerged(id, v.urls, feedsData)
  } catch (_) {
    // swallow errors to keep background refresh non-fatal
  }
}

function refreshStaleFeedsAsync(maxAgeMs) {
  const ttl = Number(maxAgeMs || 3 * 60 * 60 * 1000)
  for (const [id, v] of store.entries()) {
    const stale = !v.fetchedAt || (Date.now() - v.fetchedAt > ttl)
    if (stale && Array.isArray(v.urls) && v.urls.length) {
      // fire and forget
      refreshFeedsForProperty(id).catch(() => {})
    }
  }
}

export const IcalCache = {
  set,
  upsertMerged,
  get,
  getMeta,
  clear,
  isFresh,
  entries,
  getBlockedPropertyIdsInRange,
  refreshStaleFeedsAsync,
  refreshFeedsForProperty,
};
