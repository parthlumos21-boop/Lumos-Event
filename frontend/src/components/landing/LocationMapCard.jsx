import React from 'react';
import Heading from './ui/Heading';
import LumosInteractiveMap from './LumosInteractiveMap';
import CompactLocationCard from './CompactLocationCard';

export const LocationMapCard = () => {
  return (
    <section id="location" className="w-full bg-white py-16 sm:py-24 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#31747d] bg-[#31747d]/10 px-3.5 py-1.5 rounded-full inline-block">
            Visit Our Spaces
          </span>
          <Heading level={2} size="section">
            Let's Meet at Lumos
          </Heading>
          <p className="text-sm sm:text-base text-[#6b7078] font-sans">
            Discover intelligent spaces. Experience innovation firsthand.
          </p>
        </div>

        {/* Map & Card Container */}
        <div className="relative w-full rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
          <LumosInteractiveMap>
            <div className="hidden md:block absolute top-6 left-6 z-20">
              <CompactLocationCard />
            </div>
          </LumosInteractiveMap>

          {/* Mobile View Card */}
          <div className="block md:hidden mt-4 p-2">
            <CompactLocationCard className="w-full max-w-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationMapCard;
