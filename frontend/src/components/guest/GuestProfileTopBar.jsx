import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const GuestProfileTopBar = ({ portal = 'admin', onBack }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userName = user?.name || (portal === 'admin' ? 'Keval V Shah' : 'Staff Member');
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || 'KV';

  return (
    <div className="flex items-center justify-between gap-4 font-sans py-1">
      {/* Back to Directory Pill Button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#31747d] border border-gray-200 rounded-full text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
      >
        <i className="fa-solid fa-arrow-left text-xs" />
        <span>Back to {portal === 'admin' ? 'Directory' : 'All Guests'}</span>
      </button>

      {/* Right User Bar */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 text-gray-500 hover:text-[#31747d] hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          title="Notifications"
        >
          <i className="fa-solid fa-bell text-sm" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>

        {/* User Pill / Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-full hover:bg-gray-50 transition-colors cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#1c454b] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {userInitials}
            </div>
            <span className="text-xs font-bold text-gray-800 hidden sm:inline">{userName}</span>
            <i className="fa-solid fa-chevron-down text-[10px] text-gray-400 hidden sm:inline" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-bold text-gray-900">{userName}</p>
                <p className="text-[11px] text-gray-500 font-mono">{user?.email || 'admin@lumossolution.com'}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-right-from-bracket" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestProfileTopBar;
