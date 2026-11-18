import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
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
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/guests', label: 'Guests', icon: Users, matchPrefix: '/admin/guests' },
    { to: '/admin/employees', label: 'Employees', icon: UserCheck, matchPrefix: '/admin/employees' },
    { to: '/admin/form', label: 'Event Form', icon: FileText, matchPrefix: '/admin/form' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-[#E7EAF0] z-30 sticky top-0 shadow-xs">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/admin/dashboard')}
        >
          <img src="/lumos logo-title.png" alt="Lumos Logo" className="h-9 object-contain" />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="p-2 text-[#31747d] hover:bg-[#31747d]/10 rounded-full transition-colors cursor-pointer"
            title="Permanent QR Code"
          >
            <QrCode size={20} />
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600 hover:text-[#31747d] focus:outline-none transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Backdrop for Mobile Slide-in Drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Redesigned Sidebar: 3 Independent Flex Sections */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 bg-white border-r border-[#E7EAF0] flex flex-col transition-all duration-300 ease-in-out shadow-xl md:shadow-none h-screen',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          sidebarCollapsed ? 'w-[78px]' : 'w-[280px]'
        )}
      >
        {/* Section A: Header (shrink-0) */}
        <div
          className={clsx(
            'shrink-0 border-b border-[#E7EAF0] flex items-center transition-all min-h-[72px]',
            sidebarCollapsed
              ? 'px-1 py-3 flex-col justify-center items-center gap-2'
              : 'px-5 py-4 justify-between'
          )}
        >
          {/* Logo & Branding */}
          <div
            className={clsx(
              'flex items-center cursor-pointer group transition-all',
              sidebarCollapsed ? 'w-full justify-center px-0.5' : 'min-w-0'
            )}
            onClick={() => {
              navigate('/admin/dashboard');
              setSidebarOpen(false);
            }}
            title="Lumos Admin"
          >
            <img
              src="/lumos logo-title.png"
              alt="Lumos Logo"
              className={clsx(
                'object-contain transition-all group-hover:scale-105 drop-shadow-xs',
                sidebarCollapsed ? 'h-9 w-auto max-w-[72px]' : 'h-10 max-h-10'
              )}
            />
          </div>

          {/* Desktop Collapse/Expand Toggle & Mobile Close */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={clsx(
                'hidden md:flex text-gray-400 hover:text-[#31747d] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer',
                sidebarCollapsed ? 'p-1' : 'p-1.5'
              )}
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Section B: Navigation Items (flex-1 overflow-y-auto) */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive =
              location.pathname === item.to ||
              (item.matchPrefix && location.pathname.startsWith(item.matchPrefix));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
                className={clsx(
                  'flex items-center rounded-2xl text-sm transition-all font-sans group min-h-[48px]',
                  sidebarCollapsed
                    ? 'justify-center p-3'
                    : 'gap-3.5 px-4 py-3',
                  isItemActive
                    ? 'bg-[#31747d] text-white font-semibold shadow-xs'
                    : 'text-[#34445A] font-medium hover:bg-gray-100 hover:text-[#31747d]'
                )}
              >
                <Icon
                  size={20}
                  className={clsx(
                    'shrink-0 transition-colors',
                    isItemActive ? 'text-white' : 'text-[#5A6B82] group-hover:text-[#31747d]'
                  )}
                />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}

          {/* Permanent QR Code Action Button */}
          <button
            type="button"
            onClick={() => {
              setQrModalOpen(true);
              setSidebarOpen(false);
            }}
            title={sidebarCollapsed ? 'Permanent QR Code' : undefined}
            className={clsx(
              'w-full flex items-center rounded-2xl text-sm transition-all font-sans group min-h-[48px] text-[#31747d] font-semibold hover:bg-[#31747d]/10 cursor-pointer',
              sidebarCollapsed ? 'justify-center p-3' : 'gap-3.5 px-4 py-3'
            )}
          >
            <QrCode size={20} className="shrink-0 text-[#31747d]" />
            {!sidebarCollapsed && <span className="truncate">Permanent QR Code</span>}
          </button>
        </nav>

        {/* Section C: Bottom Profile & Actions (shrink-0) */}
        <div className="shrink-0 p-3 border-t border-[#E7EAF0] bg-white space-y-2">
          {/* View Public Site Link */}
          {!sidebarCollapsed ? (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-gray-500 hover:text-[#31747d] rounded-xl hover:bg-gray-50 transition-colors font-sans cursor-pointer"
            >
              <span>View Public Site</span>
              <ExternalLink size={14} className="text-gray-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/')}
              title="View Public Site"
              className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-[#31747d] hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
            >
              <ExternalLink size={16} />
            </button>
          )}

          {/* User Profile Card */}
          <div
            className={clsx(
              'flex items-center bg-white border border-[#E7EAF0] rounded-2xl shadow-2xs transition-all',
              sidebarCollapsed
                ? 'justify-center p-2 flex-col gap-2'
                : 'justify-between p-3 gap-3'
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-full bg-[#31747d] text-white flex items-center justify-center font-bold font-mono text-sm shrink-0 shadow-2xs"
                title={user?.name || 'Administrator'}
              >
                {user?.name?.charAt(0) || 'A'}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate font-sans">
                    {user?.name || 'System Admin'}
                  </p>
                  <p className="text-[11px] text-[#31747d] font-mono capitalize">
                    {user?.role || 'Admin'}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area: Offset by sidebar width on desktop */}
      <main
        className={clsx(
          'min-h-screen flex-1 min-w-0 bg-white transition-all duration-300',
          sidebarCollapsed ? 'md:ml-[78px] p-2 sm:p-4 lg:p-6' : 'md:ml-[280px] p-4 md:p-6 lg:p-8'
        )}
      >
        <div className={clsx('mx-auto', sidebarCollapsed ? 'max-w-[1560px] w-full' : 'max-w-7xl')}>
          <Outlet />
        </div>
      </main>

      {/* Permanent QR Code Modal */}
      <QRCodeModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </div>
  );
};

export default AdminLayout;
