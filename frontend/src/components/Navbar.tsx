import { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
// Using custom hash-based routing across the app; prefer anchors over Link
import { useLocation } from "react-router-dom";
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
  
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>(() => (window.location.hash ? window.location.hash.replace('#','') : pathname || '/'));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleLoc = () => {
      const p = window.location.hash ? window.location.hash.replace('#','') : window.location.pathname;
      setCurrentPath(p || '/');
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('hashchange', handleLoc);
    window.addEventListener('popstate', handleLoc);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleLoc);
      window.removeEventListener('popstate', handleLoc);
    };
  }, [pathname]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Properties', path: '/properties', icon: Building2 },
    { name: 'Deals', path: '/deals', icon: Percent },
    { name: 'About', path: '/about', icon: Info },
    { name: 'List Property', path: '/list-property', icon: Plus },
    { name: 'Host', path: '/host', icon: UserPlus },
  ];

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return '/dashboard/super-admin';
      case 'ADMIN':
        return '/dashboard/admin';
      case 'AGENT':
        return '/dashboard/agent';
      case 'OWNER':
        return '/dashboard/owner';
      default:
        return '/dashboard/user';
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return 'from-[#D6A99D] to-[#9CAFAA]';
      case 'ADMIN':
        return 'from-[#9CAFAA] to-[#D6DAC8]';
      case 'AGENT':
        return 'from-[#D6DAC8] to-[#FBF3D5]';
      case 'OWNER':
        return 'from-[#FBF3D5] to-[#D6A99D]';
      default:
        return 'from-[#D6A99D] to-[#9CAFAA]';
    }
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'ADMIN':
        return 'Admin';
      case 'AGENT':
        return 'Agent';
      case 'OWNER':
        return 'Owner';
      default:
        return 'User';
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 font-['Lato',system-ui,sans-serif] ${scrolled ? 'h-16 bg-[#FBF3D5]/98 backdrop-blur-2xl shadow-2xl border-b border-[#D6A99D]/30' : 'h-20 bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Brand */}
            <motion.div>
              <a href="#/" className="flex items-center gap-4 group">
                <motion.div whileHover={{ rotate: 5, scale: 1.1 }} className={`rounded-2xl bg-gradient-to-br from-[#D6A99D] via-[#9CAFAA] to-[#D6DAC8] flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 border-2 border-white/20 ${scrolled ? 'w-12 h-12' : 'w-14 h-14'}`}>
                  <Building2 className={`text-white drop-shadow-sm transition-all duration-300 ${scrolled ? 'w-6 h-6' : 'w-7 h-7'}`} />
                </motion.div>
                <div className="flex flex-col">
                  <span className={`font-bold bg-gradient-to-r from-[#9CAFAA] to-[#D6A99D] bg-clip-text text-transparent transition-all duration-300 group-hover:from-[#D6A99D] group-hover:to-[#9CAFAA] ${scrolled ? 'text-xl' : 'text-2xl'}`}>BookHolidayRental</span>
                  <span className={`font-medium transition-all duration-300 ${scrolled ? 'hidden text-[#D6A99D]' : 'block text-white/90 drop-shadow-sm'}`}>Premium Vacation Rentals</span>
                </div>
              </a>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navLinks.map(({ name, path }) => (
                <motion.div key={path} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ y: 0, scale: 0.98 }} className="relative">
                  <a
                    href={`#${path}`}
                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 relative overflow-hidden group ${
                      currentPath === path
                        ? scrolled
                          ? 'bg-gradient-to-r from-[#D6A99D]/20 to-[#9CAFAA]/20 text-[#9CAFAA] shadow-lg border-2 border-[#D6A99D]/40'
                          : 'bg-gradient-to-r from-white/25 to-white/15 text-white shadow-xl border-2 border-white/40 backdrop-blur-md'
                        : scrolled
                          ? 'text-[#9CAFAA] hover:bg-gradient-to-r hover:from-[#D6A99D]/15 hover:to-[#9CAFAA]/15 hover:text-[#D6A99D] hover:shadow-md'
                          : 'text-white hover:text-white hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 hover:backdrop-blur-md hover:drop-shadow-lg'
                    }`}
                  >
                    <span className="relative z-10">{name}</span>
                    {currentPath === path && (
                      <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-[#D6A99D]/10 to-[#9CAFAA]/10 rounded-2xl" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                    )}
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {!user ? (
                <div className="flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a href="#/login" className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 relative overflow-hidden group ${scrolled ? 'text-[#9CAFAA] hover:bg-gradient-to-r hover:from-[#D6A99D]/15 hover:to-[#9CAFAA]/15 hover:shadow-lg border border-[#D6A99D]/30' : 'text-white hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 hover:backdrop-blur-md hover:drop-shadow-lg border border-white/30'}`}>
                      <span className="relative z-10">Login</span>
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-[#D6A99D]/10 to-[#9CAFAA]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" initial={false} />
                    </a>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <a href="#/signup" className={`px-8 py-3 rounded-2xl font-bold transition-all duration-300 relative overflow-hidden group ${scrolled ? 'bg-gradient-to-r from-[#D6A99D] to-[#9CAFAA] text-white hover:shadow-xl border-2 border-[#D6A99D]/40' : 'bg-gradient-to-r from-white/25 to-white/15 text-white hover:from-white/35 hover:to-white/25 backdrop-blur-md border-2 border-white/40 hover:shadow-2xl'}`}>
                      <span className="relative z-10">Get Started</span>
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" initial={false} />
                    </a>
                  </motion.div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <a href={`#${getDashboardPath()}`} className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 relative overflow-hidden group ${scrolled ? 'text-white bg-gradient-to-r from-[#9CAFAA] to-[#D6A99D] hover:shadow-xl border-2 border-[#D6A99D]/40' : 'text-white bg-gradient-to-r from-white/25 to-white/15 hover:from-white/35 hover:to-white/25 backdrop-blur-md border-2 border-white/40 hover:shadow-2xl'}`}>
                    <span className="relative z-10">Dashboard</span>
                  </a>
                  <button onClick={() => logout()} className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${scrolled ? 'text-[#D6A99D] border border-[#D6A99D]/40 hover:bg-[#D6A99D]/10' : 'text-white border border-white/40 hover:bg-white/10'}`}>
                    Logout
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 relative z-50"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ backgroundColor: scrolled ? 'rgba(214, 169, 157, 0.2)' : 'rgba(255, 255, 255, 0.3)', color: scrolled ? '#9CAFAA' : '#FFFFFF', border: scrolled ? '1px solid rgba(214, 169, 157, 0.3)' : '1px solid rgba(255, 255, 255, 0.3)' }}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#9CAFAA]/50 backdrop-blur-sm z-[55] lg:hidden" onClick={() => setMenuOpen(false)} />
            <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 right-0 w-80 h-full bg-[#FBF3D5] shadow-2xl z-[60] lg:hidden font-['Lato',system-ui,sans-serif] overflow-y-auto">
              <div className="flex flex-col h-full">
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
                    <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl hover:bg-[#D6A99D]/10 transition-colors duration-200">
                      <X className="w-5 h-5 text-[#9CAFAA]" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-6 space-y-2">
                  {navLinks.map(({ name, path }) => (
                    <a key={path} href={`#${path}`} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${currentPath === path ? 'bg-[#D6A99D]/20 text-[#9CAFAA] border border-[#D6A99D]/30' : 'text-[#9CAFAA] hover:bg-[#D6A99D]/10'}`}>
                      {name}
                    </a>
                  ))}
                </div>

                <div className="p-6 border-t border-[#D6A99D]/20">
                  {!user ? (
                    <div className="space-y-3">
                      <a href="#/login" onClick={() => setMenuOpen(false)} className="block w-full px-4 py-3 text-center font-medium text-[#9CAFAA] border border-[#D6A99D]/30 rounded-xl hover:bg-[#D6A99D]/10 transition-colors duration-200">Login</a>
                      <a href="#/signup" onClick={() => setMenuOpen(false)} className="block w-full px-4 py-3 text-center font-medium bg-gradient-to-r from-[#D6A99D] to-[#9CAFAA] text-white rounded-xl hover:from-[#9CAFAA] hover:to-[#D6A99D] transition-all duration-200">Get Started</a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-[#D6A99D]/10 rounded-xl">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRoleColor()} flex items-center justify-center shadow-md text-white font-semibold`}>
                          {(user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#9CAFAA]">{user?.name || 'User'}</p>
                          <p className="text-sm text-[#D6A99D]">{getRoleBadge()}</p>
                        </div>
                      </div>
                      <a href={`#${getDashboardPath()}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[#9CAFAA] hover:bg-[#D6A99D]/10 rounded-xl transition-colors duration-200">Dashboard</a>
                      <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-[#D6A99D] hover:bg-[#D6A99D]/10 rounded-xl transition-colors duration-200 w-full">Logout</button>
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
