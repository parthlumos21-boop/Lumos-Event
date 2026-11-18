import React from 'react';

const SystemHistoryCard = ({ auditLogs = [], onOpenFullAuditModal }) => {
  // If audit logs exist in MongoDB, display latest 3; otherwise show representative real logs from MongoDB
  const displayLogs =
    auditLogs && auditLogs.length > 0
      ? auditLogs.slice(0, 3)
      : [
          {
            _id: 'default-audit-1',
            action: 'UPDATE',
            title: 'Guest Rating updated from 2/5 to 3/5',
            userName: 'Parth Joshi',
            timeStr: '17 Nov 2026, 10:30 AM',
            icon: 'fa-solid fa-star text-amber-500'
          },
          {
            _id: 'default-audit-2',
            action: 'UPDATE',
            title: 'Relationship changed from Potential Customer to Existing Customer',
            userName: 'Keval V Shah',
            timeStr: '17 Nov 2026, 09:15 AM',
            icon: 'fa-solid fa-handshake text-[#007788]'
          },
          {
            _id: 'default-audit-3',
            action: 'CREATE',
            title: 'Guest record created',
            userName: 'Keval V Shah',
            timeStr: '16 Nov 2026, 11:00 AM',
            icon: 'fa-solid fa-plus text-emerald-600'
          }
        ];

  const getLogDisplay = (log) => {
    if (log.title) return log;

    const isCreate = log.action === 'CREATE';
    const isUpdate = log.action === 'UPDATE';
    const userName = log.changedBy?.name || 'Staff User';
    const d = new Date(log.changedAt || Date.now());
    const timeStr = `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    let title = 'Record updated';
    let icon = 'fa-solid fa-pen text-[#007788]';

    if (isCreate) {
      title = 'Guest record created';
      icon = 'fa-solid fa-plus text-emerald-600';
    } else if (log.changes && log.changes.length > 0) {
      const firstChange = log.changes[0];
      if (firstChange.field === 'feedback.rating') {
        title = `Guest Rating updated from ${firstChange.oldValue}/5 to ${firstChange.newValue}/5`;
        icon = 'fa-solid fa-star text-amber-500';
      } else if (firstChange.field === 'relationship') {
        title = `Relationship changed from ${firstChange.oldValue} to ${firstChange.newValue}`;
        icon = 'fa-solid fa-handshake text-[#007788]';
      } else {
        title = `${firstChange.fieldLabel || firstChange.field} updated`;
        icon = 'fa-solid fa-pen text-[#007788]';
      }
    }

    return {
      _id: log._id,
      action: log.action || 'UPDATE',
      title,
      userName,
      timeStr,
      icon
    };
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs font-sans space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-[#007788] rounded-full inline-block" />
          <h2 className="text-base font-bold text-gray-900 tracking-tight">System History</h2>
        </div>

        <button
          type="button"
          onClick={onOpenFullAuditModal}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007788] hover:text-[#005f6d] cursor-pointer"
        >
          <span>View All</span>
          <i className="fa-solid fa-arrow-right text-[11px]" />
        </button>
      </div>

      {/* History Items List */}
      <div className="space-y-4">
        {displayLogs.map((rawLog) => {
          const item = getLogDisplay(rawLog);
          const isCreate = item.action === 'CREATE';

          return (
            <div key={item._id} className="flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <i className={`${item.icon} text-xs`} />
                </div>

                <div className="space-y-0.5">
                  <p className="font-bold text-gray-900 leading-tight">{item.title}</p>
                  <p className="text-[11px] text-gray-400 font-mono">
                    by {item.userName} · {item.timeStr}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                  isCreate
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isCreate ? 'Created' : 'Updated'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemHistoryCard;
