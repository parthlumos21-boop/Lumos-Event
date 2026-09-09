import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import Spatial3DCanvas from './Spatial3DCanvas';

const ScrollArea = ({ children, className = '' }) => {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const smoothProgress = useSpring(scrollProgress, {
    stiffness: 120,
    damping: 20,
    restDelta: 0.001
  });

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const totalScroll = scrollHeight - clientHeight;
    
    if (totalScroll > 0) {
      const progress = scrollTop / totalScroll;
      setScrollProgress(progress);
      
      if (progress < 0.33) setActiveSection(0);
      else if (progress < 0.66) setActiveSection(1);
      else setActiveSection(2);
    }
    setIsScrolling(true);
  };

  useEffect(() => {
    let timeout;
    if (isScrolling) {
      timeout = setTimeout(() => {
        setIsScrolling(false);
      }, 1200);
    }
    return () => clearTimeout(timeout);
  }, [isScrolling, scrollProgress]);

  const scrollToSection = (index) => {
    if (!containerRef.current) return;
    const { scrollHeight, clientHeight } = containerRef.current;
    const targetScroll = (index / 2) * (scrollHeight - clientHeight);
    containerRef.current.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  const percentText = Math.round(scrollProgress * 100);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans text-white">
      
      {/* 3D Spatial Canvas Background Layer */}
      <Spatial3DCanvas smoothProgress={smoothProgress} />

      {/* Foreground Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`relative z-10 w-full h-full overflow-y-auto scroll-smooth ${className}`}
      >
        {children}
      </div>

      {/* Skiper UI Interactive Scrollbar Widget (Dark Theme) */}
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex items-center gap-3 pointer-events-auto select-none"
      >
        {/* Live Percentage Badge */}
        <motion.div
          animate={{
            opacity: isHovered || isScrolling ? 1 : 0,
            x: isHovered || isScrolling ? 0 : 10,
          }}
          transition={{ duration: 0.2 }}
          className="bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-xs font-mono text-gray-300"
        >
          {percentText}%
        </motion.div>

        {/* Skiper UI Dark Glass Widget */}
        <div className="bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-full p-2.5 shadow-2xl flex flex-col items-center gap-4 relative">
          
          {/* Section Jump Dots */}
          {[
            { id: 0, label: '01' },
            { id: 1, label: '02' },
            { id: 2, label: '03' }
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className="relative group flex items-center justify-center w-6 h-6 rounded-full transition-transform active:scale-90"
              title={`Jump to section ${sec.label}`}
            >
              <span
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeSection === sec.id
                    ? 'bg-white scale-125 ring-4 ring-white/20'
                    : 'bg-white/30 group-hover:bg-white/70'
                }`}
              />
              {/* Tooltip on hover */}
              <span className="absolute right-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-mono font-semibold px-2 py-0.5 rounded shadow whitespace-nowrap">
                Section {sec.label}
              </span>
            </button>
          ))}

          {/* Vertical Progress Line Track */}
          <div className="w-1 h-20 bg-white/10 rounded-full relative overflow-hidden my-1">
            <motion.div
              className="w-full bg-white rounded-full absolute top-0 left-0"
              style={{
                height: `${scrollProgress * 100}%`,
              }}
            />
          </div>

          <div className="text-[10px] font-mono text-gray-500">
            0{activeSection + 1}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScrollArea;
