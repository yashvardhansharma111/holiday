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
  signup: (body: { name: string; email: string; password: string; role?: 'USER' | 'OWNER' | 'AGENT' }) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me', { method: 'GET' }),
}

export const AdminAPI = {
  // Users
  listUsers: () => request('/admin/users', { method: 'GET' }),
  getUser: (id: number) => request(`/admin/users/${id}`, { method: 'GET' }),
  updateUser: (id: number, body: any) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteUser: (id: number) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  createAdminUser: (body: { name: string; email: string; password: string }) =>
    request('/admin/users/admin', { method: 'POST', body: JSON.stringify(body) }),

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

// Media management (presigned upload for properties)
export const MediaAPI = {
  generatePresigned: async (file: File, folder = 'properties') => {
    const body = { fileType: file.type, fileName: file.name, folder }
    return request('/properties/media/presign', { method: 'POST', body: JSON.stringify(body) }) as Promise<{ presignedUrl: string; key: string; url: string }>
  },
  uploadToPresigned: async (presignedUrl: string, file: File) => {
    const res = await fetch(presignedUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
    if (!res.ok) throw new Error(`S3 upload failed (${res.status})`)
    return true
  },
}
