/**
 * Field-level comparator for Guest documents to generate audit log diffs.
 */
function compareArrays(arr1, arr2) {
  const a = Array.isArray(arr1) ? [...arr1].sort() : [];
  const b = Array.isArray(arr2) ? [...arr2].sort() : [];
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

function calculateGuestDiff(oldDoc, updates) {
  const changes = [];

  // Helper to test primitive or nullish changes
  const checkPrimitive = (field, label, oldVal, newVal) => {
    if (newVal === undefined) return;
    const cleanOld = oldVal === null || oldVal === undefined ? '' : oldVal;
    const cleanNew = newVal === null || newVal === undefined ? '' : newVal;
    if (String(cleanOld).trim() !== String(cleanNew).trim()) {
      changes.push({
        field,
        fieldLabel: label,
        oldValue: cleanOld,
        newValue: cleanNew
      });
    }
  };

  // Helper to test boolean
  const checkBoolean = (field, label, oldVal, newVal) => {
    if (newVal === undefined) return;
    if (Boolean(oldVal) !== Boolean(newVal)) {
      changes.push({
        field,
        fieldLabel: label,
        oldValue: Boolean(oldVal),
        newValue: Boolean(newVal)
      });
    }
  };

  // Helper to test arrays
  const checkArray = (field, label, oldVal, newVal) => {
    if (newVal === undefined) return;
    if (!compareArrays(oldVal, newVal)) {
      changes.push({
        field,
        fieldLabel: label,
        oldValue: Array.isArray(oldVal) ? oldVal : [],
        newValue: Array.isArray(newVal) ? newVal : []
      });
    }
  };

  // Guest personal info
  if (updates.guest) {
    checkPrimitive('guest.name', 'Guest Name', oldDoc.guest?.name, updates.guest.name);
    checkPrimitive('guest.phone', 'Mobile Number', oldDoc.guest?.phone, updates.guest.phone);
    checkPrimitive('guest.email', 'Email Address', oldDoc.guest?.email, updates.guest.email);
    checkPrimitive('guest.company', 'Company / Firm', oldDoc.guest?.company, updates.guest.company);
  }

  // Relationship
  if (updates.relationship !== undefined) {
    checkPrimitive('relationship', 'Relationship with Lumos', oldDoc.relationship, updates.relationship);
  }

  // Interests
  if (updates.interests !== undefined) {
    checkArray('interests', 'Areas of Interest', oldDoc.interests, updates.interests);
  }

  // Follow-up
  if (updates.followUp) {
    checkBoolean('followUp.required', 'Follow-up Required', oldDoc.followUp?.required, updates.followUp.required);
    checkPrimitive('followUp.preferredMethod', 'Preferred Contact Method', oldDoc.followUp?.preferredMethod, updates.followUp.preferredMethod);
  }

  // Feedback
  if (updates.feedback) {
    if (updates.feedback.rating !== undefined) {
      const oldRating = oldDoc.feedback?.rating !== undefined ? Number(oldDoc.feedback.rating) : 0;
      const newRating = Number(updates.feedback.rating) || 0;
      if (oldRating !== newRating) {
        changes.push({
          field: 'feedback.rating',
          fieldLabel: 'Guest Rating',
          oldValue: oldRating,
          newValue: newRating
        });
      }
    }
    checkArray('feedback.liked', 'Liked Experiences', oldDoc.feedback?.liked, updates.feedback.liked);
    checkPrimitive('feedback.comments', 'Comments / Suggestions', oldDoc.feedback?.comments, updates.feedback.comments);
  }

  return changes;
}

module.exports = {
  calculateGuestDiff
};
