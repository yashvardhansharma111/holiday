import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/auth'
import { MediaAPI, PropertiesAPI } from '../../lib/api'

type TabKey = 'my-properties' | 'new-property'

export default function OwnerDashboard() {
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role !== 'OWNER') {
      location.hash = '#/dashboard'
    }
  }, [user?.role])

  if (user?.role !== 'OWNER') return null

  return <OwnerContent />
}

function OwnerContent() {
  const [active, setActive] = useState<TabKey>('my-properties')
  const tabs: { key: TabKey; label: string }[] = useMemo(() => ([
    { key: 'my-properties', label: 'My Properties' },
    { key: 'new-property', label: 'Create Property' },
  ]), [])

  return (
    <div className="min-h-[70vh] flex">
      <aside className="w-60 border-r bg-white">
        <div className="p-4 font-bold text-lg">Owner</div>
        <nav className="p-2 space-y-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={'w-full text-left px-3 py-2 rounded ' + (active === t.key ? 'bg-purple-600 text-white' : 'hover:bg-gray-100')}
            >{t.label}</button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {active === 'my-properties' && <MyPropertiesTab />}
        {active === 'new-property' && <CreatePropertyTab onCreated={() => setActive('my-properties')} />}
      </main>
    </div>
  )
}

function MyPropertiesTab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const resp = await PropertiesAPI.myProperties()
      setItems(Array.isArray(resp) ? resp : (resp?.data || []))
    } catch (e:any) { setError(e?.message || 'Failed to load properties') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const remove = async (id: number) => {
    if (!confirm('Delete this property?')) return
    try { await PropertiesAPI.remove(id); await load() } catch (e:any) { alert(e?.message || 'Delete failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">My Properties</h2>
        <button onClick={load} className="text-sm px-3 py-1 border rounded">Refresh</button>
      </div>
      {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
        <div className="space-y-4">
          {items.map((p:any) => (
            <PropertyCard key={p.id} prop={p} onChanged={load} onDelete={() => remove(p.id)} />
          ))}
          {items.length === 0 && <p className="text-sm text-gray-600">No properties yet.</p>}
        </div>
      )}
    </div>
  )
}

function PropertyCard({ prop, onChanged, onDelete }: { prop: any; onChanged: () => void; onDelete: () => void }) {
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(prop.title || '')
  const [price, setPrice] = useState<number | ''>(prop.price || '')
  const [city, setCity] = useState(prop.city || '')
  const [country, setCountry] = useState(prop.country || '')
  const [instantBooking, setInstantBooking] = useState(!!prop.instantBooking)
  const [media, setMedia] = useState<any[]>(prop.media || [])

  const save = async () => {
    setSaving(true)
    try {
      await PropertiesAPI.update(prop.id, { title, price: Number(price), city, country, instantBooking })
      onChanged()
    } catch (e:any) { alert(e?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const onUpload = async (file: File) => {
    try {
      const { presignedUrl, url } = await MediaAPI.generatePresigned(file)
      await MediaAPI.uploadToPresigned(presignedUrl, file)
      const newItem = { type: 'image', url, caption: '', isPrimary: media.length === 0 }
      setMedia(prev => [...prev, newItem])
      await PropertiesAPI.addMedia(prop.id, [url])
      onChanged()
    } catch (e:any) { alert(e?.message || 'Upload failed') }
  }

  const deleteImage = async (url: string) => {
    if (!confirm('Delete this image?')) return
    try {
      await PropertiesAPI.removeMedia(prop.id, [url])
      setMedia(prev => prev.filter((m:any) => m.url !== url))
      onChanged()
    } catch (e:any) { alert(e?.message || 'Delete failed') }
  }

  return (
    <div className="border rounded p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <div className="flex-1 grid md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="City" value={city} onChange={e=>setCity(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Price" type="number" value={price as any} onChange={e=>setPrice(e.target.value as any)} />
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={instantBooking} onChange={e=>setInstantBooking(e.target.checked)} />
            Instant booking
          </label>
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="px-3 py-2 rounded bg-purple-600 text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
          <button onClick={onDelete} className="px-3 py-2 rounded border">Delete</button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-2">Images</h4>
        <div className="flex flex-wrap gap-3">
          {media?.map((m:any) => (
            <div key={m.url} className="w-32">
              <img src={m.url} className="w-32 h-20 object-cover rounded" />
              <button onClick={() => deleteImage(m.url)} className="w-full mt-1 text-xs border rounded px-2 py-1">Delete</button>
            </div>
          ))}
          <label className="w-32 h-20 border-dashed border rounded flex items-center justify-center text-xs cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if (f) onUpload(f) }} />
            + Upload
          </label>
        </div>
      </div>
    </div>
  )
}

function CreatePropertyTab({ onCreated }: { onCreated: () => void }) {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [address, setAddress] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState<number | ''>('' as any)
  const [maxGuests, setMaxGuests] = useState<number | ''>('' as any)
  const [bedrooms, setBedrooms] = useState<number | ''>('' as any)
  const [bathrooms, setBathrooms] = useState<number | ''>('' as any)
  const [propertyType, setPropertyType] = useState('apartment')
  const [instantBooking, setInstantBooking] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCreating(true)
    try {
      // Basic client-side validation to match backend schema
      if (title.trim().length < 5) throw new Error('Title must be at least 5 characters')
      if (description.trim().length < 20) throw new Error('Description must be at least 20 characters')
      if (location.trim().length < 5) throw new Error('Location must be at least 5 characters')
      if (address.trim().length < 10) throw new Error('Address must be at least 10 characters')
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
        amenities: {},
        media: images.map((url, idx) => ({ type: 'image', url, caption: '', isPrimary: idx === 0 })),
        maxGuests: Number(maxGuests || 1),
        bedrooms: Number(bedrooms || 1),
        bathrooms: Number(bathrooms || 1),
        propertyType,
        instantBooking,
      }
      await PropertiesAPI.create(body)
      onCreated()
    } catch (e:any) { setError(e?.message || 'Create failed') }
    finally { setCreating(false) }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Create Property</h2>
      <form className="grid md:grid-cols-2 gap-3 max-w-3xl" onSubmit={submit}>
        <input className="border rounded px-3 py-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="Location (e.g., neighborhood or area)" value={location} onChange={e=>setLocation(e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="City" value={city} onChange={e=>setCity(e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Price per night" type="number" value={price as any} onChange={e=>setPrice(e.target.value as any)} required />
        <input className="border rounded px-3 py-2" placeholder="Max Guests" type="number" value={maxGuests as any} onChange={e=>setMaxGuests(e.target.value as any)} />
        <input className="border rounded px-3 py-2" placeholder="Bedrooms" type="number" value={bedrooms as any} onChange={e=>setBedrooms(e.target.value as any)} />
        <input className="border rounded px-3 py-2" placeholder="Bathrooms" type="number" value={bathrooms as any} onChange={e=>setBathrooms(e.target.value as any)} />
        <select className="border rounded px-3 py-2" value={propertyType} onChange={e=>setPropertyType(e.target.value)}>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="cabin">Cabin</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={instantBooking} onChange={e=>setInstantBooking(e.target.checked)} />
          Instant booking
        </label>
        <textarea className="md:col-span-2 border rounded px-3 py-2" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <div className="md:col-span-2">
          <h4 className="font-medium mb-2">Images (at least 1)</h4>
          <div className="flex flex-wrap gap-3">
            {images.map(url => (
              <div key={url} className="w-32">
                <img src={url} className="w-32 h-20 object-cover rounded" />
                <button type="button" onClick={() => setImages(prev => prev.filter(u => u !== url))} className="w-full mt-1 text-xs border rounded px-2 py-1">Remove</button>
              </div>
            ))}
            <label className="w-32 h-20 border-dashed border rounded flex items-center justify-center text-xs cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={async e=>{ const f=e.target.files?.[0]; if (!f) return; try { const { presignedUrl, url } = await MediaAPI.generatePresigned(f); await MediaAPI.uploadToPresigned(presignedUrl, f); setImages(prev => [...prev, url]) } catch(err:any){ alert(err?.message || 'Upload failed') } }} />
              + Upload
            </label>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
        <div className="md:col-span-2">
          <button disabled={creating} className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-60">{creating ? 'Creating...' : 'Create Property'}</button>
        </div>
      </form>
      <p className="text-xs text-gray-600 mt-3">New properties require admin approval before going live.</p>
    </div>
  )
}
