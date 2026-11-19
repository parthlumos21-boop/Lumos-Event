import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  Filter,
  Calendar,
  X,
  ChevronDown,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  MinusSquare,
  Eye,
  Check
} from 'lucide-react';
import clsx from 'clsx';
import { DASHBOARD_FILTER_MAP } from '../dashboard/GuestInsightsPanels';

const Table = ({
  columns = [],
  data = [],
  keyField = '_id',
  pageSize: initialPageSize = 10,
  emptyMessage = 'No records found',
  role = 'employee',
  onUpdate,
  onDelete,
  onRowDoubleClick
}) => {
  // Column-wise search filters state
  const [columnFilters, setColumnFilters] = useState({});
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sorting: LIFO default (newest first)
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Popover menus state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');

  // Advanced multi-select filters
  const [selectedRelationships, setSelectedRelationships] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedFollowUp, setSelectedFollowUp] = useState([]);
  const [dateRange, setDateRange] = useState({ preset: 'all', from: '', to: '' });

  // Mobile expandable card rows
  const [expandedRowIds, setExpandedRowIds] = useState([]);

  const filterRef = useRef(null);
  const dateRef = useRef(null);
  const location = useLocation();

  // Listen for filter parameters from URL / state (e.g. from Dashboard click-throughs)
  useEffect(() => {
    if (!location) return;
    const searchParams = new URLSearchParams(location.search);
    const qInterest = searchParams.get('interest');
    const qRel = searchParams.get('relationship');

    // 1. Sync Interests Filter
    const stateInterests = location.state?.filterInterests;
    if (stateInterests && Array.isArray(stateInterests) && stateInterests.length > 0) {
      setSelectedInterests(stateInterests);
      setCurrentPage(1);
    } else if (qInterest) {
      const mapped =
        DASHBOARD_FILTER_MAP?.interests?.[qInterest] || [qInterest];
      setSelectedInterests(mapped);
      setCurrentPage(1);
    }

    // 2. Sync Relationships Filter
    const stateRels = location.state?.filterRelationships;
    if (stateRels && Array.isArray(stateRels) && stateRels.length > 0) {
      setSelectedRelationships(stateRels);
      setCurrentPage(1);
    } else if (qRel) {
      const mapped =
        DASHBOARD_FILTER_MAP?.relationships?.[qRel] || [qRel];
      setSelectedRelationships(mapped);
      setCurrentPage(1);
    }
  }, [location, location.search, location.state]);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setIsDateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected rows when data changes
  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => data.some((item) => (item[keyField] || item._id) === id))
    );
  }, [data, keyField]);

  // Safe accessor for nested paths (e.g. 'guest.name')
  const getVal = (obj, path) => {
    if (!path) return '';
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : ''), obj);
  };

  const handleColumnFilterChange = (key, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const clearColumnFilters = () => {
    setColumnFilters({});
    setCurrentPage(1);
  };

  const hasActiveColumnFilters = Object.values(columnFilters).some(
    (v) => v && String(v).trim() !== ''
  );

  // Derive unique filter options & live counts from dataset
  const filterOptions = useMemo(() => {
    const relCounts = {};
    const interestCounts = {};
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const followUpCounts = { Yes: 0, No: 0 };

    data.forEach((row) => {
      // Relationship
      const rel = row.relationship || 'Other';
      relCounts[rel] = (relCounts[rel] || 0) + 1;

      // Interests
      const ints = Array.isArray(row.interests) ? row.interests : [];
      ints.forEach((i) => {
        interestCounts[i] = (interestCounts[i] || 0) + 1;
      });

      // Rating
      const r = row.feedback?.rating;
      if (r && ratingCounts[r] !== undefined) {
        ratingCounts[r] += 1;
      }

      // Follow Up
      const fu = row.followUp?.required ? 'Yes' : 'No';
      followUpCounts[fu] = (followUpCounts[fu] || 0) + 1;
    });

    return {
      relationships: Object.entries(relCounts).map(([value, count]) => ({ value, count })),
      interests: Object.entries(interestCounts).map(([value, count]) => ({ value, count })),
      ratings: [5, 4, 3, 2, 1].map((r) => ({ value: r, count: ratingCounts[r] || 0 })),
      followUps: [
        { value: 'Yes', label: 'Follow-up Required', count: followUpCounts.Yes },
        { value: 'No', label: 'No Follow-up', count: followUpCounts.No }
      ]
    };
  }, [data]);

  // Total active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedRelationships.length > 0) count++;
    if (selectedInterests.length > 0) count++;
    if (selectedRatings.length > 0) count++;
    if (selectedFollowUp.length > 0) count++;
    if (dateRange.preset !== 'all' || (dateRange.from && dateRange.to)) count++;
    return count;
  }, [selectedRelationships, selectedInterests, selectedRatings, selectedFollowUp, dateRange]);

  const clearAllFilters = () => {
    setColumnFilters({});
    setSelectedRelationships([]);
    setSelectedInterests([]);
    setSelectedRatings([]);
    setSelectedFollowUp([]);
    setDateRange({ preset: 'all', from: '', to: '' });
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 1. Column-wise filters
      const matchColumns = Object.entries(columnFilters).every(([key, filterVal]) => {
        if (!filterVal || String(filterVal).trim() === '') return true;
        const q = String(filterVal).toLowerCase().trim();
        const cellVal = getVal(row, key);
        if (cellVal === null || cellVal === undefined) return false;

        if (Array.isArray(cellVal)) {
          return cellVal.some((item) => String(item).toLowerCase().includes(q));
        }

        if (key === 'createdAt' || key === 'event.eventDate') {
          const d = new Date(cellVal);
          if (!isNaN(d.getTime())) {
            const dateStr = d.toLocaleDateString();
            return dateStr.toLowerCase().includes(q) || String(cellVal).toLowerCase().includes(q);
          }
        }

        return String(cellVal).toLowerCase().includes(q);
      });

      if (!matchColumns) return false;

      // 2. Relationship Filter
      if (selectedRelationships.length > 0) {
        if (!selectedRelationships.includes(row.relationship)) return false;
      }

      // 3. Interests Filter
      if (selectedInterests.length > 0) {
        const rowInterests = Array.isArray(row.interests) ? row.interests : [];
        const hasMatch = selectedInterests.some((i) => rowInterests.includes(i));
        if (!hasMatch) return false;
      }

      // 4. Rating Filter
      if (selectedRatings.length > 0) {
        const r = row.feedback?.rating;
        if (!selectedRatings.includes(Number(r))) return false;
      }

      // 5. Follow Up Filter
      if (selectedFollowUp.length > 0) {
        const isFu = row.followUp?.required ? 'Yes' : 'No';
        if (!selectedFollowUp.includes(isFu)) return false;
      }

      // 6. Date Filter
      if (dateRange.preset !== 'all') {
        const rowDate = row.createdAt ? new Date(row.createdAt) : null;
        if (!rowDate || isNaN(rowDate.getTime())) return false;

        const now = new Date();
        now.setHours(23, 59, 59, 999);

        if (dateRange.preset === 'today') {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          if (rowDate < startOfToday || rowDate > now) return false;
        } else if (dateRange.preset === '7days') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          sevenDaysAgo.setHours(0, 0, 0, 0);
          if (rowDate < sevenDaysAgo || rowDate > now) return false;
        } else if (dateRange.preset === '30days') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          thirtyDaysAgo.setHours(0, 0, 0, 0);
          if (rowDate < thirtyDaysAgo || rowDate > now) return false;
        } else if (dateRange.preset === 'custom' && dateRange.from && dateRange.to) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (rowDate < fromDate || rowDate > toDate) return false;
        }
      }

      return true;
    });
  }, [
    data,
    columnFilters,
    selectedRelationships,
    selectedInterests,
    selectedRatings,
    selectedFollowUp,
    dateRange
  ]);

  // Sorted dataset (LIFO default)
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = getVal(a, sortConfig.key);
      const bVal = getVal(b, sortConfig.key);

      if (sortConfig.key === 'createdAt' || sortConfig.key === 'event.eventDate') {
        const aTime = aVal ? new Date(aVal).getTime() : 0;
        const bTime = bVal ? new Date(bVal).getTime() : 0;
        return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Checkbox selection logic
  const currentPageIds = useMemo(() => {
    return paginatedData.map((row) => row[keyField] || row._id);
  }, [paginatedData, keyField]);

  const isAllCurrentSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));
  const isSomeCurrentSelected =
    currentPageIds.some((id) => selectedIds.includes(id)) && !isAllCurrentSelected;

  const handleSelectAll = () => {
    if (isAllCurrentSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedRecords = useMemo(() => {
    return data.filter((row) => selectedIds.includes(row[keyField] || row._id));
  }, [data, selectedIds, keyField]);

  const handleTriggerUpdate = (record = null) => {
    const target = record || (selectedRecords.length === 1 ? selectedRecords[0] : null);
    if (target && onUpdate) {
      onUpdate(target);
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDelete || selectedIds.length === 0) return;
    setDeleting(true);
    try {
      await onDelete(selectedIds);
      setSelectedIds([]);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Delete error in table:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Generate page pill list (1, 2, 3...)
  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  const toggleRowExpand = (id) => {
    setExpandedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const hasAnyFilterActive = hasActiveColumnFilters || activeFiltersCount > 0;

  return (
    <div className="w-full bg-white border border-gray-200/90 rounded-3xl shadow-xs flex flex-col font-sans relative">
      {/* 1. Compact SaaS Toolbar (Right-aligned filter controls strictly preserved) */}
      <div className="p-3.5 sm:p-4 border-b border-gray-100/90 flex flex-wrap items-center justify-between gap-3 bg-white rounded-t-3xl">
        {selectedIds.length === 0 ? (
          <>
            {/* Left: Filtered Status / Record summary to balance toolbar */}
            <div className="flex items-center gap-2">
              {hasAnyFilterActive && (
                <span className="text-xs text-gray-500 font-medium animate-in fade-in">
                  Filtered view:{' '}
                  <strong className="text-[#31747d] font-mono">{filteredData.length}</strong> of{' '}
                  <strong className="text-gray-800 font-mono">{data.length}</strong> records
                </span>
              )}
            </div>

            {/* Right: Date Filter, Advanced Filters & Total Records Pill (Position strictly preserved) */}
            <div className="flex items-center flex-wrap gap-2.5 ml-auto">
              {/* Date Filter Popover */}
              <div className="relative" ref={dateRef}>
                <button
                  type="button"
                  onClick={() => setIsDateOpen(!isDateOpen)}
                  className={clsx(
                    'inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all cursor-pointer',
                    dateRange.preset !== 'all'
                      ? 'bg-[#31747d]/10 text-[#31747d] border-[#31747d]/40 shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200/90 hover:bg-gray-50 hover:border-gray-300'
                  )}
                  title="Filter by registration date"
                >
                  <Calendar size={14} className={dateRange.preset !== 'all' ? 'text-[#31747d]' : 'text-gray-500'} />
                  <span>
                    {dateRange.preset === 'today'
                      ? 'Today'
                      : dateRange.preset === '7days'
                      ? 'Last 7 Days'
                      : dateRange.preset === '30days'
                      ? 'Last 30 Days'
                      : dateRange.preset === 'custom'
                      ? 'Custom Range'
                      : 'Select dates'}
                  </span>
                  <ChevronDown size={13} className="text-gray-400" />
                </button>

                {isDateOpen && (
                  <>
                    <div
                      className="fixed inset-0 bg-black/20 backdrop-blur-2xs z-40 sm:hidden"
                      onClick={() => setIsDateOpen(false)}
                    />
                    <div className="fixed inset-x-4 top-24 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between pb-1 sm:pb-0">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">
                          Date Range
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsDateOpen(false)}
                          className="sm:hidden p-1 text-gray-400 hover:text-gray-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="space-y-1 text-xs">
                      {[
                        { id: 'all', label: 'All Time' },
                        { id: 'today', label: 'Today' },
                        { id: '7days', label: 'Last 7 Days' },
                        { id: '30days', label: 'Last 30 Days' },
                        { id: 'custom', label: 'Custom Range' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setDateRange((prev) => ({ ...prev, preset: item.id }));
                            if (item.id !== 'custom') setIsDateOpen(false);
                            setCurrentPage(1);
                          }}
                          className={clsx(
                            'w-full text-left px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-between cursor-pointer',
                            dateRange.preset === item.id
                              ? 'bg-[#31747d] text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          )}
                        >
                          <span>{item.label}</span>
                          {dateRange.preset === item.id && <Check size={13} />}
                        </button>
                      ))}
                    </div>

                    {dateRange.preset === 'custom' && (
                      <div className="pt-2 border-t border-gray-100 space-y-2">
                        <div>
                          <label className="text-[10px] text-gray-500 block mb-1">From Date</label>
                          <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => {
                              setDateRange((prev) => ({ ...prev, from: e.target.value }));
                              setCurrentPage(1);
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 block mb-1">To Date</label>
                          <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => {
                              setDateRange((prev) => ({ ...prev, to: e.target.value }));
                              setCurrentPage(1);
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsDateOpen(false)}
                          className="w-full py-1.5 bg-[#31747d] text-white text-xs font-semibold rounded-xl hover:bg-[#255b62]"
                        >
                          Apply Range
                        </button>
                      </div>
                    )}
                  </div>
                  </>
                )}
              </div>

              {/* Advanced Filters Popover (Inspired by Reference Image 3) */}
              <div className="relative" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={clsx(
                    'inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all cursor-pointer',
                    activeFiltersCount > 0
                      ? 'bg-[#31747d] text-white border-[#31747d] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200/90 hover:bg-gray-50 hover:border-gray-300'
                  )}
                  title="Advanced Multi-select Filters"
                >
                  <Filter size={14} className={activeFiltersCount > 0 ? 'text-white' : 'text-gray-500'} />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-white text-[#31747d] font-bold text-[10px] flex items-center justify-center font-mono">
                      {activeFiltersCount}
                    </span>
                  )}
                  <ChevronDown size={13} className={activeFiltersCount > 0 ? 'text-white/80' : 'text-gray-400'} />
                </button>

                {isFilterOpen && (
                  <>
                    {/* Mobile Backdrop */}
                    <div
                      className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 sm:hidden"
                      onClick={() => setIsFilterOpen(false)}
                    />

                    {/* Popover Panel: Desktop floating popover, Mobile bottom-sheet modal */}
                    <div className="fixed inset-x-2 bottom-2 z-50 max-h-[85vh] sm:max-h-[500px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 space-y-3 animate-in fade-in duration-150 overflow-y-auto">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-4 bg-[#31747d] rounded-full" />
                          <h4 className="text-xs font-bold text-gray-900">Advanced Filters</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          {activeFiltersCount > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRelationships([]);
                                setSelectedInterests([]);
                                setSelectedRatings([]);
                                setSelectedFollowUp([]);
                                setCurrentPage(1);
                              }}
                              className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                            >
                              Clear All
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsFilterOpen(false)}
                            className="sm:hidden p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
                            title="Close Filters"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                    {/* Popover Internal Search */}
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        placeholder="Search filter values..."
                        className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white"
                      />
                    </div>

                    {/* Category 1: Relationship */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Relationship
                      </p>
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        {filterOptions.relationships
                          .filter((r) =>
                            r.value.toLowerCase().includes(filterSearch.toLowerCase().trim())
                          )
                          .map((item) => {
                            const isChecked = selectedRelationships.includes(item.value);
                            return (
                              <label
                                key={item.value}
                                className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer text-xs"
                              >
                                <span className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      setSelectedRelationships((prev) =>
                                        isChecked
                                          ? prev.filter((v) => v !== item.value)
                                          : [...prev, item.value]
                                      );
                                      setCurrentPage(1);
                                    }}
                                    className="w-3.5 h-3.5 text-[#31747d] rounded border-gray-300 focus:ring-[#31747d]"
                                  />
                                  <span className="text-gray-700 font-medium">{item.value}</span>
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {item.count}
                                </span>
                              </label>
                            );
                          })}
                      </div>
                    </div>

                    {/* Category 2: Interests */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Areas of Interest
                      </p>
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {filterOptions.interests
                          .filter((i) =>
                            i.value.toLowerCase().includes(filterSearch.toLowerCase().trim())
                          )
                          .map((item) => {
                            const isChecked = selectedInterests.includes(item.value);
                            return (
                              <label
                                key={item.value}
                                className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer text-xs"
                              >
                                <span className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      setSelectedInterests((prev) =>
                                        isChecked
                                          ? prev.filter((v) => v !== item.value)
                                          : [...prev, item.value]
                                      );
                                      setCurrentPage(1);
                                    }}
                                    className="w-3.5 h-3.5 text-[#31747d] rounded border-gray-300 focus:ring-[#31747d]"
                                  />
                                  <span className="text-gray-700 font-medium">{item.value}</span>
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {item.count}
                                </span>
                              </label>
                            );
                          })}
                      </div>
                    </div>

                    {/* Category 3: Rating */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Experience Rating
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {filterOptions.ratings.map((item) => {
                          const isChecked = selectedRatings.includes(item.value);
                          return (
                            <label
                              key={item.value}
                              className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setSelectedRatings((prev) =>
                                      isChecked
                                        ? prev.filter((v) => v !== item.value)
                                        : [...prev, item.value]
                                    );
                                    setCurrentPage(1);
                                  }}
                                  className="w-3.5 h-3.5 text-[#31747d] rounded border-gray-300"
                                />
                                <span className="text-amber-500 font-bold">★ {item.value}</span>
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {item.count}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category 4: Follow Up */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Follow-up Status
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {filterOptions.followUps.map((item) => {
                          const isChecked = selectedFollowUp.includes(item.value);
                          return (
                            <label
                              key={item.value}
                              className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setSelectedFollowUp((prev) =>
                                      isChecked
                                        ? prev.filter((v) => v !== item.value)
                                        : [...prev, item.value]
                                    );
                                    setCurrentPage(1);
                                  }}
                                  className="w-3.5 h-3.5 text-[#31747d] rounded border-gray-300"
                                />
                                <span className="text-gray-700 font-medium">{item.label}</span>
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {item.count}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setIsFilterOpen(false)}
                        className="px-4 py-1.5 bg-[#31747d] hover:bg-[#255b62] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                  </>
                )}
              </div>

              {/* Total Records Counter */}
              <div className="px-3 py-1.5 bg-gray-50 border border-gray-200/80 rounded-2xl text-xs font-semibold text-gray-600 font-mono">
                {filteredData.length}{' '}
                <span className="font-sans font-normal text-gray-400">
                  {filteredData.length === 1 ? 'record' : 'records'}
                </span>
              </div>

              {/* Clear All Active Filters */}
              {hasAnyFilterActive && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                  title="Reset all filters"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </>
        ) : (
          /* Bulk Actions Bar (when rows are selected) */
          <div className="w-full flex items-center justify-between flex-wrap gap-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#31747d]/10 text-[#31747d] rounded-full text-xs font-bold font-mono border border-[#31747d]/20">
                {selectedIds.length} {selectedIds.length === 1 ? 'row' : 'rows'} selected
              </span>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer"
              >
                Deselect All
              </button>
            </div>

            <div className="flex items-center gap-2">
              {selectedIds.length === 1 && onUpdate && (
                <button
                  type="button"
                  onClick={() => handleTriggerUpdate()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-[#31747d] text-gray-700 hover:text-[#31747d] rounded-2xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <Edit size={13} />
                  <span>Edit Record</span>
                </button>
              )}

              {role === 'admin' && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Desktop Table (Clean headers, NO per-column inputs) */}
      <div className="hidden lg:block overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold uppercase tracking-wider text-gray-500 select-none">
              {/* Checkbox Header */}
              <th className="w-10 px-3.5 py-3 text-center">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-gray-400 hover:text-[#31747d] cursor-pointer flex items-center justify-center mx-auto"
                  title={isAllCurrentSelected ? 'Deselect Page' : 'Select Page'}
                >
                  {isAllCurrentSelected ? (
                    <CheckSquare size={16} className="text-[#31747d]" />
                  ) : isSomeCurrentSelected ? (
                    <MinusSquare size={16} className="text-[#31747d]" />
                  ) : (
                    <Square size={16} className="text-gray-300 hover:text-gray-500" />
                  )}
                </button>
              </th>

              {/* No. */}
              <th className="w-12 px-2 py-3 text-center font-mono">No.</th>

              {/* Dynamic Columns */}
              {columns.map((col) => (
                <th key={col.key} className="px-3.5 py-3">
                  <div
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={clsx(
                      'inline-flex items-center gap-1',
                      col.sortable !== false && 'cursor-pointer hover:text-gray-800'
                    )}
                  >
                    <span>{col.label}</span>
                    {col.sortable !== false && (
                      <ArrowUpDown
                        size={11}
                        className={clsx(
                          sortConfig.key === col.key ? 'text-[#31747d]' : 'text-gray-400'
                        )}
                      />
                    )}
                  </div>
                </th>
              ))}

              {/* Actions Column */}
              <th className="w-24 px-3.5 py-3 text-right">Actions</th>
            </tr>

            {/* Column-wise Search Inputs Row */}
            <tr className="bg-gray-50/50 border-b border-gray-200/80">
              {/* Checkbox spacer */}
              <th className="px-3.5 py-1.5 text-center" />
              {/* No. spacer */}
              <th className="px-2 py-1.5 text-center" />

              {/* Dynamic Column Search Inputs */}
              {columns.map((col) => (
                <th key={`search-${col.key}`} className="px-2.5 py-1.5 font-normal">
                  {col.filterable !== false ? (
                    <div className="relative">
                      <Search
                        size={11}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={columnFilters[col.key] || ''}
                        onChange={(e) => handleColumnFilterChange(col.key, e.target.value)}
                        placeholder={`Search ${col.label}...`}
                        className="w-full pl-6.5 pr-6 py-1 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#31747d] focus:ring-1 focus:ring-[#31747d]/20 transition-all font-normal"
                      />
                      {columnFilters[col.key] && (
                        <button
                          type="button"
                          onClick={() => handleColumnFilterChange(col.key, '')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          title="Clear column filter"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  ) : null}
                </th>
              ))}

              {/* Actions Header Spacer or Clear Button */}
              <th className="w-24 px-3.5 py-1.5 text-right font-normal">
                {hasActiveColumnFilters && (
                  <button
                    type="button"
                    onClick={clearColumnFilters}
                    className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                    title="Clear all column searches"
                  >
                    Clear
                  </button>
                )}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 3}
                  className="px-6 py-14 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm font-semibold text-gray-600">{emptyMessage}</p>
                    {hasAnyFilterActive && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-xs text-[#31747d] hover:underline font-medium cursor-pointer"
                      >
                        Reset search & filter criteria
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowId = row[keyField] || row._id || idx;
                const isSelected = selectedIds.includes(rowId);
                const serialNo = (currentPage - 1) * pageSize + idx + 1;

                return (
                  <tr
                    key={rowId}
                    onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row)}
                    className={clsx(
                      'transition-colors group',
                      isSelected ? 'bg-[#31747d]/10' : 'hover:bg-gray-50/70',
                      onRowDoubleClick && 'cursor-pointer'
                    )}
                    title={onRowDoubleClick ? 'Double-click to open full profile' : undefined}
                  >
                    {/* Checkbox */}
                    <td
                      className="w-10 px-3.5 py-3 text-center"
                      onDoubleClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleRow(rowId)}
                        className="text-gray-400 hover:text-[#31747d] cursor-pointer flex items-center justify-center mx-auto"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-[#31747d]" />
                        ) : (
                          <Square size={16} className="text-gray-300 group-hover:text-gray-400" />
                        )}
                      </button>
                    </td>

                    {/* Serial No. */}
                    <td className="w-12 px-2 py-3 text-center font-mono font-medium text-gray-400 text-xs">
                      {serialNo}
                    </td>

                    {/* Dynamic Columns Data */}
                    {columns.map((col) => (
                      <td key={`${rowId}-${col.key}`} className="px-3.5 py-3 text-gray-700">
                        {col.render ? col.render(row) : getVal(row, col.key) || '-'}
                      </td>
                    ))}

                    {/* Inline Actions */}
                    <td
                      className="w-24 px-3.5 py-3 text-right"
                      onDoubleClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        {onRowDoubleClick && (
                          <button
                            type="button"
                            onClick={() => onRowDoubleClick(row)}
                            className="p-1.5 text-gray-400 hover:text-[#31747d] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="View Profile"
                          >
                            <Eye size={14} />
                          </button>
                        )}

                        {onUpdate && (
                          <button
                            type="button"
                            onClick={() => onUpdate(row)}
                            className="p-1.5 text-gray-400 hover:text-[#31747d] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit size={14} />
                          </button>
                        )}

                        {role === 'admin' && onDelete && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedIds([rowId]);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Mobile & Tablet Responsive View (Stacked Cards to prevent overflow) */}
      <div className="lg:hidden divide-y divide-gray-100">
        {/* Mobile Column Search Toggle Bar */}
        <div className="p-3 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#31747d] cursor-pointer"
          >
            <Search size={13} />
            <span>Search by Column</span>
            <ChevronDown
              size={12}
              className={clsx('transition-transform', mobileSearchOpen && 'rotate-180')}
            />
          </button>
          {hasActiveColumnFilters && (
            <button
              type="button"
              onClick={clearColumnFilters}
              className="text-[11px] text-rose-600 font-semibold cursor-pointer hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {mobileSearchOpen && (
          <div className="p-3 bg-gray-50/90 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs animate-in fade-in">
            {columns
              .filter((c) => c.filterable !== false)
              .map((col) => (
                <div key={`mobile-search-${col.key}`} className="relative">
                  <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={columnFilters[col.key] || ''}
                    onChange={(e) => handleColumnFilterChange(col.key, e.target.value)}
                    placeholder={`Search ${col.label}...`}
                    className="w-full pl-6.5 pr-6 py-1 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#31747d]"
                  />
                  {columnFilters[col.key] && (
                    <button
                      type="button"
                      onClick={() => handleColumnFilterChange(col.key, '')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              ))}
          </div>
        )}

        {paginatedData.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            {emptyMessage}
          </div>
        ) : (
          paginatedData.map((row, idx) => {
            const rowId = row[keyField] || row._id || idx;
            const isSelected = selectedIds.includes(rowId);
            const serialNo = (currentPage - 1) * pageSize + idx + 1;
            const isExpanded = expandedRowIds.includes(rowId);

            // Universal field resolvers for both visitors and staff/employees
            const primaryName = row.name || row.guest?.name || getVal(row, 'name') || getVal(row, 'guest.name') || '-';
            const subText = row.department || row.guest?.company || row.company || '';
            const phoneText = row.phone || row.guest?.phone || getVal(row, 'phone') || getVal(row, 'guest.phone') || '';
            const emailText = row.email || row.guest?.email || getVal(row, 'email') || getVal(row, 'guest.email') || '';
            const badgeText = row.role
              ? (row.role.toLowerCase() === 'employee' ? 'Staff' : (row.role.charAt(0).toUpperCase() + row.role.slice(1).toLowerCase()))
              : (row.relationship || 'Guest');

            return (
              <div
                key={rowId}
                className={clsx(
                  'p-4 transition-colors space-y-2.5',
                  isSelected ? 'bg-[#31747d]/10' : 'bg-white'
                )}
              >
                {/* Mobile Card Top: Selection, No, Name, Relationship, Rating */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleRow(rowId)}
                      className="text-gray-400 hover:text-[#31747d]"
                    >
                      {isSelected ? (
                        <CheckSquare size={16} className="text-[#31747d]" />
                      ) : (
                        <Square size={16} className="text-gray-300" />
                      )}
                    </button>
                    <span className="text-xs font-mono font-medium text-gray-400">
                      {serialNo}
                    </span>
                    <div>
                      <h4
                        onClick={() => onRowDoubleClick && onRowDoubleClick(row)}
                        className="text-sm font-bold text-gray-900 hover:text-[#31747d] cursor-pointer"
                      >
                        {primaryName}
                      </h4>
                      {subText && (
                        <p className="text-[11px] text-gray-500">{subText}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {row.feedback?.rating ? (
                      <span className="text-xs font-bold text-amber-500">
                        ★ {row.feedback.rating}/5
                      </span>
                    ) : null}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#007788]/10 text-[#007788] border border-[#007788]/20 capitalize">
                      {badgeText}
                    </span>
                  </div>
                </div>

                {/* Mobile Contact Quick Line */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 pl-6">
                  {phoneText && (
                    <a
                      href={`tel:${phoneText}`}
                      className="hover:text-[#31747d] flex items-center gap-1 font-mono"
                    >
                      <span>📞</span> {phoneText}
                    </a>
                  )}
                  {emailText && (
                    <a
                      href={`mailto:${emailText}`}
                      className="hover:text-[#31747d] flex items-center gap-1 truncate max-w-[200px]"
                    >
                      <span>✉️</span> {emailText}
                    </a>
                  )}
                </div>

                {/* Expandable details */}
                {isExpanded && (
                  <div className="pl-6 pt-2 border-t border-gray-100 text-xs space-y-2 animate-in fade-in">
                    {row.department && (
                      <div className="text-[11px] text-gray-600">
                        <span className="font-semibold text-gray-500">Department:</span> {row.department}
                      </div>
                    )}
                    {Array.isArray(row.interests) && row.interests.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Interests:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {row.interests.map((i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-semibold rounded-md"
                            >
                              {i}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                      {row.followUp && (
                        <span>Follow-up: {row.followUp?.required ? 'Required' : 'None'}</span>
                      )}
                      <span>
                        Added: {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      {onRowDoubleClick && (
                        <button
                          type="button"
                          onClick={() => onRowDoubleClick(row)}
                          className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-xs text-center"
                        >
                          View Profile
                        </button>
                      )}
                      {onUpdate && (
                        <button
                          type="button"
                          onClick={() => onUpdate(row)}
                          className="flex-1 py-1.5 bg-[#31747d] hover:bg-[#255b62] text-white font-semibold rounded-xl text-xs text-center"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Toggle Expand */}
                <button
                  type="button"
                  onClick={() => toggleRowExpand(rowId)}
                  className="text-[11px] text-[#31747d] font-semibold pl-6 cursor-pointer flex items-center gap-1 hover:underline"
                >
                  <span>{isExpanded ? 'Show less' : 'View full details'}</span>
                  <ChevronDown
                    size={12}
                    className={clsx('transition-transform', isExpanded && 'rotate-180')}
                  />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Compact Pagination Footer (Inspired by Reference Image 2) */}
      <div className="px-4 sm:px-6 py-3 border-t border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600 rounded-b-3xl">
        {/* Left: Page count & Rows per page selector */}
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-700">
            Page <strong className="text-gray-900 font-mono">{currentPage}</strong> of{' '}
            <strong className="text-gray-900 font-mono">{totalPages}</strong>
          </span>

          <span className="text-gray-300">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#31747d] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Center: Showing X to Y of Z records */}
        <div className="text-gray-500 font-medium hidden lg:block">
          Showing{' '}
          <span className="font-semibold text-gray-900">
            {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-gray-900">
            {Math.min(currentPage * pageSize, sortedData.length)}
          </span>{' '}
          of <span className="font-semibold text-gray-900">{sortedData.length}</span> records
        </div>

        {/* Right: First, Numerical Pills, Last */}
        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          {/* First Button */}
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:text-[#31747d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
            title="First Page"
          >
            First
          </button>

          {/* Number Pills */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((num, idx) => {
              if (num === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-mono text-xs">
                    ...
                  </span>
                );
              }
              const isActive = currentPage === num;
              return (
                <button
                  key={`page-${num}`}
                  type="button"
                  onClick={() => setCurrentPage(num)}
                  className={clsx(
                    'min-w-7 h-7 px-2 rounded-xl text-xs font-mono transition-all flex items-center justify-center cursor-pointer',
                    isActive
                      ? 'bg-[#31747d] text-white font-bold shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-[#31747d]'
                  )}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Last Button */}
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:text-[#31747d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
            title="Last Page"
          >
            Last
          </button>
        </div>
      </div>

      {/* Admin Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Confirm Deletion</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently delete {selectedIds.length} selected record(s)? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
