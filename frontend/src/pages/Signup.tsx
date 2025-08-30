import { useState } from 'react'
import { AuthAPI } from '../lib/api'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'USER' | 'OWNER' | 'AGENT'>('OWNER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await AuthAPI.signup({ name, email, password, role })
      setSuccess('Account created. Please login.')
      setTimeout(() => (location.hash = '#/login'), 900)
    } catch (err: any) {
      setError(err?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-4">Sign up</h1>
        <form className="mt-2 space-y-3" onSubmit={onSubmit}>
          <input className="w-full border rounded px-3 py-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
          <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <select className="w-full border rounded px-3 py-2" value={role} onChange={e=>setRole(e.target.value as any)}>
            <option value="OWNER">I am a Property Owner</option>
            <option value="AGENT">I am an Agent</option>
            <option value="USER">I am a Guest</option>
          </select>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}
          <button disabled={loading} className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-60">Create account</button>
        </form>
        <div className="text-sm text-center mt-4">
          Already have an account? <a className="text-purple-700 hover:underline" href="#/login">Login</a>
        </div>
      </div>
    </div>
  )
}
