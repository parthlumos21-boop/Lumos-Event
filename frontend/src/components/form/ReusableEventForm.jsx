import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';
import { CheckCircle, ArrowLeft, Send } from 'lucide-react';
import celebrationGif from '../../assets/celebration.gif';
import SearchableSelect from '../common/SearchableSelect';

const ReusableEventForm = ({ portalType = 'user' }) => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(true);
  const [gifKey, setGifKey] = useState(Date.now());
  const [customInterest, setCustomInterest] = useState('');

  useEffect(() => {
    if (submitStatus === 'success') {
      setShowCelebration(true);
      setGifKey(Date.now());
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      eventDate: new Date().toISOString().split('T')[0],
      relationship: '',
      interests: [],
      rating: 0,
      staffRating: 0,
      liked: [],
      comments: ''
    }
  });

  const watchRelationship = watch('relationship');

  const onSubmit = async (data) => {
    setSubmitStatus('loading');
    setErrorMessage('');
    try {
      const finalInterests = [...(data.interests || [])];
      if (finalInterests.includes('Other')) {
        const withoutOther = finalInterests.filter((i) => i !== 'Other');
        if (customInterest && customInterest.trim().length > 0) {
          withoutOther.push(customInterest.trim());
        }
        data.interests = withoutOther;
      }
      await axiosClient.post('/guests', data);
      setSubmitStatus('success');
    } catch (error) {
      console.error('Error submitting event guest:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to record guest information.');
      setSubmitStatus('error');
    }
  };

  const handleAddAnother = () => {
    reset({
      eventDate: new Date().toISOString().split('T')[0],
      relationship: '',
      interests: [],
      rating: 0,
      staffRating: 0,
      liked: [],
      comments: ''
    });
    setCustomInterest('');
    setSubmitStatus('idle');
  };

  const handleReturn = () => {
    if (role === 'admin') {
      navigate('/admin/guests');
    } else {
      navigate('/users/all');
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen w-full bg-white text-[#1b1d26] flex flex-col items-center justify-center font-sans p-4 sm:p-6 relative select-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-gray-200/90 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-[0_20px_50px_-10px_rgba(47,118,127,0.15)] relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-[#2f767f]/10 border border-[#2f767f]/25 rounded-full flex items-center justify-center mx-auto mb-6 text-[#2f767f]"
          >
            <CheckCircle size={40} />
          </motion.div>
          <h2 className="text-2xl font-bold font-sans mb-2 text-gray-900">Guest Recorded!</h2>
          <p className="text-gray-600 mb-8 font-sans text-sm">
            Information stored successfully.
          </p>

          <button
            onClick={handleAddAnother}
            className="w-full py-3.5 bg-[#2f767f] text-white rounded-full font-semibold hover:bg-[#255f67] transition-colors focus-visible:ring-2 focus-visible:ring-[#2f767f] cursor-pointer shadow-md mb-3"
          >
            Add Another Guest
          </button>

          <button
            onClick={handleReturn}
            className="w-full py-3 text-gray-600 font-semibold hover:text-[#2f767f] transition-colors focus-visible:ring-2 focus-visible:ring-[#2f767f] cursor-pointer"
          >
            ← View All Guests
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
            {portalType !== 'public' && (
              <span className="text-xs font-mono font-medium text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                {role === 'admin' ? 'Admin Event Entry' : 'Employee Event Entry'}
              </span>
            )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Section 1: Guest Details */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full flex flex-col">
              <h2 className="font-semibold text-lg mb-6 text-[#2f767f] font-sans">Guest Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                    Customer / Guest Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('guestName', { required: 'Name is required' })}
                    placeholder="Enter guest name"
                    className={clsx(
                      'w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#2f767f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f767f]/20 focus:border-[#2f767f] transition-all font-sans',
                      errors.guestName && 'border-red-500'
                    )}
                  />
                  {errors.guestName && <p className="text-red-500 text-xs mt-1">{errors.guestName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-white text-gray-600 font-mono text-sm">
                      +91
                    </span>
                    <input
                      {...register('mobileNumber', { required: 'Mobile number is required' })}
                      type="tel"
                      placeholder="Enter 10-digit number"
                      className={clsx(
                        'w-full px-4 py-3 rounded-r-xl border border-gray-300 bg-white text-[#2f767f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f767f]/20 focus:border-[#2f767f] transition-all font-mono',
                        errors.mobileNumber && 'border-red-500'
                      )}
                    />
                  </div>
                  {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                    Email Address
                  </label>
                  <input
                    {...register('emailAddress')}
                    type="email"
                    placeholder="guest@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#2f767f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f767f]/20 focus:border-[#2f767f] transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('eventDate', { required: 'Event Date is required' })}
                    type="date"
                    className={clsx(
                      'w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#2f767f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f767f]/20 focus:border-[#2f767f] transition-all font-sans',
                      errors.eventDate && 'border-red-500'
                    )}
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Relationship with Lumos (Tab-wise selector) */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full flex flex-col justify-between">
              <div>
                <h2 className="font-semibold text-lg mb-2 text-[#2f767f] font-sans">
                  Relationship with Lumos <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-gray-500 mb-4 font-sans">
                  Choose your professional association with Lumos
                </p>

                <Controller
                  name="relationship"
                  control={control}
                  rules={{ required: 'Please select a relationship' }}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2 md:flex-col">
                      {[
                        'Existing Customer',
                        'Potential Customer',
                        'Architect / Interior Designer',
                        'Builder / Developer',
                        'Business Partner',
                        'Vendor / Supplier',
                        'Friend / Family',
                        'Other'
                      ].map((opt) => {
                        const isSelected = field.value === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => field.onChange(opt)}
                            className={clsx(
                              'px-4 py-2.5 rounded-xl border text-sm font-sans transition-all text-center flex items-center justify-center cursor-pointer grow focus:outline-none focus:ring-2 focus:ring-[#2f767f]/30 relative',
                              isSelected
                                ? 'bg-[#2f767f] border-[#2f767f] text-white font-semibold shadow-xs'
                                : 'bg-white border-gray-300 hover:border-[#2f767f]/50 hover:bg-gray-50 text-gray-700'
                            )}
                          >
                            <span>{opt}</span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-white ml-2 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />

                {watchRelationship === 'Other' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Please Specify Relationship <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('relationshipOther', { required: 'Please specify your relationship' })}
                      placeholder="e.g. VIP Guest, Consultant, Media..."
                      className="w-full px-4 py-3 rounded-xl border border-[#2f767f] bg-white text-[#2f767f] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2f767f] font-sans text-sm"
                    />
                    {errors.relationshipOther && (
                      <p className="text-red-500 text-xs mt-1.5 font-sans">{errors.relationshipOther.message}</p>
                    )}
                  </motion.div>
                )}
                {errors.relationship && <p className="text-red-500 text-xs mt-2 font-sans font-medium">{errors.relationship.message}</p>}
              </div>

              <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200 text-[11px] text-gray-500">
                Selected: <span className="font-semibold text-[#2f767f]">{watchRelationship || 'None'}</span>
              </div>
            </section>

            {/* Section 3: Interests - 3 Items per row */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full flex flex-col">
              <h2 className="font-semibold text-lg mb-6 text-[#2f767f] font-sans">Areas of Interest</h2>
              <Controller
                name="interests"
                control={control}
                render={({ field }) => (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {[
                        'Home Automation',
                        'Lighting & Dimming',
                        'Home Theater',
                        'Audio & Visuals',
                        'Security & Surveillance',
                        'Building / Office Automation',
                        'Just Visiting',
                        'Other'
                      ].map((opt) => {
                        const isSelected = field.value.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                field.onChange(field.value.filter((v) => v !== opt));
                              } else {
                                field.onChange([...field.value, opt]);
                              }
                            }}
                            className={clsx(
                              'px-3.5 py-2.5 rounded-full border transition-all text-xs sm:text-sm font-sans focus-visible:ring-2 focus-visible:ring-[#2f767f] text-center flex items-center justify-center cursor-pointer',
                              isSelected
                                ? 'bg-[#2f767f] border-[#2f767f] text-white font-semibold shadow-xs'
                                : 'bg-white border-gray-300 hover:border-[#2f767f]/50 text-gray-700'
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Interest Input when Other is selected */}
                    {field.value.includes('Other') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-3 border-t border-gray-200"
                      >
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Specify Custom Area of Interest
                        </label>
                        <input
                          type="text"
                          value={customInterest}
                          onChange={(e) => setCustomInterest(e.target.value)}
                          placeholder="e.g. Solar Automation, Smart Glass, Acoustic Paneling..."
                          className="w-full px-4 py-2.5 rounded-xl border border-[#2f767f] bg-white text-[#2f767f] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2f767f] font-sans text-sm"
                        />
                      </motion.div>
                    )}
                  </div>
                )}
              />
            </section>

            {/* Section 4: Feedback */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full flex flex-col justify-between">
              <div>
                <h2 className="font-semibold text-lg mb-6 text-[#2f767f] font-sans">
                  Event Feedback
                </h2>

                {/* Side-by-side ratings row: Left: Visit, Right: Staff */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  {/* Left: How Was Your Visit? */}
                  <div>
                    <h3 className="font-medium text-sm mb-3 text-gray-700 font-sans">How Was Your Visit?</h3>
                    <Controller
                      name="rating"
                      control={control}
                      render={({ field }) => (
                        <div className="flex gap-1.5 sm:gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => field.onChange(star)}
                              style={{ touchAction: 'manipulation' }}
                              className={clsx(
                                'text-3xl sm:text-4xl min-w-[40px] min-h-[40px] flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-[#2f767f] rounded-lg cursor-pointer select-none active:scale-95',
                                field.value >= star ? 'text-amber-400' : 'text-gray-300 hover:text-gray-400'
                              )}
                              title={`Rate visit ${star} stars`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>

                  {/* Right: How Was Staff? */}
                  <div>
                    <h3 className="font-medium text-sm mb-3 text-gray-700 font-sans">How Was Staff?</h3>
                    <Controller
                      name="staffRating"
                      control={control}
                      render={({ field }) => (
                        <div className="flex gap-1.5 sm:gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => field.onChange(star)}
                              style={{ touchAction: 'manipulation' }}
                              className={clsx(
                                'text-3xl sm:text-4xl min-w-[40px] min-h-[40px] flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-[#2f767f] rounded-lg cursor-pointer select-none active:scale-95',
                                field.value >= star ? 'text-amber-400' : 'text-gray-300 hover:text-gray-400'
                              )}
                              title={`Rate staff ${star} stars`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">
                  Comments / Suggestions
                </label>
                <textarea
                  {...register('comments')}
                  rows={4}
                  placeholder="Share your feedback, impressions or suggestions..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-[#2f767f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f767f]/20 focus:border-[#2f767f] font-sans text-sm"
                />
              </div>
            </section>
          </div>

          {/* Submit Row */}
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
              <span>{submitStatus === 'loading' ? 'Saving Guest...' : 'Save Guest Information'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReusableEventForm;
