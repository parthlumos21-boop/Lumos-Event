import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Users, UserCheck, Star, BellRing, ArrowRight, PlusCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGuests: 0,
    totalEmployees: 0,
    averageRating: '5.0',
    followUpRequired: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [guestsRes, employeesRes] = await Promise.all([
          axiosClient.get('/guests/stats').catch(() => ({ data: { totalGuests: 0, followUpRequired: 0, averageRating: '5.0' } })),
          axiosClient.get('/users').catch(() => ({ data: { total: 0 } }))
        ]);

        setStats({
          totalGuests: guestsRes.data?.totalGuests || 0,
          totalEmployees: employeesRes.data?.total || 0,
          averageRating: guestsRes.data?.averageRating || '5.0',
          followUpRequired: guestsRes.data?.followUpRequired || 0
        });
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
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
      sub: 'In lumos_event collection',
      icon: Users,
      color: 'text-[#31747d]',
      bgColor: 'bg-[#31747d]/10',
      action: () => navigate('/admin/guests')
    },
    {
      title: 'Active Employees',
      value: stats.totalEmployees,
      sub: 'In users collection',
      icon: UserCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      action: () => navigate('/admin/employees')
    },
    {
      title: 'Average Experience Rating',
      value: `${stats.averageRating} ★`,
      sub: 'From event feedback',
      icon: Star,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      action: () => navigate('/admin/guests')
    },
    {
      title: 'Follow-ups Required',
      value: stats.followUpRequired,
      sub: 'Requested guest contact',
      icon: BellRing,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      action: () => navigate('/admin/guests')
    }
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#31747d] tracking-tight">Admin Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time insights across LumosEvent database & guest responses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/form')}
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

      {/* Quick Access Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guests Action Card */}
        <div
          onClick={() => navigate('/admin/guests')}
          className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xs hover:border-[#31747d]/40 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#31747d]/10 text-[#31747d] flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Guest Management</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Browse, filter, and review all guest records migrated to the <span className="font-mono font-medium text-[#31747d]">lumos_event</span> collection in the isolated <span className="font-mono font-medium text-[#31747d]">LumosEvent</span> database.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#31747d]">
            <span>View All Guests</span>
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Employees Action Card */}
        <div
          onClick={() => navigate('/admin/employees')}
          className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xs hover:border-[#31747d]/40 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <UserCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Employee Directory</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Manage system users and staff accounts stored in the <span className="font-mono font-medium text-[#31747d]">users</span> collection. Create new employees with searchable role and department assignments.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
            <span>Manage Employees</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
