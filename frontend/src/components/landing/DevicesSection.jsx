import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Sun,
  Thermometer,
  ShieldCheck,
  Lock,
  Camera,
  Volume2,
  Film,
  Sliders
} from 'lucide-react';
import Heading from './ui/Heading';
import ScrollReveal from './ui/ScrollReveal';
import useScrollRow from '../../hooks/useScrollRow';
import clsx from 'clsx';

export const DevicesSection = () => {
  const {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
    isDragging,
    dragProps
  } = useScrollRow(340, {
    autoPlay: true,
    autoPlayInterval: 2800, // Automatically scrolls left-to-right & right-to-left every 2-3s
    pauseOnHover: true
  });

  const deviceList = [
    {
      id: 'home-automation',
      name: 'Home Automation',
      desc: 'Integrated smart living and centralized ecosystem orchestration',
      icon: Home
    },
    {
      id: 'lighting',
      name: 'Smart Lighting Control',
      desc: 'Circadian dimming, scene presets and scheduled illumination',
      icon: Sun
    },
    {
      id: 'hvac',
      name: 'HVAC control',
      desc: 'Multi-zone intelligent temperature and air quality management',
      icon: Thermometer
    },
    {
      id: 'security',
      name: 'Security & Surveillance',
      desc: 'Perimeter monitoring, intrusion alerts and access protection',
      icon: ShieldCheck
    },
    {
      id: 'locks',
      name: 'Door locks',
      desc: 'Biometric smart deadbolts and encrypted keyless entry',
      icon: Lock
    },
    {
      id: 'cctv',
      name: 'CCTV',
      desc: 'Ultra-HD optical surveillance with 24/7 continuous coverage',
      icon: Camera
    },
    {
      id: 'audio-visuals',
      name: 'Audio & Visuals',
      desc: 'Architectural multi-room audio and high-fidelity video distribution',
      icon: Volume2
    },
    {
      id: 'home-theater',
      name: 'Home Theater',
      desc: 'Immersive cinematic acoustics, projection and lighting presets',
      icon: Film
    },
    {
      id: 'multipurpose-room',
      name: 'Multipurpose Room',
      desc: 'Adaptive motorized room modes, acoustic zoning and scene switching',
      icon: Sliders
    }
  ];

  return (
    <section id="solutions" className="w-full bg-white py-16 sm:py-24 select-none scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Header with Title and Arrow Navigation Buttons */}
        <ScrollReveal direction="up" delay={0}>
          <div className="flex items-center justify-between gap-4">
            <Heading level={2} size="section" className="text-[#1b1d26]">
              Our Solutions
            </Heading>

            {/* Round Arrow Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={clsx(
                  'w-12 h-12 rounded-full border border-gray-200 text-[#1b1d26] flex items-center justify-center transition-all cursor-pointer shadow-xs',
                  !canScrollLeft ? 'opacity-30 cursor-not-allowed bg-gray-50' : 'bg-white hover:bg-[#2f767f] hover:text-white hover:border-[#2f767f]'
                )}
                aria-label="Previous solutions"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={clsx(
                  'w-12 h-12 rounded-full bg-[#2f767f] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs hover:bg-[#255f67]',
                  !canScrollRight && 'opacity-60'
                )}
                aria-label="Next solutions"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* 9 Service Cards Horizontal Scroll & Swipe Row */}
        <div
          ref={scrollRef}
          {...dragProps}
          className={clsx(
            'flex gap-5 overflow-x-auto pb-4 pt-2 scroll-smooth snap-x snap-mandatory touch-pan-x select-none',
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          )}
        >
          {deviceList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="w-[280px] sm:w-[320px] shrink-0 snap-start"
              >
                <ScrollReveal
                  direction="up"
                  delay={Math.min(idx * 70, 400)}
                  className="h-full"
                >
                  <div
                    className="p-7 rounded-3xl bg-[#fafafa] border border-gray-100 hover:border-[#2f767f]/40 hover:bg-white hover:shadow-lg transition-all flex flex-col justify-between min-h-[220px] h-full"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#2f767f]/10 text-[#2f767f] flex items-center justify-center mb-6">
                        <Icon size={24} strokeWidth={2.2} />
                      </div>
                      <h3 className="text-lg font-semibold text-[#1b1d26] font-sans tracking-tight mb-1.5">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#6b7078] leading-relaxed font-sans">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DevicesSection;
