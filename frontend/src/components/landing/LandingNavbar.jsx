import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogIn, LayoutDashboard, QrCode } from 'lucide-react';
import useDisclosure from '../../hooks/useDisclosure';
import clsx from 'clsx';
import { landingContent } from '../../data/landingContent';

/**
 * In-Card Navbar matching the smart-home reference layout.
 * Contained cleanly inside the top of the hero card.
 */
export const LandingNavbar = ({ onOpenQRModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, role } = useAuth();
  const { isOpen: mobileOpen, toggle: toggleMobile, close: closeMobile } = useDisclosure(false);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    if (href === '/' || href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', '/');
    } else if (href.startsWith('#')) {
      const targetId = href.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
    closeMobile();
  };

  return (
    <nav className="w-full pt-4 pb-2 px-2 sm:px-4 font-sans select-none relative z-30">
      <div className="flex items-center justify-between h-14">
        {/* Brand Logo */}
        <div
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.history.replaceState(null, '', '/');
          }}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <img
            src={landingContent.brand.logo}
            alt={landingContent.brand.name}
            className="h-9 sm:h-10 object-contain transition-transform group-hover:scale-105"
          />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#1b1d26]">
          {landingContent.nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="text-[#1b1d26]/80 hover:text-[#2f767f] transition-colors font-sans py-1 relative hover:font-semibold"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right Action: Sign In Pill / Dashboard */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate(role === 'admin' ? '/admin/dashboard' : '/users/all')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1b1d26] hover:bg-[#2f767f] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <LayoutDashboard size={14} />
              <span>{role === 'admin' ? 'Admin Portal' : 'User Portal'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1b1d26] hover:bg-[#2f767f] text-white text-xs font-semibold transition-all shadow-[0_4px_16px_-4px_rgba(20,25,35,0.25)] cursor-pointer"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => navigate(role === 'admin' ? '/admin/dashboard' : '/users/all')}
              className="p-2 rounded-full bg-[#1b1d26] text-white"
              aria-label="Dashboard"
            >
              <LayoutDashboard size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={toggleMobile}
            className="p-2 rounded-xl text-[#1b1d26] hover:bg-black/5 cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-3 p-5 rounded-3xl bg-white border border-gray-200/80 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex flex-col space-y-2">
            {landingContent.nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="px-4 py-2.5 rounded-xl hover:bg-gray-100 text-sm font-medium text-[#1b1d26]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  navigate('/login');
                  closeMobile();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#1b1d26] text-white text-xs font-semibold"
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  navigate(role === 'admin' ? '/admin/dashboard' : '/users/all');
                  closeMobile();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#2f767f] text-white text-xs font-semibold"
              >
                <LayoutDashboard size={15} />
                <span>Open Dashboard</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
