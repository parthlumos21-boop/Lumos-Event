import React from 'react';
import { openSmartDirections } from '../../utils/mapRouting';

const CompactLocationCard = ({ className = '' }) => {
  return (
    <div
      className={`bg-[#0c1322]/92 backdrop-blur-md border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl text-white font-sans space-y-4 max-w-sm select-none ${className}`}
    >
      {/* Header Rating */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#007788]/20 border border-[#007788]/40 rounded-full text-[11px] font-bold text-[#82c8cf] tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Ahmedabad Headquarters
        </span>

        {/* Rating */}
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold font-mono">
          <i className="fa-solid fa-star text-amber-400 text-xs" />
          <span>4.9</span>
          <span className="text-gray-400 font-normal text-[11px]">(Verified)</span>
        </div>
      </div>

      {/* Company Name & Location */}
      <div className="space-y-0.5">
        <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug">
          Lumos Building Automation Pvt. Ltd.
        </h3>
        <p className="text-xs text-[#82c8cf] font-medium flex items-center gap-1.5">
          <i className="fa-solid fa-city text-[10px]" />
          <span>Ahmedabad, Gujarat, India</span>
        </p>
      </div>

      {/* Full Physical Address */}
      <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs text-gray-300 leading-relaxed flex items-start gap-2.5">
        <i className="fa-solid fa-location-dot text-[#82c8cf] text-sm shrink-0 mt-0.5" />
        <span className="text-[11px]">
          13th floor, Shaligram Arcade Ambali Junction, Ring Road, nr. Satyamev Elite, South Bopal, Ahmedabad, Gujarat 380058
        </span>
      </div>

      {/* Action Buttons: Get Directions & Contact Us (Strictly without Schedule Visit) */}
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
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
          title="Call Lumos"
        >
          <i className="fa-solid fa-phone text-xs text-[#82c8cf]" />
          <span>Contact Us</span>
        </a>
      </div>
    </div>
  );
};

export default CompactLocationCard;
