import React from 'react';

const RecordInformationCard = ({ guest }) => {
  const createdBy = guest?.createdBy || {};
  const updatedBy = guest?.updatedBy || {};

  const createdName = createdBy.name || 'Staff User';
  const createdInitials = (createdName.slice(0, 2) || 'ST').toUpperCase();

  const updatedName = updatedBy.name || createdBy.name || 'Staff User';
  const updatedInitials = (updatedName.slice(0, 2) || 'ST').toUpperCase();

  const createdAt = guest?.createdAt ? new Date(guest.createdAt) : new Date();
  const updatedAt = guest?.updatedAt ? new Date(guest.updatedAt) : new Date();

  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs font-sans">
      {/* Title */}
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-5">
        <div className="w-6 h-6 rounded-full bg-cyan-50 flex items-center justify-center text-[#007788]">
          <i className="fa-solid fa-circle-info text-xs" />
        </div>
        <h3 className="text-base font-bold text-gray-900 tracking-tight">Record Information</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-xs">
        {/* Created By */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1c454b] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
            {createdInitials}
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Created By</span>
            <span className="font-bold text-gray-900 text-sm block">{createdName}</span>
          </div>
        </div>

        {/* Last Updated By */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#82c8cf] text-gray-800 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
            {updatedInitials}
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Last Updated By</span>
            <span className="font-bold text-gray-900 text-sm block">{updatedName}</span>
          </div>
        </div>

        {/* Created On */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center shrink-0 border border-gray-100">
            <i className="fa-solid fa-calendar-days text-sm text-[#007788]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Created On</span>
            <span className="font-bold text-gray-900 text-xs block font-mono">
              {createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center shrink-0 border border-gray-100">
            <i className="fa-solid fa-calendar-days text-sm text-[#007788]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Last Updated</span>
            <span className="font-bold text-gray-900 text-xs block font-mono">
              {updatedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordInformationCard;
