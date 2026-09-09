import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const Scrollbar = ({ containerRef }) => {
  const { scrollYProgress } = useScroll({ container: containerRef });
  const [isVisible, setIsVisible] = useState(false);

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001
  });

  const thumbY = useTransform(smoothProgress, [0, 1], ['0%', '400%']);

  useEffect(() => {
    let timeout;
    const unsubscribe = scrollYProgress.on("change", () => {
      setIsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, 600);
    });
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [scrollYProgress]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 right-0 h-full w-2 flex justify-center py-2 z-50 pointer-events-none"
    >
      <div className="h-full w-1 bg-black/5 rounded-full overflow-hidden relative">
        <motion.div
          className="w-full bg-accent rounded-full absolute top-0 left-0"
          style={{
            height: '20%',
            y: thumbY
          }}
        />
      </div>
    </motion.div>
  );
};

export default Scrollbar;
