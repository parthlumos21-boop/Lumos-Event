import React from 'react';
import clsx from 'clsx';

/**
 * Standardized Typography heading matching the smart-home editorial reference:
 * Font weight 500, tight tracking (-0.04em), and proportional line-height.
 */
export const Heading = ({
  level = 2,
  children,
  className = '',
  size = 'default' // 'hero' | 'section' | 'card' | 'sub'
}) => {
  const Tag = `h${level}`;

  const sizeStyles = {
    hero: 'text-5xl sm:text-7xl lg:text-[88px] leading-[0.95] tracking-[-0.04em] font-medium text-[#1b1d26]',
    section: 'text-3xl sm:text-4xl md:text-5xl leading-[1.02] tracking-[-0.04em] font-medium text-[#1b1d26]',
    card: 'text-2xl sm:text-3xl leading-[1.1] tracking-[-0.03em] font-medium text-[#1b1d26]',
    sub: 'text-xl sm:text-2xl leading-[1.2] tracking-[-0.02em] font-medium text-[#1b1d26]'
  };

  return (
    <Tag className={clsx('font-sans', sizeStyles[size] || sizeStyles.section, className)}>
      {children}
    </Tag>
  );
};

export default Heading;
