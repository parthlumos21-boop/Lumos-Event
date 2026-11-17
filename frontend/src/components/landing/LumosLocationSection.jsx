import React from 'react';
import { motion } from 'framer-motion';
import LumosInteractiveMap from './LumosInteractiveMap';
import CompactLocationCard from './CompactLocationCard';

const LumosLocationSection = () => {
  return (
    <section id="location-section" className="relative w-full py-20 px-4 sm:px-8 lg:px-12 font-sans select-none z-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3.5 max-w-2xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Let's Meet at Lumos.
          </h2>

          <p className="text-gray-300 font-light text-base sm:text-lg leading-relaxed">
            Discover intelligent spaces. Experience innovation firsthand.
          </p>
        </motion.div>

        {/* Map & Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative w-full"
        >
          {/* Interactive Map with Desktop Floating Card */}
          <LumosInteractiveMap>
            <div className="hidden md:block absolute top-6 left-6 z-20">
              <CompactLocationCard />
            </div>
          </LumosInteractiveMap>

          {/* Mobile Location Card (Stacked cleanly below the map on smaller viewports) */}
          <div className="block md:hidden mt-6">
            <CompactLocationCard className="w-full max-w-full" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LumosLocationSection;
