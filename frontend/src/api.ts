// Centralized API URLs
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

export const API_URLS = {
  auth: {
    signup: `${API_BASE}/auth/signup`,
    login: `${API_BASE}/auth/login`,
    me: `${API_BASE}/auth/me`,
  },
  properties: `${API_BASE}/properties`,
  bookings: `${API_BASE}/bookings`,
  reviews: `${API_BASE}/reviews`,
  admin: `${API_BASE}/admin`,
};
