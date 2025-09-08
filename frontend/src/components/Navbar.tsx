import { useAuth } from "../context/auth";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full h-16 px-6 flex items-center justify-between text-white bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md supports-[backdrop-filter]:bg-gray-900/90 shadow-xl border-b border-white/10">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <a
          href="#/"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity duration-200"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-white"
            >
              <path d="M19.006 3.705a.75.75 0 00-.512-1.41L6 6.838V3a.75.75 0 00-.75-.75h-1.5A.75.75 0 003 3v4.93l-1.006.365a.75.75 0 00.512 1.41l16.5-6z" />
              <path
                fillRule="evenodd"
                d="M3.019 11.115L18 5.667V9.09l4.006 1.456a.75.75 0 11-.512 1.41l-.494-.18v8.475h.75a.75.75 0 010 1.5H2.25a.75.75 0 010-1.5H3v-9.129l.019-.006zM18 20.25v-9.565l1.5.545v9.02H18zm-9-6a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h3a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Book
            </span>
            <span className="text-xl font-medium text-gray-300 ml-1">
              Holiday Rentals
            </span>
          </div>
        </a>
      </div>

      {/* Links */}
      <div className="flex items-center gap-6">
        <a
          className="hidden md:inline-flex items-center px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium text-gray-200 hover:text-white"
          href="#/"
        >
          Home
        </a>
        <a
          className="hidden md:inline-flex items-center px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium text-gray-200 hover:text-white"
          href="#/property-types"
        >
          Property Types
        </a>
        <a
          className="hidden md:inline-flex items-center px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium text-gray-200 hover:text-white"
          href="#/deals"
        >
          Deals & Offers
        </a>
        <a
          className="hidden md:inline-flex items-center px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium text-gray-200 hover:text-white"
          href="#/about"
        >
          About Us
        </a>
        <a
          className="hidden md:inline-flex items-center px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium text-gray-200 hover:text-white"
          href="#/list-property"
        >
          List Your Property
        </a>
        <a
          className="hidden md:inline-flex items-center px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium text-gray-200 hover:text-white"
          href="#/host"
        >
          Host with us
        </a>

        {/* Auth */}
        {!user && (
          <>
            <a
              className="px-4 py-2 rounded-lg font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-200"
              href="#/login"
            >
              Login
            </a>
            <a
              className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              href="#/signup"
            >
              Sign up
            </a>
          </>
        )}

        {user && (
          <>
            <a
              className="hidden md:inline-flex items-center px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              href={
                user.role === "SUPER_ADMIN"
                  ? "#/dashboard/super-admin"
                  : user.role === "ADMIN"
                  ? "#/dashboard/admin"
                  : user.role === "AGENT"
                  ? "#/dashboard/agent"
                  : user.role === "OWNER"
                  ? "#/dashboard/owner"
                  : "#/dashboard/user"
              }
            >
              Dashboard
            </a>

            {/* Mobile Dashboard */}
            <a
              className="md:hidden p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              href={
                user.role === "SUPER_ADMIN"
                  ? "#/dashboard/super-admin"
                  : user.role === "ADMIN"
                  ? "#/dashboard/admin"
                  : user.role === "AGENT"
                  ? "#/dashboard/agent"
                  : user.role === "OWNER"
                  ? "#/dashboard/owner"
                  : "#/dashboard/user"
              }
              aria-label="Dashboard"
            >
              {/* icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z"
                  clipRule="evenodd"
                />
              </svg>
            </a>

            {/* Logout */}
            <button
              onClick={logout}
              className="hidden md:inline-flex items-center px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200 font-medium transition-all duration-200"
            >
              Logout
            </button>
            <button
              onClick={logout}
              aria-label="Logout"
              className="p-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200 transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M12 2v10" />
                <path d="M5.5 5.5a8 8 0 1 0 13 0" />
              </svg>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
