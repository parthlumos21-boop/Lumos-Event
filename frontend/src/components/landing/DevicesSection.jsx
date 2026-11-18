import React from 'react';
import { ChevronLeft, ChevronRight, Sun, Thermometer, Lock, ShieldCheck } from 'lucide-react';
import Heading from './ui/Heading';
import ScrollReveal from './ui/ScrollReveal';
import useScrollRow from '../../hooks/useScrollRow';
import clsx from 'clsx';

export const DevicesSection = () => {
  const { scrollRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight } = useScrollRow(340);

  const deviceList = [
    {
      id: 'lighting',
      name: 'Smart lighting',
      desc: 'Scenes and schedules',
      icon: Sun
    },
    {
      id: 'climate',
      name: 'Climate control',
      desc: 'Comfort at any hour',
      icon: Thermometer
    },
    {
      id: 'lock',
      name: 'Smart door lock',
      desc: 'Keyless entry',
      icon: Lock
    },
    {
      id: 'security',
      name: 'Security & Surveillance',
      desc: 'Maintains privacy',
      icon: ShieldCheck
    }
  ];

  return (
    <section id="services" className="w-full bg-white py-16 sm:py-24 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Header with Title and Arrow Navigation Buttons */}
        <ScrollReveal direction="up" delay={0}>
          <div className="flex items-center justify-between gap-4">
            <Heading level={2} size="section" className="text-[#1b1d26]">
              Our Services
            </Heading>

            {/* Round Arrow Buttons matching Image-1 */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={clsx(
                  'w-12 h-12 rounded-full border border-gray-200 text-[#1b1d26] flex items-center justify-center transition-all cursor-pointer shadow-xs',
                  !canScrollLeft ? 'opacity-30 cursor-not-allowed bg-gray-50' : 'bg-white hover:bg-[#2f767f] hover:text-white hover:border-[#2f767f]'
                )}
                aria-label="Previous devices"
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
                aria-label="Next devices"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* 4 Device Cards Grid / Scroll Row with Staggered Scroll Reveal */}
        <div
          ref={scrollRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto pb-4 pt-2 scroll-smooth"
        >
          {deviceList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal
                key={item.id}
                direction="up"
                delay={idx * 100}
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
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DevicesSection;
