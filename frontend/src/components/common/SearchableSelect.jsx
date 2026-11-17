import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import clsx from 'clsx';

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search options...',
  label,
  error,
  required = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const filteredOptions = options.filter(opt => {
    const labelText = typeof opt === 'string' ? opt : (opt.label || opt.value);
    return labelText.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedOption = options.find(opt => {
    const val = typeof opt === 'string' ? opt : opt.value;
    return val === value;
  });

  const displayLabel = selectedOption
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
    : placeholder;

  const handleSelect = (opt) => {
    const val = typeof opt === 'string' ? opt : opt.value;
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className={clsx('relative w-full', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full px-4 py-3 rounded-xl border bg-white text-left font-sans flex items-center justify-between transition-all focus:outline-none focus:ring-2',
          error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 hover:border-[#31747d]/50 focus:ring-[#31747d]/20',
          value ? 'text-[#31747d] font-medium' : 'text-gray-400'
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {value && (
            <span
              onClick={handleClear}
              className="p-0.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={18}
            className={clsx('text-gray-400 transition-transform duration-200', isOpen && 'rotate-180 text-[#31747d]')}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Internal Search Bar */}
          <div className="p-2.5 border-b border-gray-100 bg-gray-50/70">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-[#31747d] placeholder-gray-400 focus:outline-none focus:border-[#31747d] focus:ring-1 focus:ring-[#31747d] font-sans"
              />
            </div>
          </div>

          {/* Items List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center font-sans">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const optVal = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const isSelected = optVal === value;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={clsx(
                      'w-full px-3.5 py-2.5 rounded-lg text-sm font-sans flex items-center justify-between text-left transition-colors',
                      isSelected
                        ? 'bg-[#31747d]/10 text-[#31747d] font-semibold'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#31747d]'
                    )}
                  >
                    <span className="truncate">{optLabel}</span>
                    {isSelected && <Check size={16} className="text-[#31747d] shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1.5 font-sans">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
