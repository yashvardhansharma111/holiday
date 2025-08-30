import { useAuth } from '../context/auth'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between text-white">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">Book</span>
        <span className="text-xl opacity-90">Holiday Rentals</span>
      </div>

      <div className="flex items-center gap-4">
        <a className="hidden md:inline hover:underline" href="#/">Home</a>
        <a className="hidden md:inline hover:underline" href="#/host">Host with us</a>
        {!user && (
          <>
            <a className="hover:underline" href="#/login">Login</a>
            <a className="hover:underline" href="#/signup">Sign up</a>
          </>
        )}
        {user && (
          <>
            <a
              className="hover:underline"
              href={
                user.role === 'SUPER_ADMIN' ? '#/dashboard/super-admin'
                : user.role === 'ADMIN' ? '#/dashboard/admin'
                : user.role === 'AGENT' ? '#/dashboard/agent'
                : user.role === 'OWNER' ? '#/dashboard/owner'
                : '#/dashboard/user'
              }
            >
              Dashboard
            </a>
            <button onClick={logout} className="px-3 py-1 rounded bg-white/15 hover:bg-white/25">Logout</button>
          </>
        )}
      </div>
    </nav>
  )
}
