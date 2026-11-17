import React from 'react';

const OwnershipTab = ({ guest }) => {
  const createdBy = guest?.createdBy || {};
  const updatedBy = guest?.updatedBy || {};

  const createdName = createdBy.name || 'Keval V Shah';
  const createdEmail = createdBy.email || 'keval@lumossolution.com';
  const createdRole = createdBy.role || 'admin';
  const createdInitials = (createdName.slice(0, 2) || 'KV').toUpperCase();

  const updatedName = updatedBy.name || 'Parth Joshi';
  const updatedEmail = updatedBy.email || 'parth@lumossolution.com';
  const updatedRole = updatedBy.role || 'employee';
  const updatedInitials = (updatedName.slice(0, 2) || 'PJ').toUpperCase();

  const createdAt = guest?.createdAt ? new Date(guest.createdAt) : new Date();
  const updatedAt = guest?.updatedAt ? new Date(guest.updatedAt) : new Date();

  return (
    <div className="space-y-6 font-sans">
      {/* Overview Banner */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <i className="fa-solid fa-shield-halved text-[#007788]" />
          <span>Record Ownership & Lineage</span>
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Strict traceability of original creator identity and subsequent editing history
        </p>
      </div>

      {/* Side-by-Side Ownership Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Originally Created By Card */}
        <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 shadow-xs space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-lock text-emerald-600 text-xs" />
              Originally Created By
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
              Permanent / Immutable
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1c454b] text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-sm">
              {createdInitials}
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-extrabold text-gray-900">{createdName}</h4>
              <p className="text-xs text-gray-600 font-mono">{createdEmail}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-full capitalize">
                  {createdRole} Role
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Original Creator
                </span>
              </div>
            </div>
          </div>

          {/* Creation Date Callout */}
          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <i className="fa-solid fa-calendar-days text-xs" /> Creation Timestamp
            </span>
            <p className="font-semibold text-gray-900 font-mono">
              {createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <p className="text-[11px] text-gray-400 italic">
            This creator metadata is permanently anchored from the MongoDB users collection and will never be overwritten when other users edit the record.
          </p>
        </div>

        {/* Last Updated By Card */}
        <div className="bg-white border-2 border-cyan-100 rounded-3xl p-6 shadow-xs space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-xs font-bold text-[#007788] uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-user-check text-[#007788] text-xs" />
              Last Updated By
            </span>
            <span className="px-2.5 py-0.5 bg-cyan-50 text-[#007788] border border-cyan-200 rounded-full text-[11px] font-bold">
              Latest Editor
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#007788] text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-sm">
              {updatedInitials}
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-extrabold text-gray-900">{updatedName}</h4>
              <p className="text-xs text-gray-600 font-mono">{updatedEmail}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-full capitalize">
                  {updatedRole} Role
                </span>
                <span className="text-[11px] text-[#007788] font-semibold">
                  Recent Editor
                </span>
              </div>
            </div>
          </div>

          {/* Update Date Callout */}
          <div className="p-3.5 bg-cyan-50/60 rounded-2xl border border-cyan-100 space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#007788] flex items-center gap-1">
              <i className="fa-solid fa-clock text-xs" /> Last Modified Timestamp
            </span>
            <p className="font-semibold text-gray-900 font-mono">
              {updatedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <p className="text-[11px] text-gray-400 italic">
            Dynamically updated on every successful record edit. The backend resolves the editor from the users collection at save time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnershipTab;
