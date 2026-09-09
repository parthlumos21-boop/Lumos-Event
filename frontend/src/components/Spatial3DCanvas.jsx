import React from 'react';
import { motion, useTransform } from 'framer-motion';
import lightingImg from '../assets/lumos_lighting.jpg';
import automationImg from '../assets/lumos_automation.jpg';
import theaterImg from '../assets/lumos_theater.jpg';
import securityImg from '../assets/lumos_security.jpg';

const Spatial3DCanvas = ({ smoothProgress }) => {
  // 3D Matrix & Perspective Scale
  const perspectiveScale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.1, 0.9]);
  const rotateX = useTransform(smoothProgress, [0, 0.5, 1], [6, -10, 4]);
  const rotateY = useTransform(smoothProgress, [0, 0.5, 1], [-6, 12, -4]);

  // Spatial Explosion Distances (Pushes 3D cards outward to sides to avoid central text collision)
  const leftCardX = useTransform(smoothProgress, [0, 0.5, 1], [-260, -440, -560]);
  const rightCardX = useTransform(smoothProgress, [0, 0.5, 1], [260, 440, 560]);

  const topCardY = useTransform(smoothProgress, [0, 0.5, 1], [-180, -220, -320]);
  const bottomCardY = useTransform(smoothProgress, [0, 0.5, 1], [180, 220, 320]);

  const cardZ_1 = useTransform(smoothProgress, [0, 0.5, 1], [50, 200, 450]);
  const cardZ_2 = useTransform(smoothProgress, [0, 0.5, 1], [20, 150, 350]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center bg-black select-none">
      
      {/* Dark Mood Gradient Ambient Glow */}
      <div className="absolute w-[800px] h-[800px] bg-gradient-to-tr from-blue-950/20 via-slate-900/30 to-transparent rounded-full blur-3xl opacity-60" />
      <div className="absolute w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-3xl opacity-40 top-1/4" />

      {/* 3D Perspective Container */}
      <motion.div
        style={{
          perspective: 1600,
          scale: perspectiveScale,
          rotateX,
          rotateY,
        }}
        className="relative w-full max-w-7xl h-[600px] flex items-center justify-center"
      >

        {/* 3D Floating Glass Card 1: Architectural Lighting (Left Top) */}
        <motion.div
          style={{
            x: leftCardX,
            y: topCardY,
            z: cardZ_1,
          }}
          className="absolute w-[360px] h-[220px] rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl group"
        >
          <img 
            src={lightingImg} 
            alt="Lumos Architectural Lighting" 
            className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
            <span className="text-[10px] font-mono text-cyan-400">01 / LIGHTING</span>
            <h4 className="text-sm font-semibold text-white">Architectural Dimming</h4>
          </div>
        </motion.div>

        {/* 3D Floating Glass Card 2: Smart Automation (Right Top) */}
        <motion.div
          style={{
            x: rightCardX,
            y: topCardY,
            z: cardZ_2,
          }}
          className="absolute w-[360px] h-[220px] rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl group"
        >
          <img 
            src={automationImg} 
            alt="Lumos Smart Home Automation" 
            className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
            <span className="text-[10px] font-mono text-cyan-400">02 / AUTOMATION</span>
            <h4 className="text-sm font-semibold text-white">Unified Touch Console</h4>
          </div>
        </motion.div>

        {/* 3D Floating Glass Card 3: Acoustic Theater (Left Bottom) */}
        <motion.div
          style={{
            x: leftCardX,
            y: bottomCardY,
            z: cardZ_2,
          }}
          className="absolute w-[360px] h-[220px] rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl group"
        >
          <img 
            src={theaterImg} 
            alt="Lumos Home Theater" 
            className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
            <span className="text-[10px] font-mono text-cyan-400">03 / THEATER</span>
            <h4 className="text-sm font-semibold text-white">Dolby Atmos Cinema</h4>
          </div>
        </motion.div>

        {/* 3D Floating Glass Card 4: Curtains & Security (Right Bottom) */}
        <motion.div
          style={{
            x: rightCardX,
            y: bottomCardY,
            z: cardZ_1,
          }}
          className="absolute w-[360px] h-[220px] rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl group"
        >
          <img 
            src={securityImg} 
            alt="Lumos Security & Shades" 
            className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
            <span className="text-[10px] font-mono text-cyan-400">04 / SHADES & ACCESS</span>
            <h4 className="text-sm font-semibold text-white">Motorized Smart Shades</h4>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Spatial3DCanvas;
