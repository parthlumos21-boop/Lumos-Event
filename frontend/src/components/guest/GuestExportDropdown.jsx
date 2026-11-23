import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GuestExportModal } from './GuestExportModal';

export const GuestExportDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('xlsx');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenExport = (format) => {
    setSelectedFormat(format);
    setIsOpen(false);
    setIsModalOpen(true);
  };

  return (
    <div className="relative inline-block font-sans" ref={dropdownRef}>
      {/* Icon-Only Export Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Export Guests"
        aria-label="Export Guests"
        className="p-2.5 bg-white border border-gray-200 hover:border-[#31747d] text-gray-700 hover:text-[#31747d] rounded-full shadow-xs transition-colors cursor-pointer flex items-center justify-center shrink-0"
      >
        <Download size={14} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl py-1.5 z-40 overflow-hidden"
          >
            <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
              Export Options
            </div>

            <button
              type="button"
              onClick={() => handleOpenExport('xlsx')}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-gray-700 hover:bg-[#31747d]/10 hover:text-[#31747d] transition-colors cursor-pointer font-medium text-left"
            >
              <FileSpreadsheet size={15} className="text-emerald-600 shrink-0" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenExport('pdf')}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-gray-700 hover:bg-[#31747d]/10 hover:text-[#31747d] transition-colors cursor-pointer font-medium text-left"
            >
              <FileText size={15} className="text-rose-500 shrink-0" />
              <span>Export PDF (.pdf)</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Configuration Modal */}
      <GuestExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialFormat={selectedFormat}
      />
    </div>
  );
};
