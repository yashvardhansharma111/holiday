import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/auth'
import { AdminAPI } from '../../api'
import { MediaAPI } from '../../lib/api'
import { 
  Users, 
  Clock, 
  Search,
  RefreshCw,
  Check,
  X,
  Pause,
  Shield,
  ChevronRight,
  Sparkles,
  Home,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  Star,
  Upload,
  BarChart3,
  UserPlus
} from 'lucide-react'

type TabKey = 'users' | 'queue' | 'analytics' | 'properties'

export default function SuperAdminDashboard() {
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      location.hash = '#/auth/super-admin'
    }
  }, [user?.role])

  if (user?.role !== 'SUPER_ADMIN') return null

  return <SuperAdminContent />
}

function SuperAdminContent() {
  const [active, setActive] = useState<TabKey>('users')
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  
  const tabs: { key: TabKey; label: string; icon: any; badge?: number }[] = useMemo(() => ([
    { key: 'users', label: 'Users Management', icon: Users },
    { key: 'properties', label: 'Properties', icon: Home },
    { key: 'queue', label: 'Properties Queue', icon: Clock },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-14">
      {/* Floating sidebar toggle (always visible) */}
      <button
        aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        onClick={() => setSidebarExpanded(prev => !prev)}
        className="fixed left-2 top-24 z-40 p-2 rounded-full bg-white shadow-lg border border-purple-100 hover:bg-purple-50 transition-colors"
      >
        <ChevronRight className={`w-5 h-5 text-purple-700 transition-transform ${sidebarExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-14 h-[calc(100%-56px)] bg-white border-r border-purple-100 shadow-2xl transition-all duration-300 ease-in-out z-30 ${sidebarExpanded ? 'w-72' : 'w-20'}`}>
        {/* Header */}
        <div className="relative p-6 border-b border-purple-100 bg-gradient-to-r from-red-600 to-pink-600">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Super Admin</h1>
                <p className="text-red-100 text-sm">Master Control</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className={`w-5 h-5 text-white transition-transform duration-300 ${sidebarExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-1 top-4 w-8 h-8 bg-white/10 rounded-full blur-sm"></div>
          <div className="absolute right-4 bottom-2 w-4 h-4 bg-red-300/30 rounded-full"></div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {tabs.map(t => {
            const Icon = t.icon
            const isActive = active === t.key
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`
                  group relative w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-red-50 hover:text-red-600 hover:shadow-md'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-r-full opacity-80"></div>
                )}
                
                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-red-100'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-red-600'}`} />
                </div>
                
                <div className={`flex-1 text-left transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="font-medium">{t.label}</span>
                </div>

                {/* Badge */}
                {t.badge && sidebarExpanded && (
                  <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    {t.badge}
                  </div>
                )}

                {/* Hover effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/0 group-hover:from-red-600/5 group-hover:to-pink-600/5 rounded-xl transition-all duration-300"></div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom decoration */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className={`bg-gradient-to-r from-red-100 to-pink-100 rounded-xl p-4 transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-800">Super Admin</p>
                <p className="text-xs text-gray-600">Ultimate Access</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarExpanded ? 'ml-72' : 'ml-20'} min-h-screen`}>
        {/* Top Bar (non-sticky to avoid overlapping site navbar) */}
        <div className="bg-white/70 backdrop-blur-md border-b border-purple-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                {tabs.find(t => t.key === active)?.label}
              </h2>
              <p className="text-gray-600 text-sm">Complete platform control and management</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-medium">System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="animate-fade-in">
            {active === 'users' && <UsersTab />}
            {active === 'properties' && <PropertiesTab />}
            {active === 'queue' && <QueueTab />}
            {active === 'analytics' && <AnalyticsTab />}
          </div>
        </div>
      </main>

      <style >{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

function PropertiesTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<any | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const resp = await AdminAPI.listAllProperties(search ? { search } : undefined)
      // Normalize possible paginated or direct responses
      const propertiesData = (resp as any)?.data?.data || (resp as any)?.data || resp || []
      setProperties(Array.isArray(propertiesData) ? propertiesData : [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load properties')
      setProperties([])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const deleteProperty = async (id: number) => {
    if (!confirm('Delete this property? This action cannot be undone.')) return
    try {
      await AdminAPI.deleteProperty(id)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Failed to delete property')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Properties Management</h2>
              <p className="text-red-600">Create, edit, and manage all properties</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Property
            </button>
            <button 
              onClick={load} 
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-red-100 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties by title, city, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border-0 focus:ring-0 focus:outline-none text-gray-700"
          />
          <button 
            onClick={load}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingProperty) && (
        <PropertyForm 
          property={editingProperty}
          onSave={async () => {
            setShowCreateForm(false)
            setEditingProperty(null)
            await load()
          }}
          onCancel={() => {
            setShowCreateForm(false)
            setEditingProperty(null)
          }}
        />
      )}

      {/* Properties List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse bg-white border border-red-100 rounded-xl p-6">
              <div className="h-4 bg-red-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-red-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-red-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.isArray(properties) && properties.length > 0 ? properties.map((property: any) => (
            <div key={property.id} className="bg-white border border-red-100 rounded-xl shadow-sm hover:shadow-lg hover:shadow-red-100/50 transition-all duration-300 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-red-100 rounded-lg overflow-hidden">
                    {Array.isArray(property.media) && property.media[0]?.url ? (
                      <img src={property.media[0].url} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-6 h-6 text-red-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{property.title || 'Untitled Property'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-600">{property.city}, {property.country}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-lg font-bold text-red-600">${property.price}/night</span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        property.status === 'LIVE' ? 'bg-green-100 text-green-700 border border-green-200' :
                        property.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {property.status === 'LIVE' && <Check className="w-3 h-3" />}
                        {property.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingProperty(property)}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteProperty(property.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12">
              <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4">
                <Home className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-gray-600 text-lg mb-2">No properties found</p>
              <p className="text-gray-500">Create your first property to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PropertyForm({ property, onSave, onCancel }: { property?: any; onSave: () => void; onCancel: () => void }) {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [title, setTitle] = useState(property?.title || '')
  const [description, setDescription] = useState(property?.description || '')
  const [city, setCity] = useState(property?.city || '')
  const [country, setCountry] = useState(property?.country || '')
  const [address, setAddress] = useState(property?.address || '')
  const [location, setLocation] = useState(property?.location || '')
  const [price, setPrice] = useState<number | ''>(property?.price || '')
  const [maxGuests, setMaxGuests] = useState<number | ''>(property?.maxGuests || '')
  const [bedrooms, setBedrooms] = useState<number | ''>(property?.bedrooms || '')
  const [bathrooms, setBathrooms] = useState<number | ''>(property?.bathrooms || '')
  const [propertyType, setPropertyType] = useState(property?.propertyType || 'apartment')
  const [instantBooking, setInstantBooking] = useState(property?.instantBooking || false)
  const [images, setImages] = useState<string[]>(property?.media?.map((m: any) => m.url) || [])
  // Flags and mapping
  const [isFeatured, setIsFeatured] = useState<boolean>(!!property?.isFeatured)
  const [isPopular, setIsPopular] = useState<boolean>(!!property?.isPopular)
  const [regionId, setRegionId] = useState<number | ''>((property?.regionId as number) ?? '' as any)
  const [destinationId, setDestinationId] = useState<number | ''>((property?.destinationId as number) ?? '' as any)
  const [amenities, setAmenities] = useState<string[]>(property?.amenities || [])
  const [newAmenity, setNewAmenity] = useState('')

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities(prev => [...prev, newAmenity.trim()])
      setNewAmenity('')
    }
  }

  const removeAmenity = (amenity: string) => {
    setAmenities(prev => prev.filter(a => a !== amenity))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCreating(true)
    try {
      // Basic validation
      if (title.trim().length < 5) throw new Error('Title must be at least 5 characters')
      if (description.trim().length < 20) throw new Error('Description must be at least 20 characters')
      if (location.trim().length < 5) throw new Error('Location must be at least 5 characters')
      if (images.length < 1) throw new Error('Please upload at least one image')

      const body = {
        title,
        description,
        location,
        city,
        country,
        address,
        price: Number(price),
        pricePerNight: true,
        amenities,
        media: images.map((url, idx) => ({ type: 'image', url, caption: '', isPrimary: idx === 0 })),
        maxGuests: Number(maxGuests || 1),
        bedrooms: Number(bedrooms || 1),
        bathrooms: Number(bathrooms || 1),
        propertyType,
        instantBooking,
        // optional mapping
        ...(regionId !== '' ? { regionId: Number(regionId) } : {}),
        ...(destinationId !== '' ? { destinationId: Number(destinationId) } : {}),
        // flags
        isFeatured,
        isPopular,
      }

      if (property) {
        await AdminAPI.updateProperty(property.id, body)
      } else {
        await AdminAPI.createProperty(body)
      }
      onSave()
    } catch (e: any) { 
      setError(e?.message || 'Save failed') 
    } finally { 
      setCreating(false) 
    }
  }

  return (
    <div className="bg-white border border-red-100 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          {property ? 'Edit Property' : 'Create New Property'}
        </h3>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form className="grid md:grid-cols-2 gap-4" onSubmit={submit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Property Title *</label>
          <input 
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors" 
            placeholder="Enter property title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Location *</label>
          <input 
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors" 
            placeholder="Neighborhood or area" 
            value={location} 
            onChange={e => setLocation(e.target.value)} 
            required 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">City *</label>
          <input 
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors" 
            placeholder="City" 
            value={city} 
            onChange={e => setCity(e.target.value)} 
            required 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Country *</label>
          <input 
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors" 
            placeholder="Country" 
            value={country} 
            onChange={e => setCountry(e.target.value)} 
            required 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Address</label>
          <input 
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors" 
            placeholder="Full address" 
            value={address} 
            onChange={e => setAddress(e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Price per night *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input 
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors" 
              placeholder="0" 
              type="number" 
              value={price as any} 
              onChange={e => setPrice(e.target.value as any)} 
              required 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Region ID (optional)</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            placeholder="Region numeric ID"
            type="number"
            value={regionId as any}
            onChange={e => setRegionId((e.target.value === '' ? '' : Number(e.target.value)) as any)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Destination ID (optional)</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            placeholder="Destination numeric ID"
            type="number"
            value={destinationId as any}
            onChange={e => setDestinationId((e.target.value === '' ? '' : Number(e.target.value)) as any)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Max Guests</label>
          <input 
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors" 
            placeholder="Number of guests" 
            type="number" 
            value={maxGuests as any} 
            onChange={e => setMaxGuests(e.target.value as any)} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Bedrooms</label>
          <input 
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors" 
            placeholder="Number of bedrooms" 
            type="number" 
            value={bedrooms as any} 
            onChange={e => setBedrooms(e.target.value as any)} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Bathrooms</label>
          <input 
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors" 
            placeholder="Number of bathrooms" 
            type="number" 
            value={bathrooms as any} 
            onChange={e => setBathrooms(e.target.value as any)} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Property Type</label>
          <select 
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors" 
            value={propertyType} 
            onChange={e => setPropertyType(e.target.value)}
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="cabin">Cabin</option>
          </select>
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-700">Description *</label>
          <textarea 
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors" 
            rows={4} 
            placeholder="Describe your property..." 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
          />
        </div>
        <div className="md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
            <input 
              type="checkbox" 
              checked={instantBooking} 
              onChange={e => setInstantBooking(e.target.checked)} 
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500" 
            />
            Enable instant booking
          </label>
        </div>
        <div className="md:col-span-2 bg-red-50 border border-red-100 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-red-600" /> Featured & Popular
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              Featured
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={e => setIsPopular(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              Popular
            </label>
          </div>
        </div>
        <div className="md:col-span-2 bg-red-50 border border-red-100 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-red-600" />
            Amenities
          </h4>
          
          {/* Add amenity input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter amenity (e.g., WiFi, Pool, Parking)"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            />
            <button
              type="button"
              onClick={addAmenity}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Selected amenities */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Selected Amenities:</p>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                >
                  <span>{amenity}</span>
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="hover:text-red-900 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {amenities.length === 0 && (
                <p className="text-gray-500 text-sm italic">No amenities added yet</p>
              )}
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <h4 className="font-medium mb-2">Images (at least 1)</h4>
          <div className="flex flex-wrap gap-3">
            {images.map(url => (
              <div key={url} className="w-32">
                <img src={url} className="w-32 h-20 object-cover rounded" />
                <button 
                  type="button" 
                  onClick={() => setImages(prev => prev.filter(u => u !== url))} 
                  className="w-full mt-1 text-xs border rounded px-2 py-1"
                >
                  Remove
                </button>
              </div>
            ))}
            <label className="w-32 h-20 border-dashed border rounded flex items-center justify-center text-xs cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={async e => { 
                  const f = e.target.files?.[0]; 
                  if (!f) return; 
                  try { 
                    const { presignedUrl, url } = await MediaAPI.generatePresigned(f); 
                    await MediaAPI.uploadToPresigned(presignedUrl, f); 
                    setImages(prev => [...prev, url]) 
                  } catch(err: any) { 
                    alert(err?.message || 'Upload failed') 
                  } 
                }} 
              />
              <div className="flex flex-col items-center">
                <Upload className="w-4 h-4 mb-1" />
                + Upload
              </div>
            </label>
          </div>
        </div>
        {error && (
          <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}
        <div className="md:col-span-2 pt-4 border-t border-gray-100 flex gap-3">
          <button 
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            {creating ? (property ? 'Updating...' : 'Creating...') : (property ? 'Update Property' : 'Create Property')}
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700">✅ Admin properties go live immediately without approval.</p>
      </div>
    </div>
  )
}

function UsersTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [savingId, setSavingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  
  // Create admin form
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  
  // Create agent form
  const [agentName, setAgentName] = useState('')
  const [agentEmail, setAgentEmail] = useState('')
  const [agentPassword, setAgentPassword] = useState('')
  const [creatingAgent, setCreatingAgent] = useState(false)
  
  const [createMsg, setCreateMsg] = useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const resp = await AdminAPI.listUsers(search ? { search } : undefined)
      const usersData = (resp as any)?.data?.data || (resp as any)?.data?.items || (resp as any)?.data || resp || []
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load users')
      setUsers([])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const onCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingAdmin(true); setCreateMsg(null); setError(null)
    try {
      await AdminAPI.createAdminUser({ name: adminName, email: adminEmail, password: adminPassword })
      setCreateMsg('Admin user created successfully')
      setAdminName(''); setAdminEmail(''); setAdminPassword('')
      load()
    } catch (e: any) {
      setError(e?.message || 'Failed to create admin user')
    } finally { setCreatingAdmin(false) }
  }

  const onCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingAgent(true); setCreateMsg(null); setError(null)
    try {
      await AdminAPI.createAgentUser({ name: agentName, email: agentEmail, password: agentPassword })
      setCreateMsg('Agent user created successfully')
      setAgentName(''); setAgentEmail(''); setAgentPassword('')
      load()
    } catch (e: any) {
      setError(e?.message || 'Failed to create agent user')
    } finally { setCreatingAgent(false) }
  }

  const updateUser = async (id: number, patch: any) => {
    setSavingId(id)
    try { 
      await AdminAPI.updateUser(id, patch)
      await load() 
    } catch (e: any) { 
      alert(e?.message || 'Update failed') 
    } finally { 
      setSavingId(null) 
    }
  }

  const deleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    setSavingId(id)
    try {
      await AdminAPI.deleteUser(id)
      await load()
      setCreateMsg('User deleted successfully')
    } catch (e: any) {
      alert(e?.message || 'Delete failed')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Super Admin Permissions</p>
            <p className="text-sm text-red-600">Full control over all users, roles, and system settings. Use with caution.</p>
          </div>
        </div>
      </div>

      {/* Create Users Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Admin */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Create Admin</h3>
          </div>
          <form className="space-y-4" onSubmit={onCreateAdmin}>
            <input 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
              placeholder="Admin Name" 
              value={adminName} 
              onChange={e=>setAdminName(e.target.value)} 
              required 
            />
            <input 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
              placeholder="Admin Email" 
              type="email" 
              value={adminEmail} 
              onChange={e=>setAdminEmail(e.target.value)} 
              required 
            />
            <input 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
              placeholder="Password" 
              type="password" 
              value={adminPassword} 
              onChange={e=>setAdminPassword(e.target.value)} 
              required 
            />
            <button 
              disabled={creatingAdmin} 
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-60"
            >
              {creatingAdmin ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {creatingAdmin ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        </div>

        {/* Create Agent */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Create Agent</h3>
          </div>
          <form className="space-y-4" onSubmit={onCreateAgent}>
            <input 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="Agent Name" 
              value={agentName} 
              onChange={e=>setAgentName(e.target.value)} 
              required 
            />
            <input 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="Agent Email" 
              type="email" 
              value={agentEmail} 
              onChange={e=>setAgentEmail(e.target.value)} 
              required 
            />
            <input 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="Password" 
              type="password" 
              value={agentPassword} 
              onChange={e=>setAgentPassword(e.target.value)} 
              required 
            />
            <button 
              disabled={creatingAgent} 
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-60"
            >
              {creatingAgent ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {creatingAgent ? 'Creating...' : 'Create Agent'}
            </button>
          </form>
        </div>
      </div>

      {/* Success/Error Messages */}
      {createMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-medium">{createMsg}</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
              placeholder="Search by name or email..." 
              value={search} 
              onChange={e=>setSearch(e.target.value)} 
            />
          </div>
          <button 
            onClick={load} 
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Role</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Payment</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.isArray(users) && users.length > 0 ? users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-red-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="text-sm font-mono text-gray-600">#{u.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                        u.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700 border-red-200' :
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        u.role === 'AGENT' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        u.role === 'OWNER' ? 'bg-green-100 text-green-700 border-green-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        u.isActive 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {u.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {u.role === 'OWNER' ? (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          u.ownerPaid 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {u.ownerPaid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {u.ownerPaid ? 'PAID' : 'UNPAID'}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {u.role === 'OWNER' && (
                          <button 
                            disabled={savingId === u.id} 
                            onClick={() => updateUser(u.id, { ownerPaid: !u.ownerPaid })} 
                            className="flex items-center gap-1 px-3 py-1 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-60 transition-all"
                          >
                            {savingId === u.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Edit3 className="w-3 h-3" />}
                            Toggle Pay
                          </button>
                        )}
                        <button 
                          disabled={savingId === u.id} 
                          onClick={() => updateUser(u.id, { isActive: !u.isActive })} 
                          className="flex items-center gap-1 px-3 py-1 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-60 transition-all"
                        >
                          {savingId === u.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Edit3 className="w-3 h-3" />}
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        {u.role !== 'SUPER_ADMIN' && (
                          <button 
                            disabled={savingId === u.id} 
                            onClick={() => deleteUser(u.id)} 
                            className="flex items-center gap-1 px-3 py-1 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50 disabled:opacity-60 transition-all"
                          >
                            {savingId === u.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-6 px-6 text-center text-gray-500">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function QueueTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  
  const load = async () => {
    setLoading(true); setError(null)
    try {
      const resp = await AdminAPI.approvalQueue()
      const itemsData = (resp as any)?.data?.data || (resp as any)?.data?.items || (resp as any)?.data || resp || []
      setItems(Array.isArray(itemsData) ? itemsData : [])
    } catch (e: any) { 
      setError(e?.message || 'Failed to load') 
    } finally { 
      setLoading(false) 
    }
  }
  
  useEffect(() => { load() }, [])

  const act = async (id: number, status: 'LIVE'|'REJECTED'|'SUSPENDED') => {
    try { 
      await AdminAPI.approveProperty(id, { status })
      load() 
    } catch (e: any) { 
      alert(e?.message || 'Action failed') 
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pending Properties</h3>
            <p className="text-sm text-gray-600">{items.length} properties awaiting review</p>
          </div>
        </div>
        <button 
          onClick={load} 
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(Array.isArray(items) ? items : []).map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-gray-900">#{p.id}</span>
                    <h4 className="text-lg font-medium text-gray-800">{p.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Users className="w-4 h-4" />
                    <span>Owner: {p.owner?.email || p.ownerId}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => act(p.id, 'LIVE')} 
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button 
                  onClick={() => act(p.id, 'REJECTED')} 
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
                <button 
                  onClick={() => act(p.id, 'SUSPENDED')} 
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  <Pause className="w-4 h-4" />
                  Suspend
                </button>
              </div>
            </div>
          ))}
          {(!Array.isArray(items) || items.length === 0) && (
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
              <p className="text-gray-600">No pending properties to review at this time.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AnalyticsTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  
  const load = async () => {
    setLoading(true); setError(null)
    try { 
      const resp = await AdminAPI.analytics()
      const payload = (resp as any)?.data || resp
      setData(payload) 
    } catch (e: any) { 
      setError(e?.message || 'Failed to load analytics') 
    } finally { 
      setLoading(false) 
    }
  }
  
  useEffect(() => { load() }, [])
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Platform Analytics</h3>
            <p className="text-sm text-gray-600">System performance and usage statistics</p>
          </div>
        </div>
        <button 
          onClick={load} 
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border border-purple-100 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50">
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{data.users?.total ?? 0}</p>
                <p className="text-xs text-gray-500">New: {data.users?.new ?? 0}</p>
              </div>
              <div className="p-4 border border-purple-100 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50">
                <p className="text-sm text-gray-500">Properties</p>
                <p className="text-2xl font-bold text-gray-900">{data.properties?.total ?? 0}</p>
                <p className="text-xs text-gray-500">Live: {data.properties?.live ?? 0} • Pending: {data.properties?.pending ?? 0}</p>
              </div>
              <div className="p-4 border border-purple-100 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50">
                <p className="text-sm text-gray-500">Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{data.bookings?.total ?? 0}</p>
                <p className="text-xs text-gray-500">Confirmed: {data.bookings?.confirmed ?? 0}</p>
              </div>
              <div className="p-4 border border-purple-100 rounded-lg bg-gradient-to-br from-rose-50 to-red-50">
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${data.revenue?.total ?? 0}</p>
                <p className="text-xs text-gray-500">Period: ${data.revenue?.period ?? 0}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users by role bar chart */}
              <div className="p-4 border border-purple-100 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Users by Role</h4>
                <div className="space-y-3">
                  {(data.users?.byRole || []).map((r: any) => {
                    const count = r?._count?.role || 0;
                    const max = Math.max(1, ...(data.users?.byRole || []).map((x:any)=>x?._count?.role||0));
                    const pct = Math.round((count / max) * 100);
                    return (
                      <div key={r.role} className="flex items-center gap-3">
                        <div className="w-28 text-sm text-gray-600">{r.role}</div>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w-10 text-right text-sm text-gray-700">{count}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Properties status chart */}
              <div className="p-4 border border-purple-100 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Properties Overview</h4>
                {(() => {
                  const live = data.properties?.live || 0;
                  const pending = data.properties?.pending || 0;
                  const total = Math.max(1, data.properties?.total || (live + pending));
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-28 text-sm text-gray-600">Live</div>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${Math.round((live/total)*100)}%` }} />
                        </div>
                        <div className="w-10 text-right text-sm text-gray-700">{live}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-28 text-sm text-gray-600">Pending</div>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${Math.round((pending/total)*100)}%` }} />
                        </div>
                        <div className="w-10 text-right text-sm text-gray-700">{pending}</div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
