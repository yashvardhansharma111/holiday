import { useState } from 'react'
import { AuthAPI } from '../lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      if (!otpSent) {
        await AuthAPI.forgotSendOtp(email)
        setOtpSent(true)
        setSuccess('OTP sent to your email. Enter the code below.')
      } else {
        if (!newPassword || newPassword.length < 8) {
          setError('Password must be at least 8 characters')
          return
        }
        await AuthAPI.forgotVerifyOtp({ email, code: otp, newPassword })
        setSuccess('Password reset successful. Redirecting to login...')
        setTimeout(() => (location.hash = '#/login'), 1200)
      }
    } catch (err: any) {
      setError(err?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-slideUp">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">Forgot Password</h1>
            <p className="text-gray-600 mt-2">Reset your password using email OTP</p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 pl-12 bg-gray-50/50 focus:border-purple-500 focus:bg-white focus:shadow-lg placeholder-gray-400"
                  placeholder="Email address"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setOtpSent(false); setOtp(''); setNewPassword('') }}
                  required
                />
              </div>

              {otpSent && (
                <>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 pl-12 bg-gray-50/50 focus:border-purple-500 focus:bg-white focus:shadow-lg placeholder-gray-400"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      required
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 pl-12 bg-gray-50/50 focus:border-purple-500 focus:bg-white focus:shadow-lg placeholder-gray-400"
                      placeholder="New password (min 8 chars)"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="bg-red-50/80 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50/80 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (otpSent ? 'Resetting...' : 'Sending OTP...') : (otpSent ? 'Reset Password' : 'Send OTP')}
            </button>

            <div className="text-center mt-2">
              <a className="text-purple-700 hover:underline" href="#/login">Back to login</a>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: translateY(0) } }
        .animate-slideUp { animation: slideUp 0.8s ease-out forwards; }
      `}</style>
    </div>
  )
}
