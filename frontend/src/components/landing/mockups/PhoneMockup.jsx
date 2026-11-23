import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import clsx from 'clsx';
import '../../Loader.css';

/**
 * Authentic Apple iPhone Mockup Device.
 * - Precision-engineered Apple iPhone Pro titanium chassis with physical side buttons and speaker grill.
 * - Screen image fills the entire mobile phone frame edge-to-edge with zero clipping.
 * - Dynamic Island notch floats naturally at top center with clearance for top header text and actions.
 * - 100% visibility of all top elements and bottom navigation icons with zero cropping.
 * - Scroll-triggered 1.3s power-on boot sequence with Lumos brand logo.
 */
export const PhoneMockup = ({ variant = 'home', className = '' }) => {
  const [temp, setTemp] = useState(22);
  const phoneRef = useRef(null);
  const [bootState, setBootState] = useState('idle'); // 'idle' | 'booting' | 'ready'

  useEffect(() => {
    if (variant !== 'home') return;

    // Trigger power-on boot sequence when scrolled into view
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && bootState === 'idle') {
          setBootState('booting');
          setTimeout(() => {
            setBootState('ready');
          }, 1300);
        }
      },
      { threshold: 0.25 }
    );

    const currentEl = phoneRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) observer.unobserve(currentEl);
      observer.disconnect();
    };
  }, [variant, bootState]);

  if (variant === 'dial') {
    return (
      <div
        className={clsx(
          'relative select-none flex flex-col font-sans',
          'w-[280px] xs:w-[310px] sm:w-[340px] md:w-[365px] lg:w-[375px]',
          'h-[545px] xs:h-[600px] sm:h-[660px] md:h-[710px] lg:h-[730px]',
          'rounded-[48px] sm:rounded-[54px] bg-[#161820]',
          'p-2 sm:p-2.5',
          'border-[3.5px] border-[#2e323e]',
          'ring-1 ring-white/10 ring-offset-2 ring-offset-[#0b0c11]',
          'shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6),0_10px_30px_rgba(47,118,127,0.12)]',
          className
        )}
      >
        {/* Apple Hardware Buttons */}
        <div className="absolute -left-[5px] top-[100px] sm:top-[120px] w-[3.5px] h-6 sm:h-7 bg-[#2e323e] rounded-l-xs shadow-xs" />
        <div className="absolute -left-[5px] top-[140px] sm:top-[165px] w-[3.5px] h-11 sm:h-13 bg-[#2e323e] rounded-l-xs shadow-xs" />
        <div className="absolute -left-[5px] top-[205px] sm:top-[235px] w-[3.5px] h-11 sm:h-13 bg-[#2e323e] rounded-l-xs shadow-xs" />
        <div className="absolute -right-[5px] top-[150px] sm:top-[175px] w-[3.5px] h-14 sm:h-18 bg-[#2e323e] rounded-r-xs shadow-xs" />

        {/* Inner Screen */}
        <div className="relative w-full h-full rounded-[40px] sm:rounded-[44px] overflow-hidden bg-[#0c0e14] flex flex-col justify-between text-white p-4">
          {/* Top Dynamic Island Notch */}
          <div className="w-full shrink-0 pt-1.5 pb-1 flex items-center justify-center">
            <div className="w-[66px] sm:w-[78px] h-[18px] sm:h-[21px] bg-black rounded-full ring-1 ring-white/10" />
          </div>

          {/* Header */}
          <div className="px-5 pt-2 text-center">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-mono">Living Suite</p>
            <h4 className="text-base font-medium text-white">Climate Zone 01</h4>
          </div>

          {/* Circular Dial SVG */}
          <div className="relative flex flex-col items-center justify-center my-auto">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="#242838"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="#2f767f"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="301.59"
                strokeDashoffset="95"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-semibold tracking-tight text-white">{temp}°C</span>
              <span className="text-[11px] text-[#4ecdc4] font-medium mt-1">Cooling Active</span>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="px-6 pb-2">
            <div className="flex items-center justify-between bg-[#1f2333] rounded-2xl p-2 border border-white/5">
              <button
                type="button"
                onClick={() => setTemp((t) => Math.max(16, t - 1))}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Decrease temperature"
              >
                <Minus size={16} />
              </button>
              <span className="text-xs font-mono text-gray-300">Set: {temp}.0°C</span>
              <button
                type="button"
                onClick={() => setTemp((t) => Math.min(30, t + 1))}
                className="w-10 h-10 rounded-xl bg-[#2f767f] hover:bg-[#255f67] text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Increase temperature"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default "home" variant: Authentic Apple iPhone Pro Mockup with Edge-to-Edge Screen Filling
  return (
    <div
      ref={phoneRef}
      className={clsx(
        'relative select-none flex flex-col font-sans transition-all duration-300',
        // Responsive dimensions matching authentic 19.5:9 mobile display aspect ratio
        'w-[280px] xs:w-[310px] sm:w-[340px] md:w-[365px] lg:w-[375px]',
        'h-[545px] xs:h-[600px] sm:h-[660px] md:h-[710px] lg:h-[730px]',
        // Authentic Apple Titanium Chassis with polished chamfered edge and subtle metallic highlights
        'rounded-[48px] sm:rounded-[54px] bg-[#161820]',
        'p-2 sm:p-2.5',
        'border-[3.5px] border-[#2e323e]',
        'ring-1 ring-white/10 ring-offset-2 ring-offset-[#0b0c11]',
        'shadow-[0_25px_70px_-15px_rgba(0,0,0,0.65),0_10px_35px_rgba(47,118,127,0.15)]',
        className
      )}
    >
      {/* Apple Hardware Side Buttons */}
      {/* Action Button (Left Top) */}
      <div className="absolute -left-[5px] top-[100px] sm:top-[120px] w-[3.5px] h-6 sm:h-7 bg-[#2e323e] rounded-l-xs shadow-xs" />
      {/* Volume Up (Left Middle) */}
      <div className="absolute -left-[5px] top-[140px] sm:top-[165px] w-[3.5px] h-11 sm:h-13 bg-[#2e323e] rounded-l-xs shadow-xs" />
      {/* Volume Down (Left Lower) */}
      <div className="absolute -left-[5px] top-[205px] sm:top-[235px] w-[3.5px] h-11 sm:h-13 bg-[#2e323e] rounded-l-xs shadow-xs" />
      {/* Side / Power Button (Right) */}
      <div className="absolute -right-[5px] top-[150px] sm:top-[175px] w-[3.5px] h-14 sm:h-18 bg-[#2e323e] rounded-r-xs shadow-xs" />

      {/* Top Speaker Ear-Grill Cutout */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 sm:w-16 h-1 bg-[#14151b] rounded-full z-30 pointer-events-none" />

      {/* Inner Screen Container: Fills Entire Mobile Screen with High Screen-to-Body Ratio */}
      <div className="relative w-full h-full rounded-[40px] sm:rounded-[44px] overflow-hidden bg-black flex items-center justify-center">
        {/* Dynamic Island Notch Overlay (Proportions matching reference phone mockup) */}
        <div className="absolute top-2 sm:top-2.5 left-1/2 -translate-x-1/2 w-[66px] sm:w-[78px] md:w-[84px] h-[18px] sm:h-[21px] md:h-[23px] bg-black rounded-full z-30 flex items-center justify-end px-2 shadow-sm pointer-events-none ring-1 ring-white/10">
          <div className="w-2 h-2 rounded-full bg-[#0d1629] ring-1 ring-[#1b2640]/70 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#2563eb]/90" />
          </div>
        </div>

        {/* Phase 0: Standby Screen before scrolling into view */}
        {bootState === 'idle' && (
          <div className="absolute inset-0 bg-[#08090d] flex flex-col items-center justify-center z-20" />
        )}

        {/* Phase 1: Power-on Boot Screen (1.3s) with Authentic LUMOS text animation */}
        {bootState === 'booting' && (
          <div className="absolute inset-0 bg-[#08090d] flex flex-col items-center justify-center space-y-4 z-20 transition-opacity duration-500 animate-fadeIn">
            <div className="loading-text select-none text-center">
              <span className="loading-text-words text-2xl sm:text-3xl">L</span>
              <span className="loading-text-words text-2xl sm:text-3xl">U</span>
              <span className="loading-text-words text-2xl sm:text-3xl">M</span>
              <span className="loading-text-words text-2xl sm:text-3xl">O</span>
              <span className="loading-text-words text-2xl sm:text-3xl">S</span>
            </div>
          </div>
        )}

        {/* Phase 2: Live App Screen (Fills Entire Mobile Phone Frame Edge-to-Edge with Zero Top/Bottom Clipping) */}
        {bootState === 'ready' && (
          <div className="w-full h-full relative overflow-hidden animate-fadeIn">
            <img
              src="/lumos_app_preview.png"
              alt="Lumos App Preview"
              className="w-full h-full object-fill select-none pointer-events-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneMockup;
