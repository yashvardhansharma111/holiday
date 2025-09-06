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
  users: `${API_BASE}/admin/users`,
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

// Admin API Service Functions
export const AdminAPI = {
  // Get auth token from localStorage
  getToken: () => localStorage.getItem('jwt') || '',

  // List all users
  listUsers: async (params?: { search?: string }) => {
    const token = AdminAPI.getToken()
    const url = new URL(API_URLS.users)
    if (params?.search) url.searchParams.set('search', params.search)
    
    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  },

  // Create admin user (Super Admin only)
  createAdminUser: async (data: { name: string; email: string; password: string }) => {
    const token = AdminAPI.getToken()
    const response = await fetch(`${API_URLS.admin}/users/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create admin user')
    return response.json()
  },

  // Create agent user (Super Admin only)
  createAgentUser: async (data: { name: string; email: string; password: string }) => {
    const token = AdminAPI.getToken()
    const response = await fetch(`${API_URLS.admin}/users/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create agent user')
    return response.json()
  },

  // Update user (Super Admin only)
  updateUser: async (id: number, data: any) => {
    const token = AdminAPI.getToken()
    const response = await fetch(`${API_URLS.users}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update user')
    return response.json()
  },

  // Delete user (Super Admin only)
  deleteUser: async (id: number) => {
    const token = AdminAPI.getToken()
    const response = await fetch(`${API_URLS.users}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to delete user')
    return response.json()
  },

  // Get approval queue
  approvalQueue: async () => {
    const token = AdminAPI.getToken()
    const response = await fetch(`${API_URLS.admin}/properties/queue`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch approval queue')
    return response.json()
  },

  // Approve property
  approveProperty: async (id: number, data: { status: 'LIVE' | 'REJECTED' | 'SUSPENDED' }) => {
    const token = AdminAPI.getToken()
    const response = await fetch(`${API_URLS.admin}/properties/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to approve property')
    return response.json()
  },

  // Get analytics
  analytics: async () => {
    const token = AdminAPI.getToken()
    const response = await fetch(`${API_URLS.admin}/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch analytics')
    return response.json()
  },

  // Plans management (removed as requested)
  listPlans: async () => {
    throw new Error('Plans functionality has been removed')
  },

  createPlan: async () => {
    throw new Error('Plans functionality has been removed')
  },

  deletePlan: async () => {
    throw new Error('Plans functionality has been removed')
  },

  // Subscriptions management (removed as requested)
  grantUserSubscription: async () => {
    throw new Error('Subscriptions functionality has been removed')
  },

  cancelUserSubscription: async () => {
    throw new Error('Subscriptions functionality has been removed')
  },

  setSubscriptionPaidStatus: async () => {
    throw new Error('Subscriptions functionality has been removed')
  },

  // Health check (removed as requested)
  health: async () => {
    throw new Error('Health check functionality has been removed')
  },

  // Property management for admin/super admin
  listAllProperties: async (params?: { search?: string; status?: string }) => {
    const token = AdminAPI.getToken()
    const url = new URL(`${API_URLS.admin}/properties`)
    if (params?.search) url.searchParams.set('search', params.search)
    if (params?.status) url.searchParams.set('status', params.status)
    
    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch properties')
    return response.json()
  },

  // Create property (Admin/Super Admin - no approval needed)
  createProperty: async (data: any) => {
    const token = AdminAPI.getToken()
    const response = await fetch(`${API_URLS.admin}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ ...data, status: 'LIVE' }), // Admin properties go live immediately
    })
    if (!response.ok) throw new Error('Failed to create property')
    return response.json()
  },

  // Update property (Admin/Super Admin)
  updateProperty: async (id: number, data: any) => {
    const token = AdminAPI.getToken()
    const response = await fetch(`${API_URLS.admin}/properties/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update property')
    return response.json()
  },

  // Delete property (Admin/Super Admin)
  deleteProperty: async (id: number) => {
    const token = AdminAPI.getToken()
    const response = await fetch(`${API_URLS.admin}/properties/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to delete property')
    return response.json()
  },
};
