import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import clsx from 'clsx';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import celebrationGif from '../assets/celebration.gif';

const EventForm = () => {
  const navigate = useNavigate();
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle, loading, success, error
  const [showCelebration, setShowCelebration] = useState(true);
  const [gifKey, setGifKey] = useState(Date.now());

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
      liked: [],
    }
  });

  const watchRelationship = watch('relationship');

  const onSubmit = async (data) => {
    setSubmitStatus('loading');
    try {
      await axios.post('http://localhost:6002/api/guests', data);
      setSubmitStatus('success');
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    }
  };

  const handleAddAnother = () => {
    reset();
    setSubmitStatus('idle');
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-white text-[#31747d] flex flex-col items-center justify-center font-sans p-6 relative overflow-hidden">
        {showCelebration && (
          <img
            key={gifKey}
            src={`${celebrationGif}?t=${gifKey}`}
            alt="Celebration"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-60 z-0"
          />
        )}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-50/90 backdrop-blur-md border border-gray-200 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400"
          >
            <CheckCircle size={40} />
          </motion.div>
          <h2 className="text-2xl font-bold font-sans mb-2">Saved</h2>
          <p className="text-gray-600 mb-8 font-sans text-sm">Guest information has been recorded.</p>

          <button
            onClick={handleAddAnother}
            className="w-full py-3 bg-[#31747d] text-white rounded-full font-semibold hover:bg-gray-200 transition-colors focus-visible:ring-2 focus-visible:ring-[#31747d]"
          >
            Add Another Guest
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 mt-4 text-gray-600 font-semibold hover:text-[#31747d] transition-colors focus-visible:ring-2 focus-visible:ring-[#31747d]"
          >
            Return to home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans pb-24 relative text-[#31747d]">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-2xl">

          <div className="flex justify-center mb-6">
            <img src="/lumos_logo.png" alt="Lumos Logo" className="h-24 object-contain" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

            {/* Section 1: Guest Details */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full flex flex-col">
              <h2 className="font-semibold text-lg mb-6 text-[#31747d] font-sans">Guest Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">Customer / Guest Name <span className="text-red-500">*</span></label>
                  <input
                    {...register("guestName", { required: "Name is required" })}
                    placeholder="Enter guest name"
                    className={clsx(
                      "w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#31747d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all font-sans",
                      errors.guestName && "border-red-500"
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">Mobile Number <span className="text-red-500">*</span></label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-white text-gray-600 font-mono text-sm">
                      +91
                    </span>
                    <input
                      {...register("mobileNumber", { required: "Mobile number is required" })}
                      type="tel"
                      placeholder="Enter 10-digit number"
                      className="w-full px-4 py-3 rounded-r-xl border border-gray-300 bg-white text-[#31747d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">Email Address</label>
                  <input
                    {...register("emailAddress")}
                    type="email"
                    placeholder="guest@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#31747d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">Company / Organization</label>
                  <input
                    {...register("company")}
                    placeholder="Company name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#31747d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">Event Date <span className="text-red-500">*</span></label>
                  <input
                    {...register("eventDate", { required: "Event Date is required" })}
                    type="date"
                    className={clsx(
                      "w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#31747d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all font-sans",
                      errors.eventDate && "border-red-500"
                    )}
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Relationship */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full flex flex-col">
              <h2 className="font-semibold text-lg mb-6 text-[#31747d] font-sans">Relationship with Lumos <span className="text-red-500">*</span></h2>
              <Controller
                name="relationship"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2 md:flex-col">
                    {['Existing Customer', 'Potential Customer', 'Architect / Interior Designer', 'Builder / Developer', 'Business Partner', 'Vendor / Supplier', 'Friend / Family', 'Other'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => field.onChange(opt)}
                        className={clsx(
                          "px-4 py-2 rounded-full border transition-colors text-sm font-sans focus-visible:ring-2 focus-visible:ring-[#31747d] grow",
                          field.value === opt
                            ? "bg-[#31747d] border-[#31747d] text-white font-semibold"
                            : "bg-white border-gray-300 hover:border-gray-400 text-gray-700"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              />
              {watchRelationship === 'Other' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                  <input
                    {...register("relationshipOther", { required: "Please specify your relationship" })}
                    placeholder="Please specify"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#31747d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all font-sans"
                  />
                  {errors.relationshipOther && <p className="text-red-500 text-xs mt-2 font-sans">{errors.relationshipOther.message}</p>}
                </motion.div>
              )}
              {errors.relationship && <p className="text-red-500 text-xs mt-2 font-sans">Required</p>}
            </section>

            {/* Section 3: Interests */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full flex flex-col">
              <h2 className="font-semibold text-lg mb-6 text-[#31747d] font-sans">Areas of Interest</h2>
              <Controller
                name="interests"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2 md:flex-col">
                    {['Home Automation', 'Lighting & Dimming', 'Home Theater', 'Curtains & Shades', 'Security', 'Building / Office Automation', 'Just Visiting'].map(opt => {
                      const isSelected = field.value.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              field.onChange(field.value.filter(v => v !== opt));
                            } else {
                              field.onChange([...field.value, opt]);
                            }
                          }}
                          className={clsx(
                            "px-4 py-2 rounded-full border transition-colors text-sm font-sans focus-visible:ring-2 focus-visible:ring-[#31747d] grow",
                            isSelected
                              ? "bg-[#31747d] border-[#31747d] text-white font-semibold"
                              : "bg-white border-gray-300 hover:border-gray-400 text-gray-700"
                          )}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                )}
              />
            </section>

            {/* Section 4: Feedback (Optional) */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full flex flex-col">
              <h2 className="font-semibold text-lg mb-6 text-[#31747d] font-sans">Event Feedback <span className="font-normal text-gray-500 text-sm">(Optional)</span></h2>

              <div className="mb-8">
                <h3 className="font-medium text-sm mb-3 text-gray-700 font-sans">How was your experience today?</h3>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          className={clsx(
                            "text-4xl transition-colors focus-visible:ring-2 focus-visible:ring-[#31747d] rounded",
                            field.value >= star ? "text-amber-400" : "text-zinc-700 hover:text-zinc-500"
                          )}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-sm mb-3 text-gray-700 font-sans">What did you like most?</h3>
                <Controller
                  name="liked"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {['Office Experience', 'Product Demonstrations', 'Automation Solutions', 'Lighting', 'Home Theater', 'Team Interaction', 'Overall Ambience', 'Other'].map(opt => {
                        const isSelected = field.value.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              if (isSelected) field.onChange(field.value.filter(v => v !== opt));
                              else field.onChange([...field.value, opt]);
                            }}
                            className={clsx(
                              "px-4 py-2 rounded-full border transition-colors text-sm font-sans focus-visible:ring-2 focus-visible:ring-[#31747d] grow",
                              isSelected ? "bg-[#31747d] border-[#31747d] text-white font-semibold" : "bg-white border-gray-300 text-gray-700"
                            )}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 font-sans">Additional Comments</label>
                <textarea
                  {...register("comments")}
                  rows={3}
                  placeholder="Any feedback or suggestions?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#31747d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all resize-none font-sans"
                />
              </div>
            </section>

          </div> {/* End of grid container */}

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-1/3 md:w-1/2 py-4 bg-white text-[#31747d] border border-gray-300 rounded-full font-semibold font-sans hover:bg-gray-100 transition-all shadow-xl active:scale-95 focus-visible:ring-2 focus-visible:ring-[#31747d]"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="w-2/3 md:w-1/2 py-4 bg-[#31747d] text-white rounded-full font-semibold font-sans hover:bg-gray-200 transition-all shadow-xl active:scale-95 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#31747d]"
            >
              {submitStatus === 'loading' ? 'Saving...' : 'Save'}
            </button>
          </div>

          {submitStatus === 'error' && (
            <p className="text-red-500 text-center font-mono mt-4">Failed to save guest. Please check connection.</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default EventForm;
