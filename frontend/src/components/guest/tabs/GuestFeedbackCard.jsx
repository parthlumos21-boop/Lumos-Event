import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

const RATING_LABELS = {
  1: '1/5 - Poor',
  2: '2/5 - Fair',
  3: '3/5 - Good',
  4: '4/5 - Very Good',
  5: '5/5 - Excellent'
};

const GuestFeedbackCard = ({ guest, onSave, saving }) => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [editingField, setEditingField] = useState(null); // 'staffRating' | 'rating' | 'comments' | 'all' | null
  const [hoverRating, setHoverRating] = useState(0);
  const [hoverStaffRating, setHoverStaffRating] = useState(0);
  const [saveIndicator, setSaveIndicator] = useState(false);

  const [formData, setFormData] = useState({
    staffRating: 5,
    rating: 5,
    comments: ''
  });

  // Sync with guest prop
  useEffect(() => {
    if (guest) {
      const fb = guest.feedback || {};
      setFormData({
        staffRating: typeof fb.staffRating === 'number' ? fb.staffRating : (fb.staffRating ? Number(fb.staffRating) : (fb.rating ? Number(fb.rating) : 5)),
        rating: typeof fb.rating === 'number' ? fb.rating : (fb.rating ? Number(fb.rating) : 5),
        comments: fb.comments || ''
      });
    }
  }, [guest]);

  const handleSaveField = async (fieldToSave = null) => {
    const payload = {
      feedback: {
        rating: Number(formData.rating) || 0,
        staffRating: Number(formData.staffRating) || 0,
        feedbackType: 'staff-rating',
        'feedback-type': 'staff-rating',
        comments: formData.comments.trim(),
        liked: guest?.feedback?.liked || []
      },
      remarks: fieldToSave
        ? `Feedback '${fieldToSave}' updated from Feedback card`
        : 'Feedback updated from Feedback card'
    };

    if (onSave) {
      await onSave(payload);
    }
    setEditingField(null);
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 3000);
  };

  const handleCancelField = () => {
    if (guest) {
      const fb = guest.feedback || {};
      setFormData({
        staffRating: typeof fb.staffRating === 'number' ? fb.staffRating : (fb.staffRating ? Number(fb.staffRating) : (fb.rating ? Number(fb.rating) : 5)),
        rating: typeof fb.rating === 'number' ? fb.rating : (fb.rating ? Number(fb.rating) : 5),
        comments: fb.comments || ''
      });
    }
    setEditingField(null);
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveField(field);
    } else if (e.key === 'Escape') {
      handleCancelField();
    }
  };

  const isEditing = (field) => editingField === 'all' || editingField === field;

  const currentStaffRating = formData.staffRating;
  const currentRating = formData.rating;

  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs font-sans group relative transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-[#007788] rounded-full inline-block" />
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Visit Feedback</h2>
        </div>

        {/* Status indicator and overall Edit button */}
        <div className="flex items-center gap-2">
          {saveIndicator && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-fadeIn">
              <i className="fa-solid fa-circle-check" /> Saved to MongoDB
            </span>
          )}

          {editingField !== 'all' && editingField !== 'comments' ? (
            <button
              type="button"
              onClick={() => setEditingField(isAdmin ? 'all' : 'comments')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#007788] hover:border-[#007788] text-xs font-semibold shadow-2xs transition-all opacity-80 hover:opacity-100 cursor-pointer"
              title={isAdmin ? "Edit feedback (or hover any field to edit directly)" : "Edit comments"}
            >
              <i className="fa-solid fa-pen text-[11px]" />
              <span>{isAdmin ? 'Edit All' : 'Edit Comments'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                Press <strong>Enter</strong> to save
              </span>
              <button
                type="button"
                onClick={() => handleSaveField(editingField || 'all')}
                disabled={saving}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#007788] hover:bg-[#006674] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <i className="fa-solid fa-check text-xs" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={handleCancelField}
                disabled={saving}
                className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-5 text-xs">
        {/* Row 1: How was Staff? (Appears FIRST before How Was Your Visit) */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-star text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">How was Staff?</span>
              {!isEditing('staffRating') && isAdmin && (
                <button
                  type="button"
                  onClick={() => setEditingField('staffRating')}
                  className="opacity-0 group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer"
                  title="Click to change staff rating"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('staffRating') || !isAdmin ? (
              <div
                onClick={isAdmin ? () => setEditingField('staffRating') : undefined}
                className={`flex items-center gap-3 mt-1 ${isAdmin ? 'cursor-pointer group/stars' : 'cursor-default'}`}
                title={isAdmin ? "Click to edit staff rating" : "Only administrators can update rating scores"}
              >
                <div className="flex items-center gap-1 text-base">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= currentStaffRating
                          ? 'text-amber-400 drop-shadow-2xs'
                          : 'text-gray-200'
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="font-bold text-gray-900 text-xs">
                  {currentStaffRating > 0 ? (RATING_LABELS[currentStaffRating] || `${currentStaffRating}/5`) : 'No rating recorded'}
                </span>
              </div>
            ) : (
              <div className="flex items-center flex-wrap gap-2 mt-1.5">
                <div className="flex items-center gap-1 text-xl select-none">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverStaffRating || currentStaffRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverStaffRating(star)}
                        onMouseLeave={() => setHoverStaffRating(0)}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, staffRating: star }));
                          if (editingField === 'staffRating') {
                            const payload = {
                              feedback: {
                                rating: formData.rating,
                                staffRating: star,
                                feedbackType: 'staff-rating',
                                'feedback-type': 'staff-rating',
                                comments: formData.comments.trim(),
                                liked: guest?.feedback?.liked || []
                              },
                              remarks: `Updated staff rating to ${star} stars`
                            };
                            onSave(payload);
                            setEditingField(null);
                            setSaveIndicator(true);
                            setTimeout(() => setSaveIndicator(false), 3000);
                          }
                        }}
                        className={`transition-transform hover:scale-125 cursor-pointer ${
                          active ? 'text-amber-400 drop-shadow-xs' : 'text-gray-200'
                        }`}
                        title={`Rate staff ${star} star${star > 1 ? 's' : ''}`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-gray-600 ml-1">
                  {RATING_LABELS[hoverStaffRating || currentStaffRating] || ''}
                </span>

                {editingField === 'staffRating' && (
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      type="button"
                      onClick={() => handleSaveField('staffRating')}
                      className="p-1 bg-[#007788] text-white rounded-lg hover:bg-[#006674] cursor-pointer"
                      title="Save (or press Enter)"
                    >
                      <i className="fa-solid fa-check text-[11px]" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelField}
                      className="p-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer"
                      title="Cancel"
                    >
                      <i className="fa-solid fa-xmark text-[11px]" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: How Was Your Visit? */}
        <div className="flex items-start gap-3 group/field relative pt-2 border-t border-gray-100/80">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-star text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">How Was Your Visit?</span>
              {!isEditing('rating') && isAdmin && (
                <button
                  type="button"
                  onClick={() => setEditingField('rating')}
                  className="opacity-0 group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer"
                  title="Click to change rating"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('rating') || !isAdmin ? (
              <div
                onClick={isAdmin ? () => setEditingField('rating') : undefined}
                className={`flex items-center gap-3 mt-1 ${isAdmin ? 'cursor-pointer group/stars' : 'cursor-default'}`}
                title={isAdmin ? "Click to edit rating" : "Only administrators can update rating scores"}
              >
                <div className="flex items-center gap-1 text-base">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= currentRating
                          ? 'text-amber-400 drop-shadow-2xs'
                          : 'text-gray-200'
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="font-bold text-gray-900 text-xs">
                  {currentRating > 0 ? (RATING_LABELS[currentRating] || `${currentRating}/5`) : 'No rating recorded'}
                </span>
              </div>
            ) : (
              <div className="flex items-center flex-wrap gap-2 mt-1.5">
                <div className="flex items-center gap-1 text-xl select-none">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || currentRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, rating: star }));
                          if (editingField === 'rating') {
                            const payload = {
                              feedback: {
                                rating: star,
                                staffRating: formData.staffRating,
                                feedbackType: 'staff-rating',
                                'feedback-type': 'staff-rating',
                                comments: formData.comments.trim(),
                                liked: guest?.feedback?.liked || []
                              },
                              remarks: `Updated visit rating to ${star} stars`
                            };
                            onSave(payload);
                            setEditingField(null);
                            setSaveIndicator(true);
                            setTimeout(() => setSaveIndicator(false), 3000);
                          }
                        }}
                        className={`transition-transform hover:scale-125 cursor-pointer ${
                          active ? 'text-amber-400 drop-shadow-xs' : 'text-gray-200'
                        }`}
                        title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-gray-600 ml-1">
                  {RATING_LABELS[hoverRating || currentRating] || ''}
                </span>

                {editingField === 'rating' && (
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      type="button"
                      onClick={() => handleSaveField('rating')}
                      className="p-1 bg-[#007788] text-white rounded-lg hover:bg-[#006674] cursor-pointer"
                      title="Save (or press Enter)"
                    >
                      <i className="fa-solid fa-check text-[11px]" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelField}
                      className="p-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer"
                      title="Cancel"
                    >
                      <i className="fa-solid fa-xmark text-[11px]" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Comments / Suggestions */}
        <div className="flex items-start gap-3 group/field relative pt-2 border-t border-gray-100/80">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-comment-dots text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Comments / Suggestions</span>
              {!isEditing('comments') && (
                <button
                  type="button"
                  onClick={() => setEditingField('comments')}
                  className="opacity-0 group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer"
                  title="Click to edit comments"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('comments') ? (
              <p
                onClick={() => setEditingField('comments')}
                className={`font-medium text-xs mt-1 cursor-pointer leading-relaxed ${
                  formData.comments ? 'text-gray-800' : 'text-gray-400 italic'
                } hover:text-[#007788]`}
                title="Click to edit comments"
              >
                {formData.comments || 'No comments or suggestions recorded yet.'}
              </p>
            ) : (
              <div className="space-y-1.5 mt-1.5">
                <textarea
                  rows={2}
                  autoFocus
                  value={formData.comments}
                  onChange={(e) => setFormData((prev) => ({ ...prev, comments: e.target.value }))}
                  onKeyDown={(e) => handleKeyDown(e, 'comments')}
                  placeholder="Enter guest feedback, impressions, or suggestions..."
                  className="w-full px-3 py-2 bg-gray-50 border border-[#007788] rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:bg-white resize-y"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">
                    Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Enter</kbd> to save
                  </span>
                  {editingField === 'comments' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSaveField('comments')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#007788] text-white rounded-lg hover:bg-[#006674] text-xs font-semibold cursor-pointer"
                      >
                        <i className="fa-solid fa-check text-[10px]" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelField}
                        className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestFeedbackCard;
