import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Star,
  BellRing,
  ArrowRight,
  PlusCircle,
  FileText,
  UserCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalGuests: 0,
    averageRating: '5.0',
    followUpRequired: 0
  });
  const [recentGuests, setRecentGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, guestsRes] = await Promise.all([
          axiosClient.get('/guests/stats').catch(() => ({
            data: { totalGuests: 0, followUpRequired: 0, averageRating: '5.0' }
          })),
          axiosClient.get('/guests').catch(() => ({ data: { guests: [] } }))
        ]);

        setStats({
          totalGuests: statsRes.data?.totalGuests || 0,
          averageRating: statsRes.data?.averageRating || '5.0',
          followUpRequired: statsRes.data?.followUpRequired || 0
        });

        const list = guestsRes.data?.guests || [];
        setRecentGuests(list.slice(0, 5));
      } catch (err) {
        console.error('Failed to load employee dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Guests',
      value: stats.totalGuests,
      sub: 'All recorded attendees',
      icon: Users,
      color: 'text-[#31747d]',
      bgColor: 'bg-[#31747d]/10',
      action: () => navigate('/users/all')
    },
    {
      title: 'Average Experience Rating',
      value: `${stats.averageRating} ★`,
      sub: 'Visitor satisfaction score',
      icon: Star,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      action: () => navigate('/users/all')
    },
    {
      title: 'Follow-ups Required',
      value: stats.followUpRequired,
      sub: 'Pending interaction tasks',
      icon: BellRing,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      action: () => navigate('/users/all')
    },
    {
      title: 'Register New Guest',
      value: 'Event Form',
      sub: 'Quick guest check-in',
      icon: PlusCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      action: () => navigate('/users/form')
    }
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#31747d] tracking-tight">
            {user?.name ? `${user.name} Dashboard` : 'Employee Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track real-time event attendees, guest impressions, and follow-up activities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/users/form')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#31747d] hover:bg-[#255b62] text-white rounded-full font-semibold text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#31747d]/30 cursor-pointer"
          >
            <PlusCircle size={18} /> Add New Guest
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={card.action}
              className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-2xl ${card.bgColor} ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
                {loading ? '...' : card.value}
              </div>

              <div className="flex items-center justify-between mt-3 text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span>{card.sub}</span>
                <span className="group-hover:translate-x-1 text-[#31747d] transition-transform">
                  <ArrowRight size={14} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* All Guests Action Card */}
        <div
          onClick={() => navigate('/users/all')}
          className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xs hover:border-[#31747d]/40 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#31747d]/10 text-[#31747d] flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Guest Directory</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Access the complete guest list, view detailed attendee profiles, and manage follow-up interactions.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#31747d]">
            <span>View All Guests</span>
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Quick Registration Card */}
        <div
          onClick={() => navigate('/users/form')}
          className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xs hover:border-[#31747d]/40 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Check-in & Registration</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Open the digital event check-in form to register new guests, capture interest preferences, and log ratings directly.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <span>Open Event Form</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>

      {/* Recent Attendees Section */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#31747d] rounded-full inline-block" />
            <h3 className="text-base font-bold text-gray-900">Recent Registrations</h3>
          </div>
          <button
            onClick={() => navigate('/users/all')}
            className="text-xs font-semibold text-[#31747d] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading recent guests...</div>
        ) : recentGuests.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 italic">
            No guest registrations found yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentGuests.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/users/guests/${item._id}`)}
                className="py-3.5 flex items-center justify-between hover:bg-gray-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cyan-50 text-[#007788] flex items-center justify-center font-bold text-xs">
                    {item.guest?.name?.charAt(0) || 'G'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-[#31747d] transition-colors">
                      {item.guest?.name || 'Unnamed Guest'}
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono">
                      {item.guest?.phone || '-'} • {item.relationship || 'Guest'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.feedback?.rating ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      ★ {item.feedback.rating}/5
                    </span>
                  ) : null}

                  {item.followUp?.required && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      Follow-up
                    </span>
                  )}

                  <span className="text-gray-300 group-hover:text-[#31747d] group-hover:translate-x-0.5 transition-all">
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
