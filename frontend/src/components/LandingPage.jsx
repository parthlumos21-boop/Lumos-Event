import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import imgAutomation from '../assets/lumos_automation.jpg';
import imgLighting from '../assets/lumos_lighting.jpg';
import imgSecurity from '../assets/lumos_security.jpg';
import imgTheater from '../assets/lumos_theater.jpg';
import SpecularButton from './SpecularButton';
import Loader from './Loader';

const LandingPage = () => {
  const navigate = useNavigate();
  const targetRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  const opacity1 = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.15, 0.35, 0.55], [0, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.45, 0.65, 0.85], [0, 1, 0]);
  const opacity4 = useTransform(scrollYProgress, [0.75, 0.9], [0, 1]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div ref={targetRef} className="relative w-full bg-black font-sans text-white select-none">

      {/* FIXED FULLSCREEN BACKGROUND IMAGE LAYERS */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">

        {/* SCROLLING BACKGROUND IMAGE LAYERS */}
        <motion.div style={{ opacity: opacity1 }} className="absolute inset-0 w-full h-full">
          <img src={imgSecurity} alt="Lumos Security" className="w-full h-full object-cover" />
        </motion.div>
        <motion.div style={{ opacity: opacity2 }} className="absolute inset-0 w-full h-full">
          <img src={imgLighting} alt="Lumos Lighting" className="w-full h-full object-cover" />
        </motion.div>
        <motion.div style={{ opacity: opacity3 }} className="absolute inset-0 w-full h-full">
          <img src={imgTheater} alt="Lumos Theater" className="w-full h-full object-cover" />
        </motion.div>
        <motion.div style={{ opacity: opacity4 }} className="absolute inset-0 w-full h-full">
          <img src={imgAutomation} alt="Lumos Experience" className="w-full h-full object-cover" />
        </motion.div>

        {/* Dark Vignette Gradient Overlays for High-Contrast Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      </div>

      {/* FOREGROUND CONTENT SECTIONS (UNBOXED & CARDLESS) */}
      <div className="relative z-10 w-full">

        {/* SECTION 1: HERO */}
        <section className="h-screen w-full flex flex-col justify-center items-center px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl space-y-6"
          >

            <h1 className="font-sans font-extrabold text-6xl md:text-8xl tracking-tight text-white leading-none">
              Lumos Event
            </h1>
            <p className="font-sans text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto">
              A new space, a new chapter and a moment worth celebrating. Join us as we bring the Lumos experience to life.
            </p>
            <div className="mt-8">
              <SpecularButton
                size="lg"
                radius={18}
                tint="#ffffff"
                tintOpacity={1}
                blur={0}
                textColor="#000000"
                lineColor="#000000"
                baseColor="#cccccc"
                intensity={1}
                shineSize={10}
                shineFade={40}
                thickness={1}
                speed={0.35}
                followMouse
                proximity={250}
                autoAnimate={false}
                onClick={() => navigate('/form')}
              >
                Get Started
              </SpecularButton>
            </div>
          </motion.div>
        </section>

        {/* SECTION 2: ARCHITECTURAL LIGHTING */}
        <section className="h-screen w-full flex flex-col justify-center items-center px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl space-y-4"
          >
            <span className="text-xs font-mono text-white tracking-widest">01 / Architectural Lighting</span>
            <h2 className="font-sans font-bold text-5xl md:text-7xl text-white tracking-tight">Precision Dimming</h2>
            <p className="font-sans text-lg md:text-xl text-gray-300 font-light leading-relaxed">
              Tunable white circadian lighting and seamless scene integration tailored for modern smart spaces.
            </p>
          </motion.div>
        </section>

        {/* SECTION 3: SMART HOME AUTOMATION */}
        <section className="h-screen w-full flex flex-col justify-center items-center px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl space-y-4"
          >
            <span className="text-xs font-mono text-white tracking-widest">02 / Home Automation</span>
            <h2 className="font-sans font-bold text-5xl md:text-7xl text-white tracking-tight">Unified Touch Console</h2>
            <p className="font-sans text-lg md:text-xl text-gray-300 font-light leading-relaxed">
              Complete control of lighting, climate, acoustics, and security from a single intuitive glass touch surface.
            </p>
          </motion.div>
        </section>


        {/* SECTION 6: CLOSING CTA */}
        <section className="h-screen w-full flex flex-col justify-center items-center px-8 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl space-y-6"
          >
            <h2 className="font-sans font-bold text-5xl md:text-7xl text-white tracking-tight">Be Part of the Experience</h2>
            <p className="font-sans text-lg text-gray-300 font-light">
              Register your visit and share your feedback with the Lumos team.
            </p>
            <div className="mt-8 flex justify-center">
              <SpecularButton
                size="lg"
                radius={18}
                tint="#ffffff"
                tintOpacity={1}
                blur={0}
                textColor="#000000"
                lineColor="#000000"
                baseColor="#cccccc"
                intensity={1}
                shineSize={10}
                shineFade={40}
                thickness={1}
                speed={0.35}
                followMouse
                proximity={250}
                autoAnimate={false}
                onClick={() => navigate('/form')}
              >
                Get Started
              </SpecularButton>
            </div>
          </motion.div>

          <div className="text-center space-y-1 select-none pt-12">
            <h3 className="font-sans font-bold text-2xl tracking-widest text-gray-400">LUMOS</h3>
            <p className="font-mono text-xs text-gray-600">© 2026 Lumos Solutions. All rights reserved.</p>
          </div>
        </section>

      </div>
    </div >
  );
};

export default LandingPage;
