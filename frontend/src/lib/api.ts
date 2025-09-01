export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('jwt')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path: string, options: RequestInit = {}) {
  const headers = new Headers()
  headers.set('Content-Type', 'application/json')
  if (options.headers) {
    new Headers(options.headers as HeadersInit).forEach((v, k) => headers.set(k, v))
  }
  const auth = authHeaders()
  Object.entries(auth).forEach(([k, v]) => headers.set(k, v))

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data?.success === false) {
    const message = data?.message || `Request failed (${res.status})`
    throw new Error(message)
  }
  return data?.data ?? data
}

export const AuthAPI = {
  signup: (body: { name: string; email: string; password: string; role?: 'USER' | 'OWNER' }) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me', { method: 'GET' }),
}

export const AdminAPI = {
  // Users
  listUsers: (params?: { search?: string; role?: string; isActive?: boolean; page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.role) q.set('role', params.role)
    if (typeof params?.isActive === 'boolean') q.set('isActive', String(params.isActive))
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    const qs = q.toString()
    return request(`/admin/users${qs ? `?${qs}` : ''}`, { method: 'GET' })
  },
  getUser: (id: number) => request(`/admin/users/${id}`, { method: 'GET' }),
  updateUser: (id: number, body: any) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteUser: (id: number) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  createAdminUser: (body: { name: string; email: string; password: string }) =>
    request('/admin/users/admin', { method: 'POST', body: JSON.stringify(body) }),
  createAgentUser: (body: { name: string; email: string; password: string }) =>
    request('/admin/users/agent', { method: 'POST', body: JSON.stringify(body) }),

  // Properties moderation
  approvalQueue: () => request('/admin/properties/queue', { method: 'GET' }),
  approveProperty: (id: number, body: { status: 'LIVE' | 'REJECTED' | 'SUSPENDED'; adminNotes?: string }) =>
    request(`/admin/properties/${id}/approve`, { method: 'PUT', body: JSON.stringify(body) }),

  // Subscription plans
  listPlans: () => request('/admin/subscription-plans', { method: 'GET' }),
  createPlan: (body: any) => request('/admin/subscription-plans', { method: 'POST', body: JSON.stringify(body) }),
  updatePlan: (id: number, body: any) => request(`/admin/subscription-plans/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePlan: (id: number) => request(`/admin/subscription-plans/${id}`, { method: 'DELETE' }),

  // Subscriptions management (manual)
  grantUserSubscription: (userId: number, body: any) =>
    request(`/admin/subscriptions/users/${userId}/grant`, { method: 'POST', body: JSON.stringify(body) }),
  cancelUserSubscription: (subscriptionId: number) =>
    request(`/admin/subscriptions/${subscriptionId}/cancel`, { method: 'POST' }),
  setSubscriptionPaidStatus: (subscriptionId: number, body: { paid: boolean }) =>
    request(`/admin/subscriptions/${subscriptionId}/paid`, { method: 'PUT', body: JSON.stringify(body) }),
  getUserSubscription: (userId: number) => request(`/admin/subscriptions/users/${userId}`, { method: 'GET' }),

  // Analytics and health
  analytics: () => request('/admin/analytics', { method: 'GET' }),
  health: () => request('/admin/health', { method: 'GET' }),
}

// Properties for Owner/Agent
export const PropertiesAPI = {
  myProperties: () => request('/properties/user/list', { method: 'GET' }),
  create: (body: any) => request('/properties', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: any) => request(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: number) => request(`/properties/${id}`, { method: 'DELETE' }),
  addMedia: (id: number, urls: string[]) => request(`/properties/${id}/media`, { method: 'POST', body: JSON.stringify({ media: urls }) }),
  removeMedia: (id: number, urls: string[]) => request(`/properties/${id}/media`, { method: 'DELETE', body: JSON.stringify({ media: urls }) }),
}

// Public properties browsing/search
export const PublicPropertiesAPI = {
  list: (params?: { search?: string; city?: string; country?: string; minPrice?: number; maxPrice?: number; guests?: number; bedrooms?: number; bathrooms?: number; sort?: string; page?: number; limit?: number; minRating?: number }) => {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.city) q.set('city', params.city)
    if (params?.country) q.set('country', params.country)
    if (params?.minPrice != null) q.set('minPrice', String(params.minPrice))
    if (params?.maxPrice != null) q.set('maxPrice', String(params.maxPrice))
    if (params?.guests != null) q.set('guests', String(params.guests))
    if (params?.bedrooms != null) q.set('bedrooms', String(params.bedrooms))
    if (params?.bathrooms != null) q.set('bathrooms', String(params.bathrooms))
    if (params?.minRating != null) q.set('minRating', String(params.minRating))
    if (params?.sort) q.set('sort', params.sort)
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    const qs = q.toString()
    return request(`/properties${qs ? `?${qs}` : ''}`, { method: 'GET' })
  },
  get: (id: number) => request(`/properties/${id}`, { method: 'GET' }),
  popularCities: () => request('/properties/cities', { method: 'GET' }),
}

// Media management (presigned upload for properties)
export const MediaAPI = {
  generatePresigned: async (file: File, folder = 'properties') => {
    const body = { fileType: file.type, fileName: file.name, folder }
    return request('/properties/media/presign', { method: 'POST', body: JSON.stringify(body) }) as Promise<{ presignedUrl: string; key: string; url: string }>
  },
  uploadToPresigned: async (presignedUrl: string, file: File) => {
    const headers: Record<string, string> = { 'Content-Type': file.type }
    const publicRead = String(import.meta.env.VITE_S3_PUBLIC_READ || 'false').toLowerCase() === 'true'
    if (publicRead) headers['x-amz-acl'] = 'public-read'
    const res = await fetch(presignedUrl, { method: 'PUT', headers, body: file })
    if (!res.ok) throw new Error(`S3 upload failed (${res.status})`)
    return true
  },
}

// Bookings
export const BookingsAPI = {
  create: (body: { propertyId: number; startDate: string; endDate: string; guests: number; specialRequests?: string }) =>
    request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  myBookings: (params?: { page?: number; limit?: number; status?: string }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.status) q.set('status', params.status)
    const qs = q.toString()
    return request(`/bookings/user/list${qs ? `?${qs}` : ''}`, { method: 'GET' })
  },
  propertyBookings: (propertyId: number, params?: { page?: number; limit?: number; status?: string }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.status) q.set('status', params.status)
    const qs = q.toString()
    return request(`/bookings/property/${propertyId}${qs ? `?${qs}` : ''}`, { method: 'GET' })
  },
  ownerAggregated: (params?: { page?: number; limit?: number; status?: string }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.status) q.set('status', params.status)
    const qs = q.toString()
    return request(`/bookings/owner/aggregated${qs ? `?${qs}` : ''}`, { method: 'GET' })
  },
  confirm: (id: number) => request(`/bookings/${id}/confirm`, { method: 'PUT' }),
  cancel: (id: number, reason?: string) => request(`/bookings/${id}`, { method: 'DELETE', body: JSON.stringify({ reason }) }),
}

// Reviews
export const ReviewsAPI = {
  listForProperty: (
    propertyId: number,
    params?: { page?: number; limit?: number; rating?: number; verified?: boolean }
  ) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.rating != null) q.set('rating', String(params.rating))
    if (params?.verified != null) q.set('verified', String(params.verified))
    const qs = q.toString()
    return request(`/reviews/property/${propertyId}${qs ? `?${qs}` : ''}`, { method: 'GET' })
  },
  add: (
    propertyId: number,
    body: { rating: number; comment?: string; bookingId?: number }
  ) => request(`/reviews/property/${propertyId}`, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: { rating?: number; comment?: string }) =>
    request(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: number) => request(`/reviews/${id}`, { method: 'DELETE' }),
  myReviews: (params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    const qs = q.toString()
    return request(`/reviews/user/list${qs ? `?${qs}` : ''}`, { method: 'GET' })
  },
}
