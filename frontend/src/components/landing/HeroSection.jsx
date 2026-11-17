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
      className="w-full bg-white select-none relative pt-2 pb-16 sm:pb-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 sm:space-y-12">
        {/* 1. In-Page Top Navbar */}
        <LandingNavbar onOpenQRModal={onOpenQRModal} />

        {/* 2. Top Hero Content: 2-Column Grid with Headline on Left and Image-2 on Right */}
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
                      <span>Open Registration Form Directly</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Image-2 Smart Home Ecosystem Illustration with Transparent PNG & JPG Fallback */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative max-w-[400px] sm:max-w-[440px] w-full">
              <img
                src="/smart_home_hero.png"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/smart_home_hero.jpg';
                }}
                alt="Lumos Smart Home Ecosystem"
                className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(47,118,127,0.14)] transition-transform duration-500 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>

        {/* 3. Lower Zone: Centered Phone with Image-2, Wave, Chips & Symmetrically Balanced "Easy control" */}
        <div className="relative w-full pt-16 sm:pt-24 pb-20 sm:pb-32 flex flex-col items-center justify-center overflow-hidden">
          {/* Giant "Easy Control" Typography matching exact reference image */}
          <div className="absolute -bottom-4 sm:-bottom-8 md:-bottom-10 left-1/2 -translate-x-1/2 select-none pointer-events-none whitespace-nowrap z-0 w-full text-center">
            <span className="text-[105px] sm:text-[160px] md:text-[205px] lg:text-[245px] xl:text-[280px] font-bold text-[#1b1d26] tracking-[-0.04em] leading-none inline-block">
              Easy Control
            </span>
          </div>

          {/* Mobile/Tablet Chip Wrap Row (<1024px) */}
          <div className="lg:hidden flex flex-wrap items-center justify-center gap-2.5 mb-8 z-10 w-full px-2">
            <FeatureChip icon="Thermometer" label={"Climate\ncontrol"} />
            <FeatureChip icon="ShieldCheck" label={"Security\nsystem"} />
            <FeatureChip icon="Sun" label={"Smart\nlighting"} />
            <FeatureChip icon="Flame" label={"Smoke\ndetector"} />
          </div>

          {/* Centered Phone Mockup with Desktop Floating Chips */}
          <div className="relative z-10 flex items-center justify-center">
            {/* Top-Left: Climate control */}
            <div className="hidden lg:block absolute top-[20%] -left-[180px] z-20">
              <FeatureChip icon="Thermometer" label={"Climate\ncontrol"} />
            </div>

            {/* Bottom-Left: Smart lighting */}
            <div className="hidden lg:block absolute bottom-[26%] -left-[220px] z-20">
              <FeatureChip icon="Sun" label={"Smart\nlighting"} />
            </div>

            {/* Top-Right: Security system */}
            <div className="hidden lg:block absolute top-[20%] -right-[180px] z-20">
              <FeatureChip icon="ShieldCheck" label={"Security\nsystem"} />
            </div>

            {/* Bottom-Right: Smoke detector */}
            <div className="hidden lg:block absolute bottom-[26%] -right-[210px] z-20">
              <FeatureChip icon="Flame" label={"Smoke\ndetector"} />
            </div>

            {/* Thin Lumos Teal Sine Wave Line crossing across the section & phone */}
            <div className="absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2 w-[700px] sm:w-[950px] lg:w-[1200px] pointer-events-none z-20">
              <svg viewBox="0 0 1200 240" fill="none" className="w-full overflow-visible opacity-90">
                <path
                  d="M -60,140 C 200,160 320,30 520,120 C 660,180 740,20 860,110 C 980,200 1100,100 1260,130"
                  stroke="#2f767f"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Smartphone Mockup displaying exact Image-2 screenshot */}
            <PhoneMockup variant="home" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
