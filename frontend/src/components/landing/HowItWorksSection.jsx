import React, { useState } from 'react';
import { Play } from 'lucide-react';
import SectionCard from './ui/SectionCard';
import Heading from './ui/Heading';
import { landingContent } from '../../data/landingContent';
import showroomPhoto from '../../assets/lumos_theater.jpg';

export const HowItWorksSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <SectionCard
      id="about"
      variant="light"
      className="p-6 sm:p-10 lg:p-14 space-y-10 sm:space-y-14"
    >
      {/* Header with Title, Description & Curved Arrow */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="space-y-3 max-w-xl">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#31747d] bg-[#31747d]/10 px-3 py-1 rounded-full inline-block">
            Architectural Workflow
          </span>
          <Heading level={2} size="section">
            {landingContent.howItWorks.heading}
          </Heading>
          <p className="text-base sm:text-lg text-[#6b7078] font-normal leading-relaxed font-sans">
            {landingContent.howItWorks.description}
          </p>
        </div>

        {/* Thin Lumos Teal Curved Arrow SVG */}
        <div className="hidden md:block w-32 h-16 self-center pointer-events-none opacity-80">
          <svg viewBox="0 0 140 70" fill="none" className="w-full h-full">
            <path
              d="M 10,20 C 50,70 90,60 125,25"
              stroke="#31747d"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="5 5"
            />
            <path
              d="M 115,18 L 128,24 L 122,38"
              stroke="#31747d"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Large Round Media Card with Play Button */}
      <div className="relative w-full h-[280px] sm:h-[380px] lg:h-[460px] rounded-3xl overflow-hidden shadow-sm group">
        <img
          src={showroomPhoto}
          alt="Lumos Architectural Experience"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Soft dark overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

        {/* Centered Lumos Teal Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#31747d] hover:bg-[#255b62] text-white flex items-center justify-center shadow-[0_12px_32px_rgba(49,116,125,0.6)] transition-all hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Play experience showcase"
          >
            <Play size={32} className="ml-1 text-white fill-white" />
          </button>
        </div>
      </div>

      {/* Numbered 3-Step Row (Survey, Install, Control) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200/80">
        {landingContent.howItWorks.steps.map((step) => (
          <div
            key={step.step}
            className="p-6 rounded-3xl bg-white/70 border border-white/80 space-y-3 shadow-xs hover:shadow-md transition-shadow"
          >
            <span className="text-sm font-mono font-bold text-[#31747d] tracking-wider block">
              {step.step}
            </span>
            <h3 className="text-xl font-medium text-[#1b1d26] tracking-tight font-sans">
              {step.title}
            </h3>
            <p className="text-sm text-[#6b7078] leading-relaxed font-sans">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

export default HowItWorksSection;
