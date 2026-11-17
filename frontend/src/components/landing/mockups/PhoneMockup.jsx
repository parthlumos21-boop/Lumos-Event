import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Battery, Plus, Minus } from 'lucide-react';
import clsx from 'clsx';

/**
 * Pure CSS/SVG Smartphone Mockup.
 * Features a scroll-triggered 1.3s power-on boot sequence with Lumos brand logo
 * that starts when the phone appears into view upon scrolling.
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
          'w-[270px] sm:w-[300px] h-[540px] sm:h-[590px] rounded-[44px] bg-[#14161f] p-3 shadow-[0_25px_60px_-15px_rgba(20,25,35,0.35)] border-4 border-[#2c303f] select-none flex flex-col justify-between font-sans text-white relative',
          className
        )}
      >
        {/* Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20" />

        {/* Status Bar */}
        <div className="pt-2 px-5 flex items-center justify-between text-[11px] text-gray-400 font-medium">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Wifi size={12} />
            <Battery size={13} />
          </div>
        </div>

        {/* Header */}
        <div className="px-5 pt-3 text-center">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-mono">Living Suite</p>
          <h4 className="text-base font-medium text-white">Climate Zone 01</h4>
        </div>

        {/* Circular Dial SVG */}
        <div className="relative flex flex-col items-center justify-center my-auto">
          <svg className="w-48 h-48 -rotate-90" viewBox="0 0 120 120">
            {/* Background ring */}
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="#242838"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Active Lumos Teal Ring */}
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

          {/* Temperature text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-semibold tracking-tight text-white">{temp}°C</span>
            <span className="text-[11px] text-[#4ecdc4] font-medium mt-1">Cooling Active</span>
          </div>
        </div>

        {/* Stepper Controls */}
        <div className="px-6 pb-6">
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
    );
  }

  // Default "home" variant: Features scroll-triggered power-on boot sequence then displays centered live Lumos app screenshot
  return (
    <div
      ref={phoneRef}
      className={clsx(
        'w-[280px] sm:w-[310px] h-[580px] sm:h-[630px] rounded-[48px] bg-[#14161f] p-2.5 sm:p-3 shadow-[0_30px_80px_-15px_rgba(20,25,35,0.45)] border-4 border-[#2c303f] select-none flex flex-col font-sans relative overflow-hidden',
        className
      )}
    >
      {/* Top Speaker / Dynamic Island Notch */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-30 flex items-center justify-end px-2 pointer-events-none shadow-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-900/40" />
      </div>

      {/* Screen Container */}
      <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-black flex items-center justify-center">
        {/* Phase 0: Standby screen before scrolling into view */}
        {bootState === 'idle' && (
          <div className="absolute inset-0 bg-[#0a0d14] flex flex-col items-center justify-center" />
        )}

        {/* Phase 1: Power-on Boot Screen (1.3s) triggered when scrolled into view */}
        {bootState === 'booting' && (
          <div className="absolute inset-0 bg-[#0a0d14] flex flex-col items-center justify-center space-y-4 z-20 transition-opacity duration-500 animate-fadeIn">
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 animate-pulse shadow-xl">
              <img
                src="/lumos logo-title.png"
                alt="Lumos Powering On"
                className="h-10 sm:h-12 object-contain"
              />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ecdc4] animate-ping" />
              <span>Starting System...</span>
            </div>
          </div>
        )}

        {/* Phase 2: Live App Screen (Perfect Center Alignment) */}
        {bootState === 'ready' && (
          <div className="w-full h-full flex items-center justify-center bg-black animate-fadeIn">
            <img
              src="/lumos_app_preview.png"
              alt="Lumos App Preview"
              className="w-full h-full object-cover object-center select-none pointer-events-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneMockup;
