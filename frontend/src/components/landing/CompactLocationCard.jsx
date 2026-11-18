import React from 'react';
import { openSmartDirections } from '../../utils/mapRouting';

const CompactLocationCard = ({ className = '' }) => {
  return (
    <div
      className={`bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-xl text-gray-900 font-sans space-y-4 max-w-sm select-none ${className}`}
    >
      {/* Header Rating */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2f767f]/10 border border-[#2f767f]/30 rounded-full text-[11px] font-bold text-[#2f767f] tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Ahmedabad Headquarters
        </span>

        {/* Rating */}
        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold font-mono">
          <i className="fa-solid fa-star text-amber-400 text-xs" />
          <span>4.9</span>
          <span className="text-gray-400 font-normal text-[11px]">(Verified)</span>
        </div>
      </div>

      {/* Company Name & Location */}
      <div className="space-y-0.5">
        <h3 className="text-base sm:text-lg font-extrabold text-[#1b1d26] tracking-tight leading-snug">
          Lumos Building Automation Pvt. Ltd.
        </h3>
        <p className="text-xs text-[#2f767f] font-semibold flex items-center gap-1.5">
          <i className="fa-solid fa-city text-[10px]" />
          <span>Ahmedabad, Gujarat, India</span>
        </p>
      </div>

      {/* Full Physical Address */}
      <div className="p-3 bg-gray-50/90 rounded-2xl border border-gray-200/70 text-xs text-gray-600 leading-relaxed flex items-start gap-2.5">
        <i className="fa-solid fa-location-dot text-[#2f767f] text-sm shrink-0 mt-0.5" />
        <span className="text-[11px] text-gray-700">
          13th floor, Shaligram Arcade Ambali Junction, Ring Road, nr. Satyamev Elite, South Bopal, Ahmedabad, Gujarat 380058
        </span>
      </div>

      {/* Action Buttons: Get Directions & Contact Us */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={openSmartDirections}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#2f767f] hover:bg-[#255f67] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          title="Open directions in Apple Maps or Google Maps"
        >
          <i className="fa-solid fa-diamond-turn-right text-xs" />
          <span>Get Directions</span>
        </button>

        <a
          href="tel:+9189798878578"
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white hover:bg-[#2f767f]/10 text-[#2f767f] border border-[#2f767f]/30 hover:border-[#2f767f] rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
          title="Call Lumos"
        >
          <i className="fa-solid fa-phone text-xs text-[#2f767f]" />
          <span>Contact Us</span>
        </a>
      </div>
    </div>
  );
};

export default CompactLocationCard;
