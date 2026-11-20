import React, { useState, useMemo } from 'react';
import { Search, X, Check, Filter } from 'lucide-react';
import clsx from 'clsx';

export const REFERENCE_OPTIONS = [
  'Architect',
  'Interior Designer',
  'Builder',
  'Automation Consultant',
  'Direct Client',
  'Other'
];

export const STATUS_OPTIONS = [
  'Scheduled',
  'Pending',
  'Confirmed',
  'Completed',
  'Rescheduled',
  'Cancelled',
  'No Show'
];

export const DATE_PRESETS = [
  'Today',
  'Tomorrow',
  'This Week',
  'Next Week',
  'This Month',
  'Past Appointments'
];

export const TIME_PERIODS = [
  'Morning',
  'Afternoon',
  'Evening'
];

export const isDateMatchingPreset = (dateVal, preset) => {
  if (!dateVal) return false;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return false;

  const now = new Date();

  // Helper to extract local YYYY-MM-DD
  const toLocalDateStr = (dt) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Helper to extract UTC YYYY-MM-DD (for ISO dates like 2026-11-20T00:00:00.000Z)
  const toUtcDateStr = (dt) => {
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dt.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const dLocal = toLocalDateStr(d);
  const dUtc = toUtcDateStr(d);
  const todayLocal = toLocalDateStr(now);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowLocal = toLocalDateStr(tomorrow);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (preset === 'Today') {
    return dLocal === todayLocal || dUtc === todayLocal || (d >= startOfToday && d <= endOfToday);
  }

  if (preset === 'Tomorrow') {
    return dLocal === tomorrowLocal || dUtc === tomorrowLocal;
  }

  if (preset === 'This Week') {
    const day = now.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(startOfToday);
    monday.setDate(monday.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return (d >= monday && d <= sunday) || dLocal >= toLocalDateStr(monday) && dLocal <= toLocalDateStr(sunday);
  }

  if (preset === 'Next Week') {
    const day = now.getDay();
    const diffToNextMonday = ((day === 0 ? -6 : 1) - day) + 7;
    const nextMonday = new Date(startOfToday);
    nextMonday.setDate(nextMonday.getDate() + diffToNextMonday);
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextSunday.getDate() + 6);
    nextSunday.setHours(23, 59, 59, 999);
    return (d >= nextMonday && d <= nextSunday) || dLocal >= toLocalDateStr(nextMonday) && dLocal <= toLocalDateStr(nextSunday);
  }

  if (preset === 'This Month') {
    return (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) ||
           (d.getUTCFullYear() === now.getFullYear() && d.getUTCMonth() === now.getMonth());
  }

  if (preset === 'Past Appointments') {
    return d < startOfToday && dLocal < todayLocal;
  }

  return false;
};

export const isTimeMatchingPeriod = (timeStr, period) => {
  if (!timeStr) return false;
  let hours = 0;
  const match = timeStr.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i);
  if (match) {
    hours = parseInt(match[1], 10);
    const ampm = match[3] ? match[3].toLowerCase() : null;
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
  } else {
    return false;
  }

  if (period === 'Morning') {
    return hours >= 6 && hours < 12;
  }
  if (period === 'Afternoon') {
    return hours >= 12 && hours < 17;
  }
  if (period === 'Evening') {
    return hours >= 17 && hours <= 23;
  }
  return false;
};

export const AppointmentAdvancedFilters = ({
  isOpen,
  onClose,
  data = [],
  appliedFilters = {
    reference: [],
    status: [],
    date: [],
    time: []
  },
  onLiveChange,
  onApplyFilters,
  onResetFilters
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stagedFilters, setStagedFilters] = useState(appliedFilters);
  const prevIsOpen = React.useRef(isOpen);

  // Sync staged with applied when panel is freshly opened
  React.useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      setStagedFilters(appliedFilters);
      setSearchTerm('');
    } else if (isOpen) {
      setStagedFilters(appliedFilters);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, appliedFilters]);

  // Calculate dynamic record counts
  const counts = useMemo(() => {
    const res = {
      reference: {},
      status: {},
      date: {},
      time: {}
    };

    REFERENCE_OPTIONS.forEach((opt) => (res.reference[opt] = 0));
    STATUS_OPTIONS.forEach((opt) => (res.status[opt] = 0));
    DATE_PRESETS.forEach((opt) => (res.date[opt] = 0));
    TIME_PERIODS.forEach((opt) => (res.time[opt] = 0));

    data.forEach((row) => {
      // Reference
      const ref = row.reference || 'Direct Client';
      if (res.reference[ref] !== undefined) {
        res.reference[ref]++;
      } else {
        res.reference['Other'] = (res.reference['Other'] || 0) + 1;
      }

      // Status
      const st = row.status || 'Scheduled';
      if (res.status[st] !== undefined) {
        res.status[st]++;
      }

      // Date Presets
      DATE_PRESETS.forEach((preset) => {
        if (isDateMatchingPreset(row.appointmentDate, preset)) {
          res.date[preset]++;
        }
      });

      // Time Periods
      TIME_PERIODS.forEach((period) => {
        if (isTimeMatchingPeriod(row.appointmentTime, period)) {
          res.time[period]++;
        }
      });
    });

    return res;
  }, [data]);

  const toggleOption = (group, option) => {
    setStagedFilters((prev) => {
      const current = prev[group] || [];
      const updatedList = current.includes(option)
        ? current.filter((x) => x !== option)
        : [...current, option];
      const nextFilters = { ...prev, [group]: updatedList };
      if (onLiveChange) {
        onLiveChange(nextFilters);
      }
      return nextFilters;
    });
  };

  const handleClearAll = () => {
    const cleared = {
      reference: [],
      status: [],
      date: [],
      time: []
    };
    setStagedFilters(cleared);
    if (onLiveChange) {
      onLiveChange(cleared);
    }
  };

  const handleReset = () => {
    handleClearAll();
    onResetFilters();
    onClose();
  };

  const handleApply = () => {
    onApplyFilters(stagedFilters);
    onClose();
  };

  const totalSelectedCount =
    (stagedFilters.reference?.length || 0) +
    (stagedFilters.status?.length || 0) +
    (stagedFilters.date?.length || 0) +
    (stagedFilters.time?.length || 0);

  if (!isOpen) return null;

  const matchesSearch = (text) => {
    if (!searchTerm.trim()) return true;
    return text.toLowerCase().includes(searchTerm.toLowerCase().trim());
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 sm:hidden"
        onClick={onClose}
      />

      {/* Popover Panel: Desktop floating popover, Mobile bottom-sheet with 2-column layout */}
      <div className="fixed inset-x-2 bottom-2 z-50 max-h-[85vh] sm:max-h-[520px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-[500px] md:w-[540px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col font-sans overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="p-4 pb-2 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#31747d] rounded-full inline-block" />
            <h4 className="text-xs font-bold text-gray-900 tracking-tight">Advanced Filters</h4>
          </div>

          <div className="flex items-center gap-2">
            {totalSelectedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#31747d]/10 text-[#31747d]">
                {totalSelectedCount} Selected
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Search Input at Top */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search filter values..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#31747d] font-sans"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Filter Sections (2-column rows layout matching users/all & admin/all) */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1 text-xs">
          {/* 1. REFERENCE */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
              REFERENCE
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
              {REFERENCE_OPTIONS.filter(matchesSearch).map((opt) => {
                const isChecked = stagedFilters.reference?.includes(opt);
                const count = counts.reference[opt] || 0;
                return (
                  <label
                    key={opt}
                    className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer select-none transition-colors"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOption('reference', opt)}
                        className="w-3.5 h-3.5 text-[#31747d] rounded border-gray-300 focus:ring-[#31747d] cursor-pointer"
                      />
                      <span className={clsx('text-xs truncate max-w-[170px]', isChecked ? 'font-semibold text-gray-900' : 'text-gray-700')}>
                        {opt}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 font-semibold shrink-0 ml-1.5">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. STATUS */}
          <div className="pt-2 border-t border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
              STATUS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
              {STATUS_OPTIONS.filter(matchesSearch).map((opt) => {
                const isChecked = stagedFilters.status?.includes(opt);
                const count = counts.status[opt] || 0;
                return (
                  <label
                    key={opt}
                    className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer select-none transition-colors"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOption('status', opt)}
                        className="w-3.5 h-3.5 text-[#31747d] rounded border-gray-300 focus:ring-[#31747d] cursor-pointer"
                      />
                      <span className={clsx('text-xs truncate max-w-[170px]', isChecked ? 'font-semibold text-gray-900' : 'text-gray-700')}>
                        {opt}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 font-semibold shrink-0 ml-1.5">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. APPOINTMENT DATE */}
          <div className="pt-2 border-t border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
              APPOINTMENT DATE
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
              {DATE_PRESETS.filter(matchesSearch).map((opt) => {
                const isChecked = stagedFilters.date?.includes(opt);
                const count = counts.date[opt] || 0;
                return (
                  <label
                    key={opt}
                    className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer select-none transition-colors"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOption('date', opt)}
                        className="w-3.5 h-3.5 text-[#31747d] rounded border-gray-300 focus:ring-[#31747d] cursor-pointer"
                      />
                      <span className={clsx('text-xs truncate max-w-[170px]', isChecked ? 'font-semibold text-gray-900' : 'text-gray-700')}>
                        {opt}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 font-semibold shrink-0 ml-1.5">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. APPOINTMENT TIME */}
          <div className="pt-2 border-t border-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
              APPOINTMENT TIME
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
              {TIME_PERIODS.filter(matchesSearch).map((opt) => {
                const isChecked = stagedFilters.time?.includes(opt);
                const count = counts.time[opt] || 0;
                return (
                  <label
                    key={opt}
                    className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer select-none transition-colors"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOption('time', opt)}
                        className="w-3.5 h-3.5 text-[#31747d] rounded border-gray-300 focus:ring-[#31747d] cursor-pointer"
                      />
                      <span className={clsx('text-xs truncate max-w-[170px]', isChecked ? 'font-semibold text-gray-900' : 'text-gray-700')}>
                        {opt}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 font-semibold shrink-0 ml-1.5">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions (Permanently visible while scrolling, never overlaps options) */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200/90 p-3 px-4 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-500 font-medium">
              {totalSelectedCount} selected
            </span>
            {totalSelectedCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 bg-[#31747d] hover:bg-[#255b62] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentAdvancedFilters;
