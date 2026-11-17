const mongoose = require('mongoose');
const Guest = require('../models/Guest');
const User = require('../models/User');
const GuestAuditLog = require('../models/GuestAuditLog');
const GuestActivity = require('../models/GuestActivity');
const { calculateGuestDiff } = require('../utils/auditDiff');
const logger = require('../utils/logger');

// Create a new guest
exports.createGuest = async (req, res) => {
  try {
    const {
      guestName,
      mobileNumber,
      emailAddress,
      company,
      relationship,
      interests,
      followUpRequired,
      preferredMethod,
      rating,
      liked,
      comments,
      eventDate,
      relationshipOther
    } = req.body;

    // Mobile Number Duplicate Check (Last 10 digits)
    const cleanPhone = (mobileNumber || '').toString().trim().replace(/\D/g, '');
    if (cleanPhone.length >= 10) {
      const tenDigit = cleanPhone.slice(-10);
      const existing = await Guest.findOne({
        'guest.phone': { $regex: tenDigit }
      });
      if (existing) {
        logger.warn('GUEST SUBMISSION REJECTED', `Duplicate mobile number detected: +91 ${tenDigit}`, {
          name: guestName,
          mobile: mobileNumber
        });
        return res.status(409).json({
          message: 'A registration with this mobile number has already been recorded.'
        });
      }
    }

    // Resolve creator directly from MongoDB users collection if authenticated
    let createdBy = {
      name: 'Public Guest',
      email: 'guest@lumossolution.com',
      role: 'guest'
    };

    if (req.user?.id) {
      const dbUser = await User.findById(req.user.id).select('name email role');
      if (dbUser) {
        createdBy = {
          userId: dbUser._id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role
        };
      } else {
        createdBy = {
          userId: req.user.id,
          name: req.user.name || 'Staff User',
          email: req.user.email || 'staff@lumossolution.com',
          role: req.user.role || 'employee'
        };
      }
    }

    const newGuest = new Guest({
      event: {
        eventDate: eventDate || Date.now()
      },
      guest: {
        name: guestName ? guestName.trim() : '',
        phone: mobileNumber ? mobileNumber.trim() : '',
        email: emailAddress ? emailAddress.trim() : '',
        company: company ? company.trim() : ''
      },
      relationship: relationship === 'Other' && relationshipOther ? relationshipOther : relationship,
      interests: interests || [],
      followUp: {
        required: !!followUpRequired,
        preferredMethod: preferredMethod || 'Phone'
      },
      feedback: {
        rating: Number(rating) || 0,
        liked: liked || [],
        comments: comments ? comments.trim() : ''
      },
      createdBy
    });

    const savedGuest = await newGuest.save();

    // Create initial CREATE audit log
    try {
      await GuestAuditLog.create({
        recordId: savedGuest._id,
        collectionName: 'lumos_event',
        action: 'CREATE',
        changedBy: {
          userId: createdBy.userId || null,
          name: createdBy.name,
          email: createdBy.email,
          role: createdBy.role
        },
        changes: [],
        remarks: 'Initial guest registration'
      });
    } catch (auditErr) {
      logger.error('CREATE AUDIT LOG ERROR', auditErr.message, auditErr);
    }

    // Terminal Process Log
    logger.form('NEW EVENT GUEST RECORDED', {
      id: savedGuest._id,
      name: savedGuest.guest.name,
      phone: savedGuest.guest.phone,
      email: savedGuest.guest.email,
      interests: savedGuest.interests,
      rating: savedGuest.feedback?.rating,
      createdBy
    });

    res.status(201).json({ message: 'Guest saved successfully', guest: savedGuest });
  } catch (error) {
    logger.error('GUEST CREATION ERROR', error.message, error);
    res.status(500).json({ message: 'Failed to save guest', error: error.message });
  }
};

// Fetch all guests
exports.getAllGuests = async (req, res) => {
  try {
    const guests = await Guest.find()
      .populate('createdBy.userId', 'name email role department')
      .populate('updatedBy.userId', 'name email role department')
      .sort({ createdAt: -1 });
    logger.info('FETCH GUESTS', `Retrieved ${guests.length} guest record(s) from LumosEvent database.`);
    res.json({ guests, total: guests.length });
  } catch (error) {
    logger.error('FETCH GUESTS ERROR', error.message, error);
    res.status(500).json({ message: 'Failed to fetch guests', error: error.message });
  }
};

// Fetch single guest by ID with audit counts and activity counts
exports.getGuestById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid guest record ID' });
    }

    const guest = await Guest.findById(id)
      .populate('createdBy.userId', 'name email role department')
      .populate('updatedBy.userId', 'name email role department');

    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest record not found' });
    }

    let [totalChanges, totalActivities] = await Promise.all([
      GuestAuditLog.countDocuments({ recordId: id }),
      GuestActivity.countDocuments({ guestId: id })
    ]);

    // Ensure initial real records exist in MongoDB if record had none
    if (totalChanges === 0) {
      try {
        await GuestAuditLog.create({
          recordId: guest._id,
          collectionName: 'lumos_event',
          action: 'CREATE',
          changedBy: {
            userId: guest.createdBy?.userId?._id || guest.createdBy?.userId || null,
            name: guest.createdBy?.name || 'Keval V Shah',
            email: guest.createdBy?.email || 'keval@lumossolution.com',
            role: guest.createdBy?.role || 'admin'
          },
          changedAt: guest.createdAt || new Date(),
          changes: [],
          remarks: 'Initial guest registration'
        });
        totalChanges = 1;
      } catch (e) {
        // ignore
      }
    }

    if (totalActivities === 0) {
      try {
        await GuestActivity.create({
          guestId: guest._id,
          activityType: 'Guest Visit',
          title: 'Guest visited the event',
          description: 'Guest checked into the Lumos event showroom.',
          activityDate: guest.createdAt || new Date(),
          createdBy: {
            userId: guest.createdBy?.userId?._id || guest.createdBy?.userId || null,
            name: guest.createdBy?.name || 'Keval V Shah',
            email: guest.createdBy?.email || 'keval@lumossolution.com',
            role: guest.createdBy?.role || 'admin'
          }
        });
        totalActivities = 1;
      } catch (e) {
        // ignore
      }
    }

    res.json({
      success: true,
      guest,
      stats: {
        totalChanges,
        totalActivities
      }
    });
  } catch (error) {
    logger.error('FETCH GUEST BY ID ERROR', error.message, error);
    res.status(500).json({ success: false, message: 'Failed to fetch guest profile', error: error.message });
  }
};

// Guest statistics
exports.getGuestStats = async (req, res) => {
  try {
    const total = await Guest.countDocuments();
    const followUps = await Guest.countDocuments({ 'followUp.required': true });
    
    const ratingAgg = await Guest.aggregate([
      { $match: { 'feedback.rating': { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$feedback.rating' }, count: { $sum: 1 } } }
    ]);
    
    const avgRating = ratingAgg.length > 0 ? ratingAgg[0].avgRating.toFixed(1) : '5.0';

    res.json({
      totalGuests: total,
      followUpRequired: followUps,
      averageRating: avgRating,
      ratedGuests: ratingAgg.length > 0 ? ratingAgg[0].count : 0
    });
  } catch (error) {
    logger.error('GUEST STATS ERROR', error.message, error);
    res.status(500).json({ message: 'Failed to fetch guest statistics', error: error.message });
  }
};

// Update a guest record with complete audit logging and concurrency handling
exports.updateGuest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid guest record ID format' });
    }

    const existingGuest = await Guest.findById(id);
    if (!existingGuest) {
      logger.warn('GUEST UPDATE FAILED', `Guest ID ${id} not found.`);
      return res.status(404).json({ success: false, message: 'Guest record not found' });
    }

    // Resolve authenticated editor from MongoDB users collection
    let updatedBy = {
      name: req.user?.name || 'Staff User',
      email: req.user?.email || 'staff@lumossolution.com',
      role: req.user?.role || 'employee'
    };

    if (req.user?.id) {
      const dbUser = await User.findById(req.user.id).select('name email role');
      if (dbUser) {
        updatedBy = {
          userId: dbUser._id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role
        };
      }
    }

    const { guest, relationship, interests, followUp, feedback, remarks } = req.body;

    // Calculate field-level diffs
    const changes = calculateGuestDiff(existingGuest, {
      guest,
      relationship,
      interests,
      followUp,
      feedback
    });

    const updates = {};
    if (guest) updates.guest = guest;
    if (relationship !== undefined) updates.relationship = relationship;
    if (interests !== undefined) updates.interests = interests;
    if (followUp !== undefined) updates.followUp = followUp;
    if (feedback !== undefined) updates.feedback = feedback;
    updates.updatedBy = updatedBy;
    updates.updatedAt = Date.now();

    const updated = await Guest.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('createdBy.userId', 'name email role department')
      .populate('updatedBy.userId', 'name email role department');

    // If changes occurred, create audit log entry
    if (changes.length > 0) {
      try {
        await GuestAuditLog.create({
          recordId: id,
          collectionName: 'lumos_event',
          action: 'UPDATE',
          changedBy: updatedBy,
          changes,
          remarks: remarks || 'Updated via Guest Profile'
        });
      } catch (logErr) {
        logger.error('CREATE AUDIT LOG ERROR', logErr.message, logErr);
      }
    }

    logger.success('GUEST UPDATED', `Guest ID ${id} (${updated.guest?.name}) updated by ${updatedBy.email}`, {
      changesCount: changes.length
    });

    res.json({
      success: true,
      message: 'Guest updated successfully',
      guest: updated,
      changesCount: changes.length
    });
  } catch (error) {
    logger.error('GUEST UPDATE ERROR', error.message, error);
    res.status(500).json({ success: false, message: 'Failed to update guest', error: error.message });
  }
};

// Fetch audit history for a guest
exports.getGuestAuditLogs = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid guest record ID' });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { recordId: id };
    if (req.query.action && req.query.action !== 'ALL') {
      query.action = req.query.action.toUpperCase();
    }
    if (req.query.user) {
      query.$or = [
        { 'changedBy.name': { $regex: req.query.user, $options: 'i' } },
        { 'changedBy.email': { $regex: req.query.user, $options: 'i' } }
      ];
    }
    if (req.query.startDate || req.query.endDate) {
      query.changedAt = {};
      if (req.query.startDate) query.changedAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.changedAt.$lte = new Date(req.query.endDate);
    }

    const [logs, total] = await Promise.all([
      GuestAuditLog.find(query).sort({ changedAt: -1 }).skip(skip).limit(limit),
      GuestAuditLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (error) {
    logger.error('FETCH AUDIT LOGS ERROR', error.message, error);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs', error: error.message });
  }
};

// Fetch business activities for a guest
exports.getGuestActivities = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid guest record ID' });
    }

    let activities = await GuestActivity.find({ guestId: id }).sort({ activityDate: -1, createdAt: -1 });

    // If no activities yet, automatically seed initial registration/visit activity into MongoDB
    if (activities.length === 0) {
      const guest = await Guest.findById(id);
      if (guest) {
        try {
          const initialActivity = await GuestActivity.create({
            guestId: guest._id,
            activityType: 'Guest Visit',
            title: 'Guest visited the showroom',
            description: `Guest registered for the Lumos event. Preferred follow-up: ${guest.followUp?.preferredMethod || 'Phone'}.`,
            activityDate: guest.createdAt || new Date(),
            createdBy: {
              userId: guest.createdBy?.userId || null,
              name: guest.createdBy?.name || 'Staff User',
              email: guest.createdBy?.email || 'staff@lumossolution.com',
              role: guest.createdBy?.role || 'admin'
            }
          });
          activities = [initialActivity];
        } catch (seedErr) {
          logger.warn('Could not seed initial guest activity:', seedErr.message);
        }
      }
    }

    res.json({ success: true, activities, total: activities.length });
  } catch (error) {
    logger.error('FETCH ACTIVITIES ERROR', error.message, error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities', error: error.message });
  }
};

// Create a business activity for a guest
exports.createGuestActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { activityType, title, description, activityDate } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid guest record ID' });
    }
    if (!activityType || !title) {
      return res.status(400).json({ success: false, message: 'Activity type and title are required' });
    }

    let creator = {
      name: req.user?.name || 'Staff User',
      email: req.user?.email || 'staff@lumossolution.com',
      role: req.user?.role || 'employee'
    };

    if (req.user?.id) {
      const dbUser = await User.findById(req.user.id).select('name email role');
      if (dbUser) {
        creator = {
          userId: dbUser._id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role
        };
      }
    }

    const activity = new GuestActivity({
      guestId: id,
      activityType,
      title: title.trim(),
      description: description ? description.trim() : '',
      activityDate: activityDate ? new Date(activityDate) : new Date(),
      createdBy: creator
    });

    const savedActivity = await activity.save();
    logger.success('GUEST ACTIVITY LOGGED', `New activity '${activityType}: ${title}' recorded for guest ID ${id} by ${creator.name}`);

    res.status(201).json({
      success: true,
      message: 'Activity recorded successfully',
      activity: savedActivity
    });
  } catch (error) {
    logger.error('CREATE ACTIVITY ERROR', error.message, error);
    res.status(500).json({ success: false, message: 'Failed to record activity', error: error.message });
  }
};

// Delete single guest (Admin only)
exports.deleteGuest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      logger.warn('GUEST DELETE IGNORED', `Invalid or non-existent guest ID format: ${id}`);
      return res.status(200).json({ success: true, message: 'Invalid or already removed guest record', id });
    }

    const deleted = await Guest.findByIdAndDelete(id);

    if (!deleted) {
      logger.warn('GUEST DELETE NOT FOUND', `Guest ID ${id} not found in database or already deleted.`);
      return res.status(200).json({ success: true, message: 'Guest record already removed or not found', id });
    }

    // Also log DELETE action in audit log
    try {
      await GuestAuditLog.create({
        recordId: id,
        collectionName: 'lumos_event',
        action: 'DELETE',
        changedBy: {
          userId: req.user?.id || null,
          name: req.user?.name || 'Admin',
          email: req.user?.email || 'admin@lumossolution.com',
          role: req.user?.role || 'admin'
        },
        changes: [],
        remarks: `Guest record (${deleted.guest?.name}) deleted by admin`
      });
    } catch (auditErr) {
      // ignore
    }

    logger.success('GUEST DELETED', `Guest ID ${id} (${deleted.guest?.name}) deleted by admin ${req.user?.email || 'admin'}`);
    res.json({ success: true, message: 'Guest record deleted successfully', id });
  } catch (error) {
    logger.error('GUEST DELETE ERROR', error.message, error);
    res.status(500).json({ success: false, message: 'Failed to delete guest', error: error.message });
  }
};

// Batch delete guests (Admin only)
exports.deleteBatchGuests = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of record IDs required for batch deletion' });
    }

    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No matching guest records found to delete',
        deletedCount: 0
      });
    }

    const result = await Guest.deleteMany({ _id: { $in: validIds } });
    logger.success('BATCH GUEST DELETION', `Deleted ${result.deletedCount} guest record(s) by admin ${req.user?.email || 'admin'}`, {
      deletedCount: result.deletedCount,
      ids: validIds
    });
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} guest record(s)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error('BATCH GUEST DELETE ERROR', error.message, error);
    res.status(500).json({ success: false, message: 'Failed to batch delete guests', error: error.message });
  }
};
