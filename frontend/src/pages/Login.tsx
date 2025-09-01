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
      loginWithToken(user, token)
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-500 hover:shadow-purple-500/20 hover:shadow-3xl animate-slideUp">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 hover:scale-110">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent animate-fadeIn">
              Welcome Back
            </h1>
            <p className="text-gray-600 mt-2 animate-fadeIn" style={{animationDelay: '0.2s'}}>Sign in to your account</p>
          </div>

          {/* Login Form */}
          <div className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 pl-12 bg-gray-50/50 backdrop-blur-sm transition-all duration-300 focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-500/10 group-hover:border-gray-300 focus:outline-none placeholder-gray-400"
                  placeholder="Email address"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 pl-12 bg-gray-50/50 backdrop-blur-sm transition-all duration-300 focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-500/10 group-hover:border-gray-300 focus:outline-none placeholder-gray-400"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-4 animate-slideDown">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            <button 
              onClick={onSubmit}
              disabled={loading} 
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:transform-none disabled:hover:shadow-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-purple-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <span className="relative flex items-center justify-center">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">New here?</span>
              </div>
            </div>
            <div className="mt-4">
              <a 
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-purple-200 text-purple-700 rounded-xl font-medium hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-0.5 group" 
                href="#/signup"
              >
                Create an account
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style >{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}