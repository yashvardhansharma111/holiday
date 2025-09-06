import { useAuth } from '../context/auth'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full h-14 px-6 flex items-center justify-between text-white bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80 shadow">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">Book</span>
        <span className="text-xl opacity-90">Holiday Rentals</span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-6">
        <a className="hidden md:inline hover:underline" href="#/">Home</a>
        <a className="hidden md:inline hover:underline" href="#/property-types">Property Types</a>
        <a className="hidden md:inline hover:underline" href="#/deals">Deals & Offers</a>
        <a className="hidden md:inline hover:underline" href="#/about">About Us</a>
        <a className="hidden md:inline hover:underline" href="#/list-property">List Your Property</a>
        <a className="hidden md:inline hover:underline" href="#/host">Host with us</a>

        {/* Auth conditional links */}
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

            {/* ✅ Desktop logout button (now visible) */}
            <button
              onClick={logout}
              className="px-3 py-1 rounded bg-white/15 hover:bg-white/25 transition-colors"
            >
              Logout
            </button>

            {/* Mobile logout icon */}
            <button
              onClick={logout}
              aria-label="Logout"
              className="md:hidden p-2 rounded bg-white/15 hover:bg-white/25"
            >
              <svg xmlns="http://www.w3.org/2000/svg" 
                   viewBox="0 0 24 24" 
                   fill="none" 
                   stroke="currentColor" 
                   strokeWidth="2" 
                   strokeLinecap="round" 
                   strokeLinejoin="round" 
                   className="w-5 h-5">
                <path d="M12 2v10" />
                <path d="M5.5 5.5a8 8 0 1 0 13 0" />
              </svg>
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
