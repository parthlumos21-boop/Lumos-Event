import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';
import { CheckCircle, ArrowLeft, Send, Calendar, Clock, MapPin, User, Phone, Tag } from 'lucide-react';
import SearchableSelect from '../common/SearchableSelect';

const REFERENCE_OPTIONS = [
  'Architect',
  'Interior Designer',
  'Builder',
  'PMC/Automation Consultant',
  'Walk-in Client',
  'Other'
];

export const AppointmentForm = ({ portalType = 'admin' }) => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [autoSrNo, setAutoSrNo] = useState('APT-...');
  const [userOptions, setUserOptions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch preview Sr No from backend
  useEffect(() => {
    const fetchNextSr = async () => {
      try {
        const res = await axiosClient.get('/appointments/next-sr-no');
        if (res.data?.srNo) {
          setAutoSrNo(res.data.srNo);
        }
      } catch (err) {
        setAutoSrNo('APT-Auto');
      }
    };
    fetchNextSr();
  }, []);

  // Fetch active users from MongoDB for Reference field dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await axiosClient.get('/appointments/reference-users');
        if (res.data?.success && Array.isArray(res.data.users)) {
          const opts = res.data.users.map((u) => ({
            label: u.name,
            value: u.name,
            subLabel: `${u.role === 'admin' ? 'Admin' : 'Employee'} • ${u.email || ''}`
          }));
          setUserOptions(opts);
        }
      } catch (err) {
        console.error('Error fetching reference users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      clientName: '',
      location: '',
      contact: '',
      reference: 'Walk-in Client',
      referenceName: '',
      internalReference: '',
      requirements: '',
      appointmentDate: todayStr,
      appointmentTime: '11:00',
      remark: ''
    }
  });

  const selectedRef = watch('reference', 'Walk-in Client');

  const onSubmit = async (data) => {
    setSubmitStatus('loading');
    setErrorMessage('');
    try {
      const payload = {
        ...data,
        reference: data.reference || 'Walk-in Client',
        referenceName: data.reference !== 'Walk-in Client' ? (data.referenceName || '').trim() : '',
        internalReference: (data.internalReference || '').trim()
      };
      await axiosClient.post('/appointments', payload);
      setSubmitStatus('success');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to record appointment information.');
      setSubmitStatus('error');
    }
  };

  const handleAddAnother = async () => {
    reset({
      clientName: '',
      location: '',
      contact: '',
      reference: 'Walk-in Client',
      referenceName: '',
      internalReference: '',
      requirements: '',
      appointmentDate: todayStr,
      appointmentTime: '11:00',
      remark: ''
    });
    setSubmitStatus('idle');
    try {
      const res = await axiosClient.get('/appointments/next-sr-no');
      if (res.data?.srNo) setAutoSrNo(res.data.srNo);
    } catch {}
  };

  const handleReturn = () => {
    if (portalType === 'admin' || role === 'admin') {
      navigate('/admin/appointments');
    } else {
      navigate('/user/appointments');
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-[70vh] w-full bg-white text-[#1b1d26] flex flex-col items-center justify-center font-sans p-4 sm:p-6 relative select-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-gray-200/90 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-[0_20px_50px_-10px_rgba(47,118,127,0.15)] relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring' }}
            className="w-20 h-20 bg-[#2f767f]/10 border border-[#2f767f]/25 rounded-full flex items-center justify-center mx-auto mb-6 text-[#2f767f]"
          >
            <CheckCircle size={40} />
          </motion.div>
          <h2 className="text-2xl font-bold font-sans mb-2 text-gray-900">Appointment Scheduled!</h2>
          <p className="text-gray-600 mb-8 font-sans text-sm">
            The client appointment details have been successfully recorded in Lumos database.
          </p>

          <button
            type="button"
            onClick={handleAddAnother}
            className="w-full py-3.5 bg-[#2f767f] text-white rounded-full font-semibold hover:bg-[#255f67] transition-colors focus-visible:ring-2 focus-visible:ring-[#2f767f] cursor-pointer shadow-md mb-3"
          >
            Add Another Appointment
          </button>

          <button
            type="button"
            onClick={handleReturn}
            className="w-full py-3 text-gray-600 font-semibold hover:text-[#2f767f] transition-colors focus-visible:ring-2 focus-visible:ring-[#2f767f] cursor-pointer"
          >
            ← View All Appointments
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white font-sans text-[#2f767f] relative">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-7xl mx-auto px-2 sm:px-6 py-4 relative z-10">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm">
          {/* Logo & Subtitle */}
          <div className="flex flex-col items-center justify-center mb-8">
            <img src="/lumos_logo.png" alt="Lumos Logo" className="h-20 object-contain mb-2" />
            <span className="text-xs font-mono font-medium text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
              {portalType === 'admin' || role === 'admin' ? 'Admin Appointment Entry' : 'Staff Appointment Entry'}
            </span>
            {user && (
              <p className="text-xs text-gray-400 mt-1 font-sans">
                Logged in as: <span className="font-semibold text-[#2f767f]">{user.name}</span> ({user.email})
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-sans">
              {errorMessage}
            </div>
          )}

          {/* Form Layout: 2 Columns on Desktop, 1 Column on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Section 1: Client Information */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full flex flex-col justify-between">
              <div>
                <h2 className="font-semibold text-lg mb-1.5 text-[#2f767f] font-sans flex items-center gap-2">
                  <User size={18} />
                  <span>Client Information</span>
                </h2>
                <p className="text-xs text-gray-500 mb-6 font-sans">
                  Basic client contact, identification and location
                </p>

                <div className="space-y-4">
                  {/* Sr. No (Auto-generated Read-only) */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                      Sr. No. <span className="text-xs text-gray-400 font-normal">(Auto-generated)</span>
                    </label>
                    <input
                      type="text"
                      value={autoSrNo}
                      readOnly
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 font-mono font-semibold cursor-not-allowed select-none"
                    />
                  </div>

                  {/* Client Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('clientName', { required: 'Client Name is required' })}
                      placeholder="Enter client or company name"
                      className={clsx(
                        'w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#2f767f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f767f]/20 focus:border-[#2f767f] transition-all font-sans',
                        errors.clientName && 'border-red-500'
                      )}
                    />
                    {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName.message}</p>}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('location', { required: 'Location is required' })}
                      placeholder="Enter city / site location (e.g. Surat, Mumbai)"
                      className={clsx(
                        'w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#2f767f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f767f]/20 focus:border-[#2f767f] transition-all font-sans',
                        errors.location && 'border-red-500'
                      )}
                    />
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                  </div>

                  {/* Contact Number with +91 */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-white text-gray-600 font-mono text-sm">
                        +91
                      </span>
                      <input
                        {...register('contact', {
                          required: 'Contact number is required',
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'Please enter a valid 10-digit mobile number'
                          }
                        })}
                        type="tel"
                        maxLength={10}
                        placeholder="Enter 10-digit number"
                        className={clsx(
                          'w-full px-4 py-3 rounded-r-xl border border-gray-300 bg-white text-[#2f767f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f767f]/20 focus:border-[#2f767f] transition-all font-mono',
                          errors.contact && 'border-red-500'
                        )}
                      />
                    </div>
                    {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact.message}</p>}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Reference & Schedule Details */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full flex flex-col justify-between">
              <div>
                <h2 className="font-semibold text-lg mb-1.5 text-[#2f767f] font-sans flex items-center gap-2">
                  <Tag size={18} />
                  <span>Reference & Schedule Details</span>
                </h2>
                <p className="text-xs text-gray-500 mb-6 font-sans">
                  Referral source and scheduled meeting date & time
                </p>

                <div className="space-y-4">
                  {/* Reference (Dropdown) */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                      Reference
                    </label>
                    <select
                      {...register('reference')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#2f767f] focus:outline-none focus:ring-2 focus:ring-[#2f767f]/20 focus:border-[#2f767f] transition-all font-sans cursor-pointer"
                    >
                      {REFERENCE_OPTIONS.map((refItem) => (
                        <option key={refItem} value={refItem}>
                          {refItem}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Conditional Name Field (Visible for all except Walk-in Client) */}
                  {selectedRef !== 'Walk-in Client' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                        Name <span className="text-xs text-gray-400 font-normal">({selectedRef} Name)</span>
                      </label>
                      <input
                        {...register('referenceName')}
                        placeholder={`Enter ${selectedRef.toLowerCase()} name`}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#2f767f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f767f]/20 focus:border-[#2f767f] transition-all font-sans"
                      />
                    </motion.div>
                  )}

                  {/* Internal Reference (Searchable User Dropdown from MongoDB users) */}
                  <div>
                    <Controller
                      name="internalReference"
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          label="Internal Reference"
                          options={userOptions}
                          value={field.value}
                          onChange={(val) => field.onChange(val)}
                          placeholder={loadingUsers ? 'Loading team members...' : 'Select or search internal reference...'}
                          searchPlaceholder="Search team member name or role..."
                        />
                      )}
                    />
                  </div>

                  {/* Date & Time Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Appointment Date */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                        Appointment Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('appointmentDate', { required: 'Date is required' })}
                        type="date"
                        className={clsx(
                          'w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#2f767f] focus:outline-none focus:ring-2 focus:ring-[#2f767f]/20 focus:border-[#2f767f] transition-all font-sans',
                          errors.appointmentDate && 'border-red-500'
                        )}
                      />
                      {errors.appointmentDate && (
                        <p className="text-red-500 text-xs mt-1">{errors.appointmentDate.message}</p>
                      )}
                    </div>

                    {/* Appointment Time */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                        Appointment Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('appointmentTime', { required: 'Time is required' })}
                        type="time"
                        className={clsx(
                          'w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#2f767f] focus:outline-none focus:ring-2 focus:ring-[#2f767f]/20 focus:border-[#2f767f] transition-all font-sans',
                          errors.appointmentTime && 'border-red-500'
                        )}
                      />
                      {errors.appointmentTime && (
                        <p className="text-red-500 text-xs mt-1">{errors.appointmentTime.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Section 3: Requirements & Remarks (Full Width) */}
          <div className="mt-6 space-y-6">
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-6 text-[#2f767f] font-sans">
                Requirements & Remarks
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                    Requirements
                  </label>
                  <textarea
                    {...register('requirements')}
                    rows={4}
                    placeholder="Describe client's automation requirements, lighting zones, HVAC specifications, audio-video needs..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#2f767f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f767f]/20 focus:border-[#2f767f] transition-all font-sans text-sm"
                  />
                </div>

                {/* Remark */}
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                    Remark
                  </label>
                  <textarea
                    {...register('remark')}
                    rows={4}
                    placeholder="Enter additional notes, key meeting points, follow-up instructions, or observations..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#2f767f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f767f]/20 focus:border-[#2f767f] transition-all font-sans text-sm"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Submit Row: Cancel & Save Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleReturn}
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#2f767f] hover:bg-[#255f67] text-white rounded-full font-semibold font-sans flex items-center justify-center gap-2 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#2f767f]/50 disabled:opacity-60 cursor-pointer"
            >
              <Send size={18} />
              <span>{submitStatus === 'loading' ? 'Scheduling...' : 'Save Appointment'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
