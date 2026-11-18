import React, { useMemo } from 'react';

export const DASHBOARD_FILTER_MAP = {
  interests: {
    'Home Automation': ['Home Automation'],
    'Lighting & Dimming': ['Lighting & Dimming'],
    'Audio & Visuals': ['Audio & Visuals', 'Home Theater'],
    'Security': ['Security & Surveillance', 'Security']
  },
  relationships: {
    'Existing Customers': ['Existing Customer'],
    'Potential Customers': ['Potential Customer'],
    'Builders / Developers': ['Builder / Developer'],
    'Interior Designers': ['Architect / Interior Designer']
  }
};

const GuestInsightsPanels = ({
  guests = [],
  interests: preInterests,
  relationships: preRelationships,
  totalCount,
  onSelectInterest,
  onSelectRelationship
}) => {
  const totalGuests = typeof totalCount === 'number' ? totalCount : guests.length;

  // 1. Calculate or use pre-aggregated Guest Interests
  const interestStats = useMemo(() => {
    if (Array.isArray(preInterests) && preInterests.length > 0) {
      return preInterests;
    }

    const categories = [
      {
        key: 'home-automation',
        label: 'Home Automation',
        matcher: (item) =>
          Array.isArray(item.interests) &&
          item.interests.some((i) => i && i.toLowerCase().includes('home automation'))
      },
      {
        key: 'lighting-dimming',
        label: 'Lighting & Dimming',
        matcher: (item) =>
          Array.isArray(item.interests) &&
          item.interests.some(
            (i) => i && (i.toLowerCase().includes('lighting') || i.toLowerCase().includes('dimming'))
          )
      },
      {
        key: 'audio-visuals',
        label: 'Audio & Visuals',
        matcher: (item) =>
          Array.isArray(item.interests) &&
          item.interests.some(
            (i) =>
              i &&
              (i.toLowerCase().includes('audio') ||
                i.toLowerCase().includes('visual') ||
                i.toLowerCase().includes('theater'))
          )
      },
      {
        key: 'security',
        label: 'Security',
        matcher: (item) =>
          Array.isArray(item.interests) &&
          item.interests.some((i) => i && i.toLowerCase().includes('security'))
      }
    ];

    return categories.map((cat) => {
      const count = guests.filter(cat.matcher).length;
      const percentage = totalGuests > 0 ? Math.round((count / totalGuests) * 100) : 0;
      return {
        key: cat.key,
        label: cat.label,
        count,
        percentage
      };
    });
  }, [guests, totalGuests]);

  // 2. Calculate or use pre-aggregated Relationship Overview
  const relationshipStats = useMemo(() => {
    if (Array.isArray(preRelationships) && preRelationships.length > 0) {
      return preRelationships;
    }

    const rawCounts = {
      existing: 0,
      potential: 0,
      builders: 0,
      designers: 0,
      other: 0
    };

    guests.forEach((g) => {
      const rel = (g.relationship || '').toLowerCase().trim();
      if (rel.includes('existing')) {
        rawCounts.existing++;
      } else if (rel.includes('potential')) {
        rawCounts.potential++;
      } else if (rel.includes('builder') || rel.includes('developer')) {
        rawCounts.builders++;
      } else if (rel.includes('designer') || rel.includes('architect')) {
        rawCounts.designers++;
      } else {
        rawCounts.other++;
      }
    });

    const items = [
      {
        key: 'existing',
        label: 'Existing Customers',
        count: rawCounts.existing,
        color: '#31747d' // Lumos Teal
      },
      {
        key: 'potential',
        label: 'Potential Customers',
        count: rawCounts.potential,
        color: '#059669' // Emerald
      },
      {
        key: 'builders',
        label: 'Builders / Developers',
        count: rawCounts.builders,
        color: '#6366f1' // Indigo
      },
      {
        key: 'designers',
        label: 'Interior Designers',
        count: rawCounts.designers,
        color: '#f59e0b' // Amber
      }
    ];

    if (rawCounts.other > 0 || totalGuests === 0) {
      items.push({
        key: 'other',
        label: 'Other Categories',
        count: rawCounts.other,
        color: '#94a3b8' // Slate
      });
    }

    return items.map((item) => ({
      ...item,
      percentage: totalGuests > 0 ? Math.round((item.count / totalGuests) * 100) : 0
    }));
  }, [guests, totalGuests]);

  // SVG Donut Calculations
  const radius = 56;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const donutSlices = relationshipStats.map((item) => {
    const slicePercent = totalGuests > 0 ? item.count / totalGuests : 0;
    const strokeDasharray = `${slicePercent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += slicePercent;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
      {/* Left Panel: Guest Interests */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-5 bg-[#31747d] rounded-full inline-block" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Guest Interests
            </h3>
          </div>

          <div className="space-y-3">
            {interestStats.map((item) => (
              <div
                key={item.key}
                onClick={() => onSelectInterest && onSelectInterest(item.label)}
                title={`Filter by ${item.label}`}
                className="cursor-pointer group hover:bg-gray-50/80 -mx-2 px-2 py-2 rounded-xl transition-all"
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-gray-800 group-hover:text-[#31747d] transition-colors">
                    {item.label}
                  </span>
                  <span className="text-[#31747d] font-mono group-hover:scale-105 transition-transform">
                    {item.percentage}% ({item.count})
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#31747d] rounded-full group-hover:bg-[#255b62] transition-all duration-700 ease-out"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Relationship Overview */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-5 bg-[#31747d] rounded-full inline-block" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Relationship Overview
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="#F3F4F6"
                  strokeWidth={strokeWidth}
                />

                {/* Slices */}
                {totalGuests > 0 ? (
                  donutSlices.map((slice) =>
                    slice.count > 0 ? (
                      <circle
                        key={slice.key}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke={slice.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        strokeLinecap="butt"
                        onClick={() =>
                          onSelectRelationship && onSelectRelationship(slice.label)
                        }
                        title={`Filter by ${slice.label}`}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ) : null
                  )
                ) : (
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                  />
                )}
              </svg>

              {/* Center cutout label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-gray-900 font-sans tracking-tight">
                  {totalGuests}
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Guests
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-1.5 w-full max-w-xs">
              {relationshipStats.map((item) => (
                <div
                  key={item.key}
                  onClick={() =>
                    onSelectRelationship && onSelectRelationship(item.label)
                  }
                  title={`Filter by ${item.label}`}
                  className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700 group-hover:text-[#31747d] font-medium truncate transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-gray-900 shrink-0">
                    {item.count}{' '}
                    <span className="text-gray-400 font-normal">({item.percentage}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestInsightsPanels;
