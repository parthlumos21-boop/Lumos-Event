import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, QrCode, FileText, ArrowDown } from 'lucide-react';
import Heading from './ui/Heading';
import LumosButton from './ui/LumosButton';
import FeatureChip from './ui/FeatureChip';
import PhoneMockup from './mockups/PhoneMockup';
import LandingNavbar from './LandingNavbar';
import useDisclosure from '../../hooks/useDisclosure';
import useClickOutside from '../../hooks/useClickOutside';
import { landingContent } from '../../data/landingContent';

export const HeroSection = ({ onOpenQRModal }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { isOpen: dropdownOpen, toggle: toggleDropdown, close: closeDropdown } = useDisclosure(false);

  // Close dropdown on outside click or Escape key
  useClickOutside(dropdownRef, closeDropdown, dropdownOpen);

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    closeDropdown();
  };

  return (
    <section
      id="home"
      className="w-full bg-white select-none relative pt-2 pb-16 sm:pb-24 overflow-x-hidden"
    >
      {/* Desktop Architectural Building Diagonal Overlay (Starts top-right, extends down diagonally behind phone's right side) */}
      <div className="hidden lg:block absolute right-[-20px] xl:right-0 top-4 xl:top-0 w-[54vw] xl:w-[50vw] max-w-[880px] pointer-events-none z-0 select-none">
        <img
          src="/modern_architectural_building.png"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/smart_home_hero.png';
          }}
          alt="Lumos Architectural Automation"
          className="w-full h-auto object-contain opacity-75 xl:opacity-80 [mask-image:linear-gradient(to_bottom,black_45%,rgba(0,0,0,0.5)_75%,transparent_100%)] drop-shadow-[0_20px_40px_rgba(47,118,127,0.06)]"
        />
      </div>

      {/* 1 & 2: Top Hero Content (Navbar & 2-Column Grid) in max-w-7xl */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 sm:space-y-12 relative z-10">
        {/* 1. In-Page Top Navbar */}
        <LandingNavbar onOpenQRModal={onOpenQRModal} />

        {/* 2. Top Hero Content: 2-Column Grid with Headline on Left and Mobile Image-2 fallback */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-4 sm:pt-8">
          {/* Left Column: Heading, Subhead, CTA Buttons */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <Heading level={1} size="hero" className="tracking-[-0.04em] text-[#1b1d26]">
              <span>{landingContent.hero.h1Line1}</span>
              <br />
              <span>{landingContent.hero.h1Line2}</span>
            </Heading>

            <p className="text-base sm:text-lg text-[#6b7078] font-normal leading-relaxed font-sans max-w-lg">
              {landingContent.hero.subheadline}
            </p>

            {/* Action Buttons: Primary Lumos Teal "Get Started" + White "Permanent QR Code" Dropdown */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <LumosButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/form')}
              >
                {landingContent.hero.getStartedText}
              </LumosButton>

              {/* Permanent QR Code Dropdown Button */}
              <div className="relative" ref={dropdownRef}>
                <LumosButton
                  variant="white"
                  size="lg"
                  onClick={toggleDropdown}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  className="gap-2"
                >
                  <span>{landingContent.hero.qrButtonText}</span>
                  <ChevronDown
                    size={16}
                    className={`text-[#6b7078] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </LumosButton>

                {/* Accessible Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-gray-200 shadow-[0_16px_36px_-8px_rgba(20,25,35,0.18)] p-2 z-40 animate-fadeIn select-none"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onOpenQRModal();
                        closeDropdown();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#1b1d26] hover:bg-[#2f767f]/10 hover:text-[#2f767f] transition-colors text-left cursor-pointer"
                    >
                      <QrCode size={15} />
                      <span>View & Print Desk Card</span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleScrollTo('qr-section')}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#1b1d26] hover:bg-[#2f767f]/10 hover:text-[#2f767f] transition-colors text-left cursor-pointer"
                    >
                      <ArrowDown size={15} />
                      <span>Go to QR Showcase Station</span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        navigate('/form');
                        closeDropdown();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#1b1d26] hover:bg-[#2f767f]/10 hover:text-[#2f767f] transition-colors text-left cursor-pointer"
                    >
                      <FileText size={15} />
                      <span>Event Form</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Clearance on Desktop (since absolute overlay spans diagonally) & Natural flow on Mobile/Tablet */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="lg:hidden relative max-w-[420px] w-full">
              <img
                src="/modern_architectural_building.png"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/smart_home_hero.png';
                }}
                alt="Lumos Architectural Automation"
                className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(47,118,127,0.12)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lower Zone: FULL BROWSER-WIDTH CONTAINER with Elevated "Easy Control" & Phone Mockup */}
      <div className="w-full relative pt-14 sm:pt-20 pb-28 sm:pb-36 md:pb-44 lg:pb-48 flex flex-col items-center justify-center overflow-hidden">
        {/* Full Browser-Width Giant "Easy Control" Typography (Elevated, 100% visible, zero bottom clipping) */}
        <div className="absolute bottom-6 sm:bottom-10 md:bottom-14 lg:bottom-16 left-0 right-0 w-full text-center pointer-events-none select-none z-0 whitespace-nowrap">
          <span className="text-[11.5vw] max-text-[220px] font-bold text-[#1b1d26] tracking-[-0.04em] leading-none inline-block">
            Easy Control
          </span>
        </div>

        {/* Mobile/Tablet Chip Wrap Row (<1024px) */}
        <div className="lg:hidden flex flex-wrap items-center justify-center gap-2.5 mb-8 z-10 w-full px-4">
          <FeatureChip icon="Thermometer" label={"Temperature\ncontrol"} />
          <FeatureChip icon="ShieldCheck" label={"Alarm\nsystem"} />
          <FeatureChip icon="Sun" label={"Smart\nspotlights"} />
          <FeatureChip icon="Flame" label={"Smoke\ndetector"} />
        </div>

        {/* Centered Phone Mockup with Desktop Floating Chips (Overlaps building's lower-left edge) */}
        <div className="relative z-10 flex items-center justify-center">
          {/* Top-Left: Temperature control */}
          <div className="hidden lg:block absolute top-[20%] -left-[180px] z-20">
            <FeatureChip icon="Thermometer" label={"Temperature\ncontrol"} />
          </div>

          {/* Bottom-Left: Smart spotlights */}
          <div className="hidden lg:block absolute bottom-[26%] -left-[220px] z-20">
            <FeatureChip icon="Sun" label={"Smart\nspotlights"} />
          </div>

          {/* Top-Right: Alarm system */}
          <div className="hidden lg:block absolute top-[20%] -right-[180px] z-20">
            <FeatureChip icon="ShieldCheck" label={"Alarm\nsystem"} />
          </div>

          {/* Bottom-Right: Access Control */}
          <div className="hidden lg:block absolute bottom-[26%] -right-[210px] z-20">
            <FeatureChip icon="Lock" label={"Access\nControl"} />
          </div>

          {/* Smartphone Mockup with Scroll-Triggered Boot Sequence */}
          <PhoneMockup variant="home" />
        </div>

        {/* Thin Teal Sine Wave Line crossing across Easy Control & Phone bottom */}
        <div className="absolute bottom-10 sm:bottom-14 md:bottom-20 left-0 right-0 w-full pointer-events-none z-20 overflow-hidden">
          <svg viewBox="0 0 1400 200" fill="none" className="w-full h-auto overflow-visible opacity-90">
            <path
              d="M -40,140 C 140,130 280,145 420,135 C 510,128 590,132 660,140 C 700,145 730,120 755,70 C 780,15 840,10 890,55 C 940,95 990,145 1100,138 C 1210,130 1310,115 1440,90"
              stroke="#2f767f"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
