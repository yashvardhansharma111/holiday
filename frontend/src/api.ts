// Centralized API URLs
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

export const API_URLS = {
  auth: {
    signup: `${API_BASE}/auth/signup`,
    login: `${API_BASE}/auth/login`,
    me: `${API_BASE}/auth/me`,
  },
  properties: {
    base: `${API_BASE}/properties`,
    featured: `${API_BASE}/properties/featured`,
    popular: `${API_BASE}/properties/popular`,
    updateFeatureFlags: (id: number) => `${API_BASE}/properties/${id}/feature-flags`,
  },
  destinations: {
    regions: `${API_BASE}/destinations/regions`,
    regionDestinations: (regionSlug: string) => `${API_BASE}/destinations/regions/${regionSlug}/destinations`,
    adminRegions: `${API_BASE}/destinations/admin/regions`,
    adminDestinations: `${API_BASE}/destinations/admin/destinations`,
  },
  bookings: `${API_BASE}/bookings`,
  reviews: `${API_BASE}/reviews`,
  admin: `${API_BASE}/admin`,
};

// API Service Functions
export const PropertiesAPI = {
  // Get featured properties
  getFeatured: async (limit = 3) => {
    const response = await fetch(`${API_URLS.properties.featured}?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch featured properties');
    return response.json();
  },

  // Get popular properties
  getPopular: async (limit = 3) => {
    const response = await fetch(`${API_URLS.properties.popular}?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch popular properties');
    return response.json();
  },

  // Update feature flags (Agent only)
  updateFeatureFlags: async (id: number, flags: { isFeatured?: boolean; isPopular?: boolean }, token: string) => {
    const response = await fetch(API_URLS.properties.updateFeatureFlags(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(flags),
    });
    if (!response.ok) throw new Error('Failed to update feature flags');
    return response.json();
  },
};

// Destinations API Service Functions
export const DestinationsAPI = {
  // Get all regions with destinations (Public)
  getRegionsWithDestinations: async () => {
    const response = await fetch(API_URLS.destinations.regions);
    if (!response.ok) throw new Error('Failed to fetch regions with destinations');
    return response.json();
  },

  // Get destinations by region (Public)
  getDestinationsByRegion: async (regionSlug: string) => {
    const response = await fetch(API_URLS.destinations.regionDestinations(regionSlug));
    if (!response.ok) throw new Error('Failed to fetch destinations for region');
    return response.json();
  },

  // Admin functions
  admin: {
    // Get all regions (Admin only)
    getAllRegions: async (token: string) => {
      const response = await fetch(API_URLS.destinations.adminRegions, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch all regions');
      return response.json();
    },

    // Create region (Admin only)
    createRegion: async (data: any, token: string) => {
      const response = await fetch(API_URLS.destinations.adminRegions, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create region');
      return response.json();
    },

    // Update region (Admin only)
    updateRegion: async (id: number, data: any, token: string) => {
      const response = await fetch(`${API_URLS.destinations.adminRegions}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update region');
      return response.json();
    },

    // Delete region (Admin only)
    deleteRegion: async (id: number, token: string) => {
      const response = await fetch(`${API_URLS.destinations.adminRegions}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete region');
      return response.json();
    },

    // Get all destinations (Admin only)
    getAllDestinations: async (token: string) => {
      const response = await fetch(API_URLS.destinations.adminDestinations, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch all destinations');
      return response.json();
    },

    // Create destination (Admin only)
    createDestination: async (data: any, token: string) => {
      const response = await fetch(API_URLS.destinations.adminDestinations, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create destination');
      return response.json();
    },

    // Update destination (Admin only)
    updateDestination: async (id: number, data: any, token: string) => {
      const response = await fetch(`${API_URLS.destinations.adminDestinations}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update destination');
      return response.json();
    },

    // Delete destination (Admin only)
    deleteDestination: async (id: number, token: string) => {
      const response = await fetch(`${API_URLS.destinations.adminDestinations}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete destination');
      return response.json();
    },
  },
};
