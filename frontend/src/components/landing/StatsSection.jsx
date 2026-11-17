import React from 'react';
import SectionCard from './ui/SectionCard';
import Heading from './ui/Heading';
import PhoneMockup from './mockups/PhoneMockup';
import { landingContent } from '../../data/landingContent';

export const StatsSection = () => {
  return (
    <SectionCard
      variant="white"
      className="p-6 sm:p-10 lg:p-14"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column (7 cols): Headings + 2x2 Outlined Stat Cards */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#31747d] bg-[#31747d]/10 px-3 py-1 rounded-full inline-block">
              Proven Architecture
            </span>
            <Heading level={2} size="section">
              {landingContent.stats.heading}
            </Heading>
            <p className="text-base text-[#6b7078] leading-relaxed font-sans max-w-xl">
              {landingContent.stats.subheading}
            </p>
          </div>

          {/* 2x2 Outlined Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {landingContent.stats.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-gray-200/90 bg-[#f8f9fa] hover:border-[#31747d]/40 hover:bg-white transition-all shadow-xs"
              >
                <div className="text-3xl sm:text-4xl font-semibold text-[#1b1d26] tracking-tight font-sans">
                  {metric.value}
                </div>
                <p className="text-xs sm:text-sm text-[#6b7078] font-medium mt-2 font-sans">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Tilted Phone Mockup showing Circular Dial */}
        <div className="lg:col-span-5 flex items-center justify-center pt-4 lg:pt-0">
          <div className="transition-transform duration-300 hover:rotate-0 rotate-1 lg:rotate-2">
            <PhoneMockup variant="dial" />
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default StatsSection;
