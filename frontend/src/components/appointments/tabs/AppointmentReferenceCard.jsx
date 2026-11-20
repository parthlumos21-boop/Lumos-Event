import React from 'react';
import { Tag, Building, UserCheck } from 'lucide-react';

export const AppointmentReferenceCard = ({ appointment }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
      <h3 className="text-base font-bold text-gray-900 font-sans flex items-center gap-2 border-b border-gray-100 pb-3">
        <Tag size={18} className="text-[#31747d]" />
        <span>Reference Details</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {/* Reference Category */}
        <div className="bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
          <span className="text-gray-400 font-medium block mb-1">Reference</span>
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-[#31747d]/10 text-[#31747d] border border-[#31747d]/20">
            {appointment?.reference || 'Direct Client'}
          </span>
        </div>

        {/* Reference Name (if not Direct Client) */}
        {appointment?.reference !== 'Direct Client' && (
          <div className="bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
            <span className="text-gray-400 font-medium block mb-1">Name</span>
            <span className="font-semibold text-gray-900 text-sm">
              {appointment?.referenceName || 'None specified'}
            </span>
          </div>
        )}

        {/* Internal Reference */}
        <div className="bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
          <span className="text-gray-400 font-medium block mb-1">Internal Reference</span>
          <span className="font-semibold text-gray-900 text-sm">
            {appointment?.internalReference || 'None specified'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentReferenceCard;
