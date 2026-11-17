import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  QrCode
} from 'lucide-react';
import clsx from 'clsx';
import QRCodeModal from '../common/QRCodeModal';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/guests', label: 'Guests', icon: Users },
    { to: '/admin/employees', label: 'Employees', icon: UserCheck },
    { to: '/admin/form', label: 'Event Form', icon: FileText }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-gray-800">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 z-30 sticky top-0 shadow-xs">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
          <img src="/lumos logo-title.png" alt="Lumos Logo" className="h-9 object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQrModalOpen(true)}
            className="p-2 text-[#31747d] hover:bg-[#31747d]/10 rounded-full"
            title="Permanent QR Code"
          >
            <QrCode size={20} />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600 hover:text-[#31747d] focus:outline-none cursor-pointer"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {/* Backdrop for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col justify-between transition-all duration-300 ease-in-out md:static md:h-screen md:sticky md:top-0 shadow-xl md:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          sidebarCollapsed ? 'md:w-24 w-72' : 'w-72'
        )}
      >
        {/* Top Header & Toggle Icon */}
        <div>
          <div
            className={clsx(
              'border-b border-gray-100 flex items-center transition-all',
              sidebarCollapsed ? 'p-3 flex-col gap-2 justify-center' : 'p-5 justify-between'
            )}
          >
            {/* Logo */}
            <div
              className={clsx(
                "flex items-center cursor-pointer group",
                sidebarCollapsed && "w-full justify-center px-1"
              )}
              onClick={() => navigate('/admin/dashboard')}
              title="Lumos Admin"
            >
              <img
                src="/lumos logo-title.png"
                alt="Lumos Logo"
                className={clsx(
                  'object-contain transition-all group-hover:scale-105 drop-shadow-xs',
                  sidebarCollapsed ? 'h-9 w-auto max-w-[80px]' : 'h-10'
                )}
              />
            </div>

            {/* Desktop Top-Bar Right-Side Sidebar Toggle Icon */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:flex p-1.5 text-gray-400 hover:text-[#31747d] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1.5 text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center rounded-2xl text-sm font-medium transition-all font-sans',
                      sidebarCollapsed
                        ? 'justify-center p-3.5'
                        : 'gap-3.5 px-4 py-3',
                      isActive
                        ? 'bg-[#31747d] text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#31747d]'
                    )
                  }
                >
                  <Icon size={20} className="shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}

            {/* Permanent QR Code Action */}
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              title={sidebarCollapsed ? 'Permanent QR Code' : undefined}
              className={clsx(
                'w-full flex items-center rounded-2xl text-sm font-semibold transition-all font-sans text-[#31747d] hover:bg-[#31747d]/10 cursor-pointer',
                sidebarCollapsed ? 'justify-center p-3.5' : 'gap-3.5 px-4 py-3'
              )}
            >
              <QrCode size={20} className="shrink-0" />
              {!sidebarCollapsed && <span>Permanent QR Code</span>}
            </button>
          </nav>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/60 space-y-2">
          {!sidebarCollapsed && (
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-gray-500 hover:text-[#31747d] rounded-xl hover:bg-gray-100 transition-colors font-sans cursor-pointer"
            >
              <span>View Public Site</span>
              <ExternalLink size={14} />
            </button>
          )}

          <div
            className={clsx(
              'flex items-center bg-white border border-gray-200 rounded-2xl shadow-xs transition-all',
              sidebarCollapsed ? 'justify-center p-2.5 flex-col gap-2' : 'justify-between p-3 gap-3'
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#31747d] text-white flex items-center justify-center font-bold font-mono text-sm shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate font-sans">
                    {user?.name || 'Administrator'}
                  </p>
                  <p className="text-[11px] text-[#31747d] font-mono capitalize">
                    {user?.role || 'Admin'}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 md:p-8 lg:p-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Permanent QR Code Modal */}
      <QRCodeModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </div>
  );
};

export default AdminLayout;
