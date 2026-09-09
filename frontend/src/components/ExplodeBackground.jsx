import React from 'react';
import { motion, useTransform } from 'framer-motion';

const ExplodeBackground = ({ smoothProgress }) => {
  // 3D Matrix & Depth Transforms based on Scroll Progress
  const perspectiveScale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.15, 0.95]);
  const rotateX = useTransform(smoothProgress, [0, 0.5, 1], [8, -12, 4]);
  const rotateY = useTransform(smoothProgress, [0, 0.5, 1], [-8, 15, -4]);
  
  // Radial Explode Slices (Distances expand outwards during scroll)
  const sliceTL_X = useTransform(smoothProgress, [0, 0.5, 1], [0, -180, -320]);
  const sliceTL_Y = useTransform(smoothProgress, [0, 0.5, 1], [0, -130, -220]);
  const sliceTL_Z = useTransform(smoothProgress, [0, 0.5, 1], [0, 160, 420]);

  const sliceTR_X = useTransform(smoothProgress, [0, 0.5, 1], [0, 180, 320]);
  const sliceTR_Y = useTransform(smoothProgress, [0, 0.5, 1], [0, -130, -220]);
  const sliceTR_Z = useTransform(smoothProgress, [0, 0.5, 1], [0, 110, 320]);

  const sliceBL_X = useTransform(smoothProgress, [0, 0.5, 1], [0, -160, -280]);
  const sliceBL_Y = useTransform(smoothProgress, [0, 0.5, 1], [0, 150, 260]);
  const sliceBL_Z = useTransform(smoothProgress, [0, 0.5, 1], [0, 90, 220]);

  const sliceBR_X = useTransform(smoothProgress, [0, 0.5, 1], [0, 160, 280]);
  const sliceBR_Y = useTransform(smoothProgress, [0, 0.5, 1], [0, 150, 260]);
  const sliceBR_Z = useTransform(smoothProgress, [0, 0.5, 1], [0, 130, 360]);

  // Center Core Card Depth
  const coreZ = useTransform(smoothProgress, [0, 0.5, 1], [0, -180, 0]);
  const coreOpacity = useTransform(smoothProgress, [0, 0.5, 1], [0.85, 0.35, 0.85]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center bg-base select-none">
      
      {/* Soft Ambient Radial Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-gray-200/50 via-white to-transparent rounded-full blur-3xl opacity-70" />

      {/* 3D Perspective Container */}
      <motion.div
        style={{
          perspective: 1200,
          scale: perspectiveScale,
          rotateX,
          rotateY,
        }}
        className="relative w-[720px] h-[480px] flex items-center justify-center"
      >
        
        {/* Core Center Frame */}
        <motion.div
          style={{ z: coreZ, opacity: coreOpacity }}
          className="absolute w-full h-full rounded-3xl border border-black/10 bg-white/50 backdrop-blur-xl shadow-2xl flex flex-col justify-between p-8"
        >
          <div className="flex justify-between items-center text-xs font-mono text-gray-400">
            <span>LUMOS SMART LIVING</span>
            <span>3D SPATIAL SYSTEM</span>
          </div>
          <div className="text-center space-y-1">
            <p className="font-serif text-4xl text-gray-900/80">Future of Smart Living</p>
            <p className="font-sans text-xs text-gray-500 font-medium">Scroll down to explode spatial components</p>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
            <span>STATUS: ACTIVE</span>
            <span>LUMOSSOLUTION.COM</span>
          </div>
        </motion.div>

        {/* Exploding Slice 1: Top-Left (Intelligent Lighting) */}
        <motion.div
          style={{
            x: sliceTL_X,
            y: sliceTL_Y,
            z: sliceTL_Z,
          }}
          className="absolute top-0 left-0 w-64 h-40 bg-white/80 backdrop-blur-md rounded-2xl border border-black/10 p-5 shadow-lg flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-mono">01</div>
          <div>
            <h4 className="font-sans font-semibold text-sm text-gray-900">Intelligent Lighting</h4>
            <p className="font-sans text-xs text-gray-500">Tunable white & human-centric dimming</p>
          </div>
        </motion.div>

        {/* Exploding Slice 2: Top-Right (Home Automation) */}
        <motion.div
          style={{
            x: sliceTR_X,
            y: sliceTR_Y,
            z: sliceTR_Z,
          }}
          className="absolute top-0 right-0 w-64 h-40 bg-white/80 backdrop-blur-md rounded-2xl border border-black/10 p-5 shadow-lg flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-mono">02</div>
          <div>
            <h4 className="font-sans font-semibold text-sm text-gray-900">Home Automation</h4>
            <p className="font-sans text-xs text-gray-500">Unified touch & voice integration</p>
          </div>
        </motion.div>

        {/* Exploding Slice 3: Bottom-Left (Home Theater) */}
        <motion.div
          style={{
            x: sliceBL_X,
            y: sliceBL_Y,
            z: sliceBL_Z,
          }}
          className="absolute bottom-0 left-0 w-64 h-40 bg-white/80 backdrop-blur-md rounded-2xl border border-black/10 p-5 shadow-lg flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-mono">03</div>
          <div>
            <h4 className="font-sans font-semibold text-sm text-gray-900">Acoustic Theater</h4>
            <p className="font-sans text-xs text-gray-500">Immersive Dolby Atmos spaces</p>
          </div>
        </motion.div>

        {/* Exploding Slice 4: Bottom-Right (Curtains & Security) */}
        <motion.div
          style={{
            x: sliceBR_X,
            y: sliceBR_Y,
            z: sliceBR_Z,
          }}
          className="absolute bottom-0 right-0 w-64 h-40 bg-white/80 backdrop-blur-md rounded-2xl border border-black/10 p-5 shadow-lg flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-mono">04</div>
          <div>
            <h4 className="font-sans font-semibold text-sm text-gray-900">Curtains & Security</h4>
            <p className="font-sans text-xs text-gray-500">Motorized shades & smart access</p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default ExplodeBackground;
