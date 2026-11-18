import React from 'react';
import { Users, Star, Bell, PlusCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const StatOverviewGrid = ({
  stats = { totalGuests: 0, averageRating: '5.0', followUpRequired: 0 },
  loading = false,
  onNavigateGuests,
  onNavigateForm
}) => {
  const cards = [
    {
      title: 'Total Guests',
      value: stats.totalGuests ?? 0,
      description: 'All registered attendees.',
      icon: Users,
      color: 'text-[#31747d]',
      bgColor: 'bg-[#31747d]/10',
      action: onNavigateGuests,
      isText: false
    },
    {
      title: 'Average Experience Rating',
      value: `${stats.averageRating || '5.0'} ★`,
      description: 'Visitor satisfaction score.',
      icon: Star,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      action: onNavigateGuests,
      isText: false
    },
    {
      title: 'Follow-ups Required',
      value: stats.followUpRequired ?? 0,
      description: 'Pending interaction tasks.',
      icon: Bell,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      action: onNavigateGuests,
      isText: false
    },
    {
      title: 'New Registration',
      value: 'Event Form',
      description: 'Quick guest check-in.',
      icon: PlusCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      action: onNavigateForm,
      isText: true
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 font-sans">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={card.action}
            className="bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                  {card.title}
                </span>
                <div className={`p-2 sm:p-2.5 rounded-2xl ${card.bgColor} ${card.color} shrink-0`}>
                  <Icon size={18} className="sm:w-5 sm:h-5" />
                </div>
              </div>

              <div
                className={clsx(
                  'font-sans tracking-tight truncate',
                  card.isText
                    ? 'text-base sm:text-lg lg:text-xl font-bold text-emerald-700'
                    : 'text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900'
                )}
              >
                {loading ? '...' : card.value}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
              <span className="truncate pr-1">{card.description}</span>
              <span className="group-hover:translate-x-1 text-[#31747d] transition-transform shrink-0">
                <ArrowRight size={14} />
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatOverviewGrid;
