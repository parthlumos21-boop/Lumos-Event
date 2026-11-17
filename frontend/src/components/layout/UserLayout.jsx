import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, FileText, LogOut, Menu, X, QrCode } from 'lucide-react';
import clsx from 'clsx';
import QRCodeModal from '../common/QRCodeModal';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/lumos logo-title.png" alt="Lumos Logo" className="h-9 object-contain" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            <NavLink
              to="/users/all"
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors font-sans',
                  isActive || location.pathname.startsWith('/users/guests')
                    ? 'bg-[#31747d] text-white'
                    : 'text-gray-600 hover:text-[#31747d] hover:bg-gray-100'
                )
              }
            >
              <Users size={16} />
              <span>All Guests</span>
            </NavLink>

            <NavLink
              to="/users/form"
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors font-sans',
                  isActive
                    ? 'bg-[#31747d] text-white'
                    : 'text-gray-600 hover:text-[#31747d] hover:bg-gray-100'
                )
              }
            >
              <FileText size={16} />
              <span>Event Form</span>
            </NavLink>

            {/* Permanent QR Code Button */}
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#31747d]/30 text-[#31747d] hover:bg-[#31747d]/10 transition-colors cursor-pointer"
              title="Preview, Download & Print Permanent Event QR Code"
            >
              <QrCode size={15} />
              <span>QR Code</span>
            </button>
          </nav>

          {/* User Profile & Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2.5 text-xs text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
              <span className="w-6 h-6 rounded-full bg-[#31747d] text-white flex items-center justify-center font-bold font-mono text-[10px]">
                {user?.name?.charAt(0) || 'U'}
              </span>
              <span className="font-medium">{user?.name}</span>
              <span className="text-gray-400">|</span>
              <span className="text-[#31747d] capitalize font-mono text-[11px]">{user?.role}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-[#31747d] focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-6 py-4 space-y-3 font-sans text-sm">
            <NavLink
              to="/users/all"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-2 text-gray-700 hover:text-[#31747d]"
            >
              <Users size={18} /> All Guests
            </NavLink>
            <NavLink
              to="/users/form"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-2 text-gray-700 hover:text-[#31747d]"
            >
              <FileText size={18} /> Event Form
            </NavLink>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setQrModalOpen(true);
              }}
              className="flex items-center gap-2.5 py-2 text-[#31747d] font-semibold"
            >
              <QrCode size={18} /> Permanent QR Code
            </button>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-[#31747d] capitalize font-mono">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 bg-white">
        <Outlet />
      </main>

      {/* Permanent QR Code Modal */}
      <QRCodeModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </div>
  );
};

export default UserLayout;
