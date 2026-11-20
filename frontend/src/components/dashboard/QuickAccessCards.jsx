import React from 'react';
import { Users, FileText, Calendar } from 'lucide-react';

const QuickAccessCards = ({ onNavigateGuests, onNavigateForm, onNavigateAppointment }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 font-sans">
      {/* Card 1 – Event Form */}
      <div
        onClick={onNavigateForm}
        className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
      >
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shrink-0">
          <FileText size={26} />
        </div>
        <h3 className="text-sm md:text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
          Event Form
        </h3>
      </div>

      {/* Card 2 – Guest Directory */}
      <div
        onClick={onNavigateGuests}
        className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xs hover:border-[#31747d]/40 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
      >
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#31747d]/10 text-[#31747d] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shrink-0">
          <Users size={26} />
        </div>
        <h3 className="text-sm md:text-base font-bold text-gray-900 group-hover:text-[#31747d] transition-colors truncate">
          Guest Directory
        </h3>
      </div>

      {/* Card 3 – New Appointments (Right side of Event Form row) */}
      <div
        onClick={onNavigateAppointment}
        className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xs hover:border-[#2f767f]/40 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
      >
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#2f767f]/10 text-[#2f767f] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shrink-0">
          <Calendar size={26} />
        </div>
        <h3 className="text-sm md:text-base font-bold text-gray-900 group-hover:text-[#2f767f] transition-colors truncate">
          New Appointments
        </h3>
      </div>
    </div>
  );
};

export default QuickAccessCards;
