import React from 'react';
import clsx from 'clsx';

/**
 * Reusable Section Card container matching the light smart-home reference.
 * Features 32-40px rounded corners, soft shadow, and responsive fluid padding.
 */
export const SectionCard = ({
  id,
  children,
  className = '',
  variant = 'light', // 'hero' | 'light' | 'white' | 'dark'
  maxWidth = 'max-w-[1200px]'
}) => {
  const variantStyles = {
    hero: 'bg-gradient-to-b from-[#f3f4f5] to-white border border-white/60 shadow-[0_12px_40px_-15px_rgba(20,25,35,0.08)]',
    light: 'bg-[#f3f4f5] border border-gray-200/50 shadow-[0_10px_30px_-12px_rgba(20,25,35,0.06)]',
    white: 'bg-white border border-gray-200/70 shadow-[0_12px_36px_-12px_rgba(20,25,35,0.07)]',
    dark: 'bg-[#1b1d26] text-white border border-[#2d303d] shadow-[0_20px_50px_-15px_rgba(10,12,18,0.5)]'
  };

  return (
    <section
      id={id}
      className={clsx(
        'w-full mx-auto rounded-[32px] sm:rounded-[40px] transition-all overflow-hidden relative',
        maxWidth,
        variantStyles[variant] || variantStyles.light,
        className
      )}
    >
      {children}
    </section>
  );
};

export default SectionCard;
