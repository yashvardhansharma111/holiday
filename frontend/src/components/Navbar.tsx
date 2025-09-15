import { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Building2, 
  Percent, 
  Info, 
  Plus, 
  UserPlus, 
  Menu, 
  X, 
  ChevronDown,
  User,
  LogOut,
  Settings,
  Bell,
  Search,
  Heart
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Properties", path: "/properties", icon: Building2 },
    { name: "Deals", path: "/deals", icon: Percent },
    { name: "About", path: "/about", icon: Info },
    { name: "List Property", path: "/list-property", icon: Plus },
    { name: "Host", path: "/host", icon: UserPlus },
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

  const getRoleColor = () => {
    switch (user?.role) {
      case "SUPER_ADMIN":
        return "from-[#D6A99D] to-[#9CAFAA]";
      case "ADMIN":
        return "from-[#9CAFAA] to-[#D6DAC8]";
      case "AGENT":
        return "from-[#D6DAC8] to-[#FBF3D5]";
      case "OWNER":
        return "from-[#FBF3D5] to-[#D6A99D]";
      default:
        return "from-[#D6A99D] to-[#9CAFAA]";
    }
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Admin";
      case "AGENT":
        return "Agent";
      case "OWNER":
        return "Owner";
      default:
        return "User";
    }
  };

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 font-['Lato',system-ui,sans-serif] ${
          scrolled
            ? "h-16 bg-[#FBF3D5]/98 backdrop-blur-2xl shadow-2xl border-b border-[#D6A99D]/30"
            : "h-20 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
      {/* Brand */}
            <motion.div
              // whileHover={{ scale: 1.05 }}
              // whileTap={{ scale: 0.95 }}
            >
      <Link
        to="/"
                className="flex items-center gap-4 group"
              >
                <motion.div 
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className={`rounded-2xl bg-gradient-to-br from-[#D6A99D] via-[#9CAFAA] to-[#D6DAC8] flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 border-2 border-white/20 ${
                    scrolled ? "w-12 h-12" : "w-14 h-14"
                  }`}
                >
                  <Building2 className={`text-white drop-shadow-sm transition-all duration-300 ${
                    scrolled ? "w-6 h-6" : "w-7 h-7"
                  }`} />
                </motion.div>
                <div className="flex flex-col">
                  <span className={`font-bold bg-gradient-to-r from-[#9CAFAA] to-[#D6A99D] bg-clip-text text-transparent transition-all duration-300 group-hover:from-[#D6A99D] group-hover:to-[#9CAFAA] ${
                    scrolled ? "text-xl" : "text-2xl"
                  }`}>
                    BookHolidayRental
          </span>
                  <span className={`font-medium transition-all duration-300 ${
                    scrolled ? "hidden text-[#D6A99D]" : "block text-white/90 drop-shadow-sm"
                  }`}>
                    Premium Vacation Rentals
          </span>
        </div>
      </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
        {navLinks.map(({ name, path }) => (
                <motion.div
                  key={path}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ y: 0, scale: 0.98 }}
                  className="relative"
                >
          <Link
            to={path}
                      className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 relative overflow-hidden group ${
              pathname === path
                          ? scrolled
                            ? "bg-gradient-to-r from-[#D6A99D]/20 to-[#9CAFAA]/20 text-[#9CAFAA] shadow-lg border-2 border-[#D6A99D]/40"
                            : "bg-gradient-to-r from-white/25 to-white/15 text-white shadow-xl border-2 border-white/40 backdrop-blur-md"
                          : scrolled
                          ? "text-[#9CAFAA] hover:bg-gradient-to-r hover:from-[#D6A99D]/15 hover:to-[#9CAFAA]/15 hover:text-[#D6A99D] hover:shadow-md"
                          : "text-white hover:text-white hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 hover:backdrop-blur-md hover:drop-shadow-lg"
                      }`}
                    >
                      <span className="relative z-10">{name}</span>
                    {pathname === path && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-[#D6A99D]/10 to-[#9CAFAA]/10 rounded-2xl"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
          </Link>
                </motion.div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-2xl transition-all duration-300 relative group ${
                  scrolled
                    ? "text-[#9CAFAA] hover:bg-gradient-to-r hover:from-[#D6A99D]/15 hover:to-[#9CAFAA]/15 hover:shadow-lg"
                    : "text-white hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-md hover:drop-shadow-lg"
                }`}
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-[#D6A99D] to-[#9CAFAA] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </motion.button>

              {/* Favorites Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-2xl transition-all duration-300 relative group ${
                  scrolled
                    ? "text-[#9CAFAA] hover:bg-gradient-to-r hover:from-[#D6A99D]/15 hover:to-[#9CAFAA]/15 hover:shadow-lg"
                    : "text-white hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-md hover:drop-shadow-lg"
                }`}
              >
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#D6A99D] to-[#9CAFAA] rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </span>
              </motion.button>

        {!user ? (
                <div className="hidden sm:flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/login"
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 relative overflow-hidden group ${
                  scrolled
                    ? "text-[#9CAFAA] hover:bg-gradient-to-r hover:from-[#D6A99D]/15 hover:to-[#9CAFAA]/15 hover:shadow-lg border border-[#D6A99D]/30"
                    : "text-white hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-md hover:drop-shadow-lg border border-white/30"
                }`}
              >
                <span className="relative z-10">Login</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#D6A99D]/10 to-[#9CAFAA]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
            <Link
              to="/signup"
                className={`px-8 py-3 rounded-2xl font-bold transition-all duration-300 relative overflow-hidden group ${
                  scrolled
                    ? "bg-gradient-to-r from-[#D6A99D] to-[#9CAFAA] text-white hover:shadow-xl hover:from-[#D6A99D]/90 hover:to-[#9CAFAA]/90 border-2 border-[#D6A99D]/40"
                    : "bg-gradient-to-r from-white/25 to-white/15 text-white hover:from-white/35 hover:to-white/25 backdrop-blur-md border-2 border-white/40 hover:shadow-2xl"
                }`}
              >
                <span className="relative z-10">Get Started</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
            </Link>
            </motion.div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-4">
                  {/* Notifications */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-2xl transition-all duration-300 relative group ${
                      scrolled
                        ? "text-[#9CAFAA] hover:bg-gradient-to-r hover:from-[#D6A99D]/15 hover:to-[#9CAFAA]/15 hover:shadow-lg"
                        : "text-white hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-md hover:drop-shadow-lg"
                    }`}
                  >
                    <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#D6A99D] to-[#9CAFAA] rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">2</span>
                    </span>
                  </motion.button>

                  {/* User Menu */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 relative overflow-hidden group ${
                        scrolled
                          ? "text-[#9CAFAA] hover:bg-gradient-to-r hover:from-[#D6A99D]/15 hover:to-[#9CAFAA]/15 hover:shadow-lg border border-[#D6A99D]/30"
                          : "text-white hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-md hover:drop-shadow-lg border border-white/30"
                      }`}
                    >
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${getRoleColor()} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      >
                        <User className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="flex flex-col items-start">
                        <span className="hidden md:block font-bold">{user.name}</span>
                        <span className="hidden md:block text-xs opacity-75">{getRoleBadge()}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: userMenuOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-3 w-72 bg-[#FBF3D5]/98 rounded-3xl shadow-2xl border-2 border-[#D6A99D]/30 backdrop-blur-2xl overflow-hidden"
                        >
                          <div className="p-4 border-b border-[#D6A99D]/20">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRoleColor()} flex items-center justify-center shadow-md`}>
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-[#9CAFAA]">{user.name}</p>
                                <p className="text-sm text-[#D6A99D]">{user.email}</p>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${getRoleColor()} text-white mt-1`}>
                                  {getRoleBadge()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="p-2">
            <Link
              to={getDashboardPath()}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#9CAFAA] hover:bg-[#D6A99D]/10 transition-colors duration-200"
            >
                              <Settings className="w-4 h-4" />
              Dashboard
            </Link>
            <button
                              onClick={() => {
                                logout();
                                setUserMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#D6A99D] hover:bg-[#D6A99D]/10 transition-colors duration-200"
                            >
                              <LogOut className="w-4 h-4" />
              Logout
            </button>
                          </div>
                        </motion.div>
        )}
                    </AnimatePresence>
                  </div>
      </div>
              )}

      {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 relative z-50"
        onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  backgroundColor: scrolled ? "rgba(214, 169, 157, 0.2)" : "rgba(255, 255, 255, 0.3)",
                  color: scrolled ? "#9CAFAA" : "#FFFFFF",
                  border: scrolled ? "1px solid rgba(214, 169, 157, 0.3)" : "1px solid rgba(255, 255, 255, 0.3)"
                }}
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#9CAFAA]/50 backdrop-blur-sm z-[55] lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
          <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-80 h-full bg-[#FBF3D5] shadow-2xl z-[60] lg:hidden font-['Lato',system-ui,sans-serif] overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-[#D6A99D]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D6A99D] via-[#9CAFAA] to-[#D6DAC8] flex items-center justify-center shadow-md">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-[#9CAFAA]">BookHolidayRental</p>
                        <p className="text-xs text-[#D6A99D]">Premium Rentals</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="p-2 rounded-xl hover:bg-[#D6A99D]/10 transition-colors duration-200"
                    >
                      <X className="w-5 h-5 text-[#9CAFAA]" />
                    </button>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 p-6 space-y-2">
            {navLinks.map(({ name, path }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  pathname === path
                          ? "bg-[#D6A99D]/20 text-[#9CAFAA] border border-[#D6A99D]/30"
                          : "text-[#9CAFAA] hover:bg-[#D6A99D]/10"
                }`}
              >
                {name}
              </Link>
            ))}
                </div>

                {/* User Section */}
                <div className="p-6 border-t border-[#D6A99D]/20">
            {!user ? (
                    <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center font-medium text-[#9CAFAA] border border-[#D6A99D]/30 rounded-xl hover:bg-[#D6A99D]/10 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center font-medium bg-gradient-to-r from-[#D6A99D] to-[#9CAFAA] text-white rounded-xl hover:from-[#9CAFAA] hover:to-[#D6A99D] transition-all duration-200"
                >
                        Get Started
                </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-[#D6A99D]/10 rounded-xl">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRoleColor()} flex items-center justify-center shadow-md`}>
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#9CAFAA]">{user.name}</p>
                          <p className="text-sm text-[#D6A99D]">{getRoleBadge()}</p>
                        </div>
                      </div>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[#9CAFAA] hover:bg-[#D6A99D]/10 rounded-xl transition-colors duration-200"
                >
                        <Settings className="w-5 h-5" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                        className="flex items-center gap-3 px-4 py-3 text-[#D6A99D] hover:bg-[#D6A99D]/10 rounded-xl transition-colors duration-200 w-full"
                >
                        <LogOut className="w-5 h-5" />
                  Logout
                </button>
                    </div>
            )}
                </div>
              </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
