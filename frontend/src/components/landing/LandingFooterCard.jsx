import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';
import LumosButton from './ui/LumosButton';
import { openSmartDirections } from '../../utils/mapRouting';
import { landingContent } from '../../data/landingContent';

export const LandingFooterCard = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-white border-t border-gray-100 py-16 px-4 sm:px-8 select-none font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-8 border-b border-gray-100">
          {/* Brand & Address */}
          <div className="space-y-4 max-w-md">
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src={landingContent.brand.logo}
                alt={landingContent.brand.name}
                className="h-10 object-contain transition-transform group-hover:scale-105"
              />
            </div>

            <div className="flex items-start gap-2.5 text-xs text-[#6b7078] leading-relaxed font-sans">
              <MapPin size={16} className="text-[#2f767f] shrink-0 mt-0.5" />
              <span>{landingContent.company.address}</span>
            </div>

            <div className="pt-1">
              <LumosButton
                variant="white"
                size="sm"
                onClick={openSmartDirections}
                className="gap-2 text-xs"
              >
                <span>Get Directions</span>
                <ArrowUpRight size={14} className="text-[#2f767f]" />
              </LumosButton>
            </div>
          </div>

          {/* Contact Links & Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs font-sans">
            <div className="space-y-2.5">
              <h4 className="font-semibold text-sm text-[#1b1d26] uppercase tracking-wider font-mono">
                Contact Us
              </h4>
              <div className="space-y-2 text-[#6b7078]">
                <a
                  href={`tel:${landingContent.company.phone}`}
                  className="flex items-center gap-2 hover:text-[#2f767f] transition-colors"
                >
                  <Phone size={13} className="text-[#2f767f]" />
                  <span>{landingContent.company.phone}</span>
                </a>
                <a
                  href={`mailto:${landingContent.company.email}`}
                  className="flex items-center gap-2 hover:text-[#2f767f] transition-colors"
                >
                  <Mail size={13} className="text-[#2f767f]" />
                  <span>{landingContent.company.email}</span>
                </a>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-semibold text-sm text-[#1b1d26] uppercase tracking-wider font-mono">
                Portals & Form
              </h4>
              <div className="flex flex-col space-y-2 text-[#6b7078]">
                <button
                  type="button"
                  onClick={() => navigate('/form')}
                  className="text-left hover:text-[#2f767f] transition-colors cursor-pointer"
                >
                  Visitor Registration Form
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-left hover:text-[#2f767f] transition-colors cursor-pointer"
                >
                  Staff Portal Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('qr-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-left hover:text-[#2f767f] transition-colors cursor-pointer"
                >
                  Permanent QR Station
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Line */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#6b7078] gap-3">
          <p>{landingContent.company.copyright}</p>
          <p className="font-mono text-[11px]">Ahmedabad • Gujarat • India</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooterCard;
