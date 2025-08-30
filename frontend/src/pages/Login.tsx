import { useState } from 'react'
import { useAuth } from '../context/auth'
import { AuthAPI } from '../lib/api'

export default function LoginPage() {
  const { loginWithToken } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res: any = await AuthAPI.login({ email, password })
      const token = res?.token || res?.data?.token
      const user = res?.user || res?.data?.user
      if (!token || !user) throw new Error('Invalid login response')
      // Any role can login here; admins/super admins have dedicated hidden routes too
      loginWithToken(user, token)
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        <form className="space-y-3" onSubmit={onSubmit}>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="text-sm text-center mt-4">
          No account? <a className="text-purple-700 hover:underline" href="#/signup">Sign up</a>
        </div>
      </div>
    </div>
  )
}
