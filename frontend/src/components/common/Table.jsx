import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowUpDown, FilterX, Edit, Trash2, CheckSquare, Square, MinusSquare } from 'lucide-react';
import clsx from 'clsx';

const Table = ({
  columns = [],
  data = [],
  keyField = '_id',
  pageSize = 10,
  emptyMessage = 'No records found',
  role = 'employee',
  onUpdate,
  onDelete,
  onRowDoubleClick
}) => {
  const [columnFilters, setColumnFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Default sorting: LIFO (newest first by createdAt or _id descending)
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Reset selected rows when data changes significantly
  useEffect(() => {
    setSelectedIds(prev => prev.filter(id => data.some(item => (item[keyField] || item._id) === id)));
  }, [data, keyField]);

  const handleFilterChange = (key, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Safe accessor for nested paths (e.g. 'guest.name')
  const getVal = (obj, path) => {
    if (!path) return '';
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : ''), obj);
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(row => {
      return Object.entries(columnFilters).every(([key, filterVal]) => {
        if (!filterVal || filterVal.trim() === '') return true;
        const cellValue = getVal(row, key);
        if (cellValue === null || cellValue === undefined) return false;

        if (Array.isArray(cellValue)) {
          return cellValue.some(item =>
            String(item).toLowerCase().includes(filterVal.toLowerCase().trim())
          );
        }

        return String(cellValue).toLowerCase().includes(filterVal.toLowerCase().trim());
      });
    });
  }, [data, columnFilters]);

  // Sorted data (LIFO default)
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = getVal(a, sortConfig.key);
      const bVal = getVal(b, sortConfig.key);

      // Handle dates or mongo IDs
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
    return paginatedData.map(row => row[keyField] || row._id);
  }, [paginatedData, keyField]);

  const isAllCurrentSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.includes(id));
  const isSomeCurrentSelected = currentPageIds.some(id => selectedIds.includes(id)) && !isAllCurrentSelected;

  const handleSelectAll = () => {
    if (isAllCurrentSelected) {
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Selected records lookup
  const selectedRecords = useMemo(() => {
    return data.filter(row => selectedIds.includes(row[keyField] || row._id));
  }, [data, selectedIds, keyField]);

  const handleTriggerUpdate = () => {
    if (selectedRecords.length === 1 && onUpdate) {
      onUpdate(selectedRecords[0]);
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

  const hasActiveFilters = Object.values(columnFilters).some(v => v && v.trim() !== '');

  return (
    <div className="w-full bg-white border border-gray-200 rounded-3xl shadow-xs overflow-hidden flex flex-col font-sans">
      {/* Table Top Toolbar */}
      <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#31747d]">
            Total Records:{' '}
            <span className="font-mono text-gray-900 bg-gray-200/80 px-2 py-0.5 rounded-full text-xs">
              {data.length}
            </span>
          </span>
          {hasActiveFilters && (
            <span className="text-xs text-gray-500">
              (Filtered:{' '}
              <span className="font-mono text-[#31747d] font-bold">{sortedData.length}</span>)
            </span>
          )}
        </div>

        {/* Selected Rows Contextual Action Toolbar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-[#31747d]/10 border border-[#31747d]/20 px-3 py-1.5 rounded-full animate-in fade-in duration-200">
            {/* Selected Counter */}
            <span className="text-xs font-semibold text-[#31747d] font-mono px-1">
              {selectedIds.length} selected
            </span>

            {/* Update Action (Available to Employee & Admin when 1 row is selected) */}
            {selectedIds.length === 1 && onUpdate && (
              <button
                type="button"
                onClick={handleTriggerUpdate}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gray-50 text-[#31747d] border border-[#31747d]/30 rounded-full text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Update selected record"
              >
                <Edit size={12} />
                <span>Update</span>
              </button>
            )}

            {/* Deselect Action (Placed before Delete) */}
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Deselect all selected rows"
            >
              Deselect
            </button>

            {/* Delete Action (STRICT ADMIN ONLY - ICON ONLY) */}
            {role === 'admin' && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xs transition-colors cursor-pointer flex items-center justify-center"
                title={`Delete ${selectedIds.length} selected record(s) - Admin Only`}
                aria-label="Delete selected records"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors cursor-pointer"
          >
            <FilterX size={13} /> Clear Filters
          </button>
        )}
      </div>

      {/* Responsive Table Container with compact dimensions */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[650px]">
          {/* Header */}
          <thead>
            <tr className="bg-gray-100/80 border-b border-gray-200">
              {/* Checkbox Header */}
              <th className="w-10 px-3 py-2.5 text-center select-none">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-gray-500 hover:text-[#31747d] cursor-pointer flex items-center justify-center mx-auto"
                  title={isAllCurrentSelected ? 'Deselect Page' : 'Select Page'}
                >
                  {isAllCurrentSelected ? (
                    <CheckSquare size={16} className="text-[#31747d]" />
                  ) : isSomeCurrentSelected ? (
                    <MinusSquare size={16} className="text-[#31747d]" />
                  ) : (
                    <Square size={16} className="text-gray-400" />
                  )}
                </button>
              </th>

              {/* Sequential Serial No. Header */}
              <th className="w-14 px-2.5 py-2.5 text-center text-[11px] font-bold text-[#31747d] uppercase tracking-wider select-none font-mono">
                No.
              </th>

              {/* Custom Columns */}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2.5 text-[11px] font-bold text-[#31747d] uppercase tracking-wider select-none"
                >
                  <div
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={clsx(
                      'inline-flex items-center gap-1',
                      col.sortable !== false && 'cursor-pointer hover:text-black'
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
            </tr>

            {/* Column-wise Search Filters Row */}
            <tr className="bg-gray-50/90 border-b border-gray-200">
              {/* Blank under Checkbox & No. */}
              <th className="px-3 py-1.5" />
              <th className="px-2.5 py-1.5" />

              {columns.map((col) => (
                <th key={`search-${col.key}`} className="px-2.5 py-1.5 font-normal">
                  {col.filterable !== false ? (
                    <div className="relative">
                      <Search
                        size={12}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={columnFilters[col.key] || ''}
                        onChange={(e) => handleFilterChange(col.key, e.target.value)}
                        placeholder={`Search ${col.label}...`}
                        className="w-full pl-6.5 pr-2 py-1 text-xs bg-white border border-gray-300 rounded-md text-[#31747d] placeholder-gray-400 focus:outline-none focus:border-[#31747d] focus:ring-1 focus:ring-[#31747d] transition-all"
                      />
                    </div>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100 text-xs">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-10 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <p className="text-sm font-medium text-gray-600">{emptyMessage}</p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-[#31747d] underline hover:text-[#255b62] cursor-pointer"
                      >
                        Reset search filters
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
                      onRowDoubleClick && 'cursor-pointer hover:bg-[#31747d]/5',
                      isSelected ? 'bg-[#31747d]/10' : 'hover:bg-gray-50/80'
                    )}
                    title={onRowDoubleClick ? 'Double-click to open full profile' : undefined}
                  >
                    {/* Row Checkbox */}
                    <td className="w-10 px-3 py-2 text-center" onDoubleClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleToggleRow(rowId)}
                        className="text-gray-400 hover:text-[#31747d] cursor-pointer flex items-center justify-center mx-auto"
                      >
                        {isSelected ? (
                          <CheckSquare size={15} className="text-[#31747d]" />
                        ) : (
                          <Square size={15} className="text-gray-300 group-hover:text-gray-400" />
                        )}
                      </button>
                    </td>

                    {/* Sequential Serial No. */}
                    <td className="w-14 px-2.5 py-2 text-center font-mono font-semibold text-gray-500 text-xs">
                      {serialNo}
                    </td>

                    {/* Custom Columns Data */}
                    {columns.map((col) => (
                      <td key={`${rowId}-${col.key}`} className="px-3 py-2 text-gray-700">
                        {col.render ? col.render(row) : (getVal(row, col.key) || '-')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
        <div>
          Showing{' '}
          <span className="font-semibold text-gray-900">
            {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-gray-900">
            {Math.min(currentPage * pageSize, sortedData.length)}
          </span>{' '}
          of <span className="font-semibold text-gray-900">{sortedData.length}</span> entries
        </div>

        <div className="flex items-center gap-2">
          {/* First Button Only */}
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:text-[#31747d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
          >
            First
          </button>

          {/* Numerical Page Pills */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((num, idx) => {
              if (num === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1.5 text-gray-400 font-mono text-xs">
                    ...
                  </span>
                );
              }
              const isActive = currentPage === num;
              return (
                <button
                  key={`page-${num}`}
                  onClick={() => setCurrentPage(num)}
                  className={clsx(
                    'min-w-7 h-7 px-2 rounded-full text-xs font-mono transition-all flex items-center justify-center cursor-pointer',
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

          {/* Last Button Only */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:text-[#31747d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
          >
            Last
          </button>
        </div>
      </div>

      {/* Admin Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4">
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
