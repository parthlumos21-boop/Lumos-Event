import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, FileSpreadsheet, FileText, Download, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export const GuestExportModal = ({ isOpen, onClose, initialFormat = 'xlsx' }) => {
  const [format, setFormat] = useState(initialFormat);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleExport = async (e) => {
    e.preventDefault();
    setIsExporting(true);
    setErrorMessage('');

    try {
      const params = { format };
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const response = await axiosClient.get('/guests/export', {
        params,
        responseType: 'blob'
      });

      // Derive extension and mime
      const ext = format === 'pdf' ? 'pdf' : 'xlsx';
      const timeStampStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
      const filename = `Lumos_Guest_Report_${timeStampStr}.${ext}`;

      // Create download anchor and click
      const blob = new Blob([response.data], {
        type: format === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      onClose();
    } catch (err) {
      console.error('Failed to export guests:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to generate export file. Please try again.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Export Guest Records</h3>
              <p className="text-xs text-gray-500 mt-0.5">Generate a report in Excel or PDF format</p>
            </div>
            <button
              onClick={onClose}
              disabled={isExporting}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleExport} className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Format Selection Toggle */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('xlsx')}
                  className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                    format === 'xlsx'
                      ? 'border-[#31747d] bg-[#31747d]/10 text-[#31747d] shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                  }`}
                >
                  <FileSpreadsheet size={16} className={format === 'xlsx' ? 'text-[#31747d]' : 'text-emerald-600'} />
                  <span>Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('pdf')}
                  className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                    format === 'pdf'
                      ? 'border-[#31747d] bg-[#31747d]/10 text-[#31747d] shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                  }`}
                >
                  <FileText size={16} className={format === 'pdf' ? 'text-[#31747d]' : 'text-rose-500'} />
                  <span>PDF (.pdf)</span>
                </button>
              </div>
            </div>

            {/* Date Range Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  From Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#31747d] focus:ring-1 focus:ring-[#31747d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  To Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#31747d] focus:ring-1 focus:ring-[#31747d]"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              Leave dates blank to export all recorded guests according to your access permissions.
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isExporting}
                className="px-4 py-2.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#31747d] hover:bg-[#255b62] text-white text-xs font-semibold rounded-full shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {isExporting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>Export Now</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
