import React, { memo } from 'react';
import clsx from 'clsx';

/**
 * HeaderMetricCard
 * Lightweight, reusable metric pill/card with 4-directional symmetrical centering (top, bottom, left, right).
 */
const HeaderMetricCard = memo(({
  icon,
  iconColor = 'text-[#31747d]',
  value,
  label,
  minWidth = 'min-w-[80px] sm:min-w-[90px]',
  className = ''
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <i className={clsx(icon, iconColor, 'text-xs sm:text-sm shrink-0')} />;
    }
    const IconComponent = icon;
    return <IconComponent size={14} className={clsx(iconColor, 'shrink-0')} />;
  };

  return (
    <div
      className={clsx(
        'bg-gray-50/80 hover:bg-gray-100/70 border border-gray-200/70 rounded-2xl px-3 py-2 sm:px-3.5 sm:py-2.5 transition-colors shadow-2xs flex flex-col items-center justify-center text-center font-sans',
        minWidth,
        className
      )}
    >
      {/* Top Row: Icon + Value Centered from Left, Right, Top */}
      <div className="flex items-center justify-center gap-1.5 w-full">
        {renderIcon()}
        <span className="text-xs sm:text-sm font-extrabold text-gray-900 font-mono tracking-tight truncate leading-none">
          {value !== undefined && value !== null ? value : 0}
        </span>
      </div>

      {/* Bottom Row: Label Centered from Left, Right, Bottom */}
      {label && (
        <span className="text-[9.5px] sm:text-[10px] text-gray-400 font-medium block mt-1 text-center tracking-tight leading-none truncate max-w-full">
          {label}
        </span>
      )}
    </div>
  );
});

HeaderMetricCard.displayName = 'HeaderMetricCard';

export default HeaderMetricCard;
