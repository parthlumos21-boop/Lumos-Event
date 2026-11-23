import React, { useState, useMemo } from 'react';
import EmployeeCard from './EmployeeCard';
import { Users } from 'lucide-react';
import clsx from 'clsx';

const EmployeeCards = ({
  employees = [],
  loading = false,
  onEdit,
  onDelete,
  initialPageSize = 9
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Pagination calculation
  const total = employees.length;
  const totalPages = Math.ceil(total / pageSize) || 1;

  // Safe page clamping
  const activePage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedEmployees = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return employees.slice(start, start + pageSize);
  }, [employees, activePage, pageSize]);

  const startRecord = total === 0 ? 0 : (activePage - 1) * pageSize + 1;
  const endRecord = Math.min(activePage * pageSize, total);

  // Generate page numbers matching Table.jsx from admin/guests
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (activePage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (activePage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', activePage, '...', totalPages);
      }
    }
    return pages;
  }, [totalPages, activePage]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs animate-pulse space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-gray-200 rounded w-1/2" />
                <div className="h-2.5 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
            <div className="space-y-2.5 pt-2">
              <div className="h-2.5 bg-gray-100 rounded" />
              <div className="h-2.5 bg-gray-100 rounded" />
              <div className="h-2.5 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="bg-white border border-gray-200/90 rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
          <Users size={24} />
        </div>
        <h4 className="text-sm font-bold text-gray-800">No Employees Found</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          No employee records match your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans">
      {/* Responsive Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedEmployees.map((emp) => (
          <EmployeeCard
            key={emp._id}
            employee={emp}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Footer: Pagination & Record Count matching admin/guests */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-gray-500 font-mono">
          Showing <span className="font-semibold text-gray-800">{startRecord}</span> to{' '}
          <span className="font-semibold text-gray-800">{endRecord}</span> of{' '}
          <span className="font-semibold text-gray-800">{total}</span> records
        </div>

        <div className="flex items-center gap-3 self-center sm:self-auto flex-wrap">
          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="text-gray-500 text-[11px]">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-700 focus:outline-none focus:border-[#31747d] cursor-pointer"
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={18}>18</option>
              <option value={27}>27</option>
              <option value={9999}>All</option>
            </select>
          </div>

          {/* Navigation Controls: First Button, Numbered Pills, Last Button */}
          <div className="flex items-center gap-1.5">
            {/* First Button */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={activePage === 1}
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
                const isActive = activePage === num;
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
              disabled={activePage === totalPages || totalPages === 0}
              className="px-3 py-1 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:text-[#31747d] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
              title="Last Page"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCards;
