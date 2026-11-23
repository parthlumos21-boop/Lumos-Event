import React, { memo } from 'react';
import { ArrowRight } from 'lucide-react';

const EmployeeStatisticCard = memo(({
  title,
  value,
  description,
  icon: Icon,
  color = 'text-[#31747d]',
  bgColor = 'bg-[#31747d]/10'
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full group font-sans">
      <div>
        {/* Top Row: Title on Left, Icon Badge on Right */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
            {title}
          </span>
          <div className={`p-2 sm:p-2.5 rounded-2xl ${bgColor} ${color} shrink-0`}>
            {Icon && <Icon size={18} className="sm:w-5 sm:h-5" />}
          </div>
        </div>

        {/* Middle Value */}
        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 font-sans tracking-tight truncate leading-none">
          {value}
        </div>
      </div>

      {/* Bottom Section: Divider, Description & Arrow */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span className="truncate pr-1">{description}</span>
        <span className="group-hover:translate-x-1 text-[#31747d] transition-transform shrink-0">
          <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
});

export default EmployeeStatisticCard;
