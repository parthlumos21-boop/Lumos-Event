import React from 'react';

const FullAuditHistoryModal = ({ isOpen, onClose, auditLogs = [], totalLogs = 0 }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#007788]/10 text-[#007788] flex items-center justify-center">
              <i className="fa-solid fa-rotate text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Complete System Audit History</h3>
              <p className="text-[11px] text-gray-500 font-mono">{totalLogs} total change revision(s)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-3.5 divide-y divide-gray-100">
          {auditLogs.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-8">No audit history entries found.</p>
          ) : (
            auditLogs.map((log) => {
              const logDate = new Date(log.changedAt);
              const isCreate = log.action === 'CREATE';
              const isDelete = log.action === 'DELETE';

              return (
                <div key={log._id} className="pt-3.5 first:pt-0 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCreate
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isDelete
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isCreate ? 'Created' : 'Updated'}
                      </span>
                      <span className="font-bold text-gray-900">
                        {log.changes && log.changes.length > 0
                          ? log.changes.map((c) => c.fieldLabel || c.field).join(', ')
                          : log.remarks || 'Record modified'}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {logDate.toLocaleDateString()} {logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {log.changes && log.changes.length > 0 && (
                    <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 space-y-1">
                      {log.changes.map((ch, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px]">
                          <span className="font-semibold text-gray-700">{ch.fieldLabel || ch.field}:</span>
                          <span className="text-red-500 line-through font-mono">
                            {String(ch.oldValue || '(empty)')}
                          </span>
                          <i className="fa-solid fa-arrow-right text-[9px] text-gray-400" />
                          <span className="text-emerald-700 font-bold font-mono">
                            {String(ch.newValue || '(empty)')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[11px] text-gray-500">
                    by <span className="font-semibold text-gray-800">{log.changedBy?.name || 'Staff User'}</span> · {log.changedBy?.role || 'admin'}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullAuditHistoryModal;
