import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleServicesClick = (e) => {
    e.preventDefault();
    navigate('/form');
    setMobileMenuOpen(false);
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/#about');
    } else {
      const el = document.getElementById('about');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleLocationClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/#location-section');
    } else {
      const el = document.getElementById('location-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={clsx(
        'fixed z-40 transition-all duration-300 ease-in-out select-none font-sans',
        isScrolled
          ? 'top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl rounded-full border border-white/20 shadow-2xl shadow-[#040810]/70 bg-[#09111c]/80 backdrop-blur-xl py-2.5 px-6'
          : 'top-0 left-0 right-0 w-full bg-transparent border-transparent py-4 px-6 md:px-12'
      )}
    >
      <div
        className={clsx(
          'mx-auto flex items-center justify-between',
          isScrolled ? 'w-full h-12' : 'max-w-7xl h-12 md:h-14'
        )}
      >
        {/* Brand Logo with transparent navbar */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <img
            src="/lumos logo-title.png"
            alt="Lumos Logo"
            className={clsx(
              'object-contain transition-all duration-200 group-hover:scale-105 drop-shadow-md',
              isScrolled ? 'h-8 md:h-9' : 'h-10 md:h-12'
            )}
          />
        </div>

        {/* Desktop Links - High contrast visible white text */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-[#4ecdc4] transition-colors cursor-pointer drop-shadow-sm"
          >
            Home
          </button>

          <button
            onClick={handleServicesClick}
            className="text-white hover:text-[#4ecdc4] transition-colors cursor-pointer drop-shadow-sm"
          >
            Services
          </button>

          <button
            onClick={handleAboutClick}
            className="text-white hover:text-[#4ecdc4] transition-colors cursor-pointer drop-shadow-sm"
          >
            About
          </button>

          <button
            onClick={handleLocationClick}
            className="text-white hover:text-[#4ecdc4] transition-colors cursor-pointer drop-shadow-sm"
          >
            Location
          </button>

          {/* User Logged In / Sign In Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-4 border-l border-white/20">
              <button
                onClick={() => navigate(role === 'admin' ? '/admin/dashboard' : '/users/all')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-colors cursor-pointer backdrop-blur-xs border border-white/10"
              >
                <LayoutDashboard size={14} />
                <span>{role === 'admin' ? 'Admin' : 'User'}</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-white">
                <span className="w-7 h-7 rounded-full bg-[#31747d] text-white flex items-center justify-center font-bold font-mono shadow-sm">
                  {user?.name?.charAt(0) || 'U'}
                </span>
                <span className="max-w-[120px] truncate font-medium drop-shadow-sm">{user?.name}</span>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-full text-white/70 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#31747d] hover:bg-[#3ba2af] text-white font-semibold text-sm transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#31747d]/50 cursor-pointer"
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-[#4ecdc4] focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/15 pb-2 space-y-2 text-sm font-medium bg-[#09111c]/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/15 text-white">
          <button
            onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 px-3 text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            Home
          </button>
          <button
            onClick={handleServicesClick}
            className="block w-full text-left py-2 px-3 text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            Services (Event Form)
          </button>
          <button
            onClick={handleAboutClick}
            className="block w-full text-left py-2 px-3 text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            About
          </button>
          <button
            onClick={handleLocationClick}
            className="block w-full text-left py-2 px-3 text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            Location
          </button>

          <div className="pt-3 border-t border-white/15 px-1">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#31747d] text-white flex items-center justify-center font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-[#4ecdc4] capitalize font-mono">{role}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigate(role === 'admin' ? '/admin/dashboard' : '/users/all');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-sm transition-colors"
                >
                  <LayoutDashboard size={16} /> Open {role === 'admin' ? 'Admin' : 'User'}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm font-semibold transition-colors"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#31747d] hover:bg-[#3ba2af] text-white font-semibold text-sm transition-all"
              >
                <LogIn size={16} /> Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
