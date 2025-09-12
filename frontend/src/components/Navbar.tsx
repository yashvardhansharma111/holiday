import { useState } from "react";
import { useAuth } from "../context/auth";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Property Types", path: "/property-types" },
    { name: "Deals & Offers", path: "/deals" },
    { name: "About Us", path: "/about" },
    { name: "List Your Property", path: "/list-property" },
    { name: "Host with Us", path: "/host" },
  ];

  const getDashboardPath = () => {
    switch (user?.role) {
      case "SUPER_ADMIN":
        return "/dashboard/super-admin";
      case "ADMIN":
        return "/dashboard/admin";
      case "AGENT":
        return "/dashboard/agent";
      case "OWNER":
        return "/dashboard/owner";
      default:
        return "/dashboard/user";
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full h-16 px-6 flex items-center justify-between text-white bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg border-b border-white/10">
      {/* Brand */}
      <Link
        to="/"
        className="flex items-center gap-2 hover:opacity-90 transition-opacity duration-200"
      >
        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
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
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-6">
        {navLinks.map(({ name, path }) => (
          <Link
            key={path}
            to={path}
            className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
              pathname === path
                ? "bg-white/10 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            {name}
          </Link>
        ))}

        {!user ? (
          <>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            <Link
              to={getDashboardPath()}
              className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Dashboard
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200 font-medium transition-all duration-200"
            >
              Logout
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 text-white drop-shadow"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          {menuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed top-0 right-0 w-72 h-full 
              bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 
              bg-opacity-95 backdrop-blur-xl 
              shadow-[0_0_20px_rgba(0,0,0,0.5)] 
              border-l border-white/10 p-6 flex flex-col gap-4 z-40"
          >
            {navLinks.map(({ name, path }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                  pathname === path
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {name}
              </Link>
            ))}

            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200 font-medium transition-all duration-200"
                >
                  Logout
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
