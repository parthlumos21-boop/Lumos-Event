import React from 'react';
import * as Icons from 'lucide-react';
import clsx from 'clsx';

/**
 * Glassmorphic feature chip with Lumos primary color rounded icon square and 2-line label.
 * Styled with soft chip shadow (0 12px 30px -12px rgba(20,25,35,.22)).
 */
export const FeatureChip = ({
  icon = 'Sun',
  label = '',
  className = '',
  style = {}
}) => {
  const IconComponent = Icons[icon] || Icons.CircleDot;

  return (
    <div
      style={style}
      className={clsx(
        'inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-[0_12px_30px_-12px_rgba(20,25,35,0.22)] select-none transition-transform hover:-translate-y-0.5 duration-200',
        className
      )}
    >
      <div className="w-9 h-9 rounded-xl bg-[#2f767f] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_-2px_rgba(47,118,127,0.4)]">
        <IconComponent size={18} strokeWidth={2.2} />
      </div>

      <p className="text-xs sm:text-sm font-medium text-[#1b1d26] leading-tight font-sans whitespace-pre-line text-left">
        {label}
      </p>
    </div>
  );
};

export default FeatureChip;
