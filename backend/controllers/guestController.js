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
      staffRating,
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
        staffRating: Number(staffRating) || 0,
        feedbackType: 'staff-rating',
        'feedback-type': 'staff-rating',
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

// Fetch all guests with server-side indexed filters and pagination
exports.getAllGuests = async (req, res) => {
  try {
    // User-wise record isolation: employees see only their own created records; admins see all
    let filter = {};
    if (req.user && req.user.role === 'employee') {
      const userObjId = mongoose.Types.ObjectId.isValid(req.user.id)
        ? new mongoose.Types.ObjectId(req.user.id)
        : req.user.id;
      filter = {
        $or: [
          { 'createdBy.userId': userObjId },
          { 'createdBy.email': req.user.email }
        ]
      };
    }

    // 1. Server-side indexed relationship filter
    if (req.query.relationship) {
      const rels = req.query.relationship.split(',').map((r) => r.trim()).filter(Boolean);
      if (rels.length === 1) {
        filter.relationship = rels[0];
      } else if (rels.length > 1) {
        filter.relationship = { $in: rels };
      }
    }

    // 2. Server-side indexed interests filter (multikey index)
    if (req.query.interest) {
      const ints = req.query.interest.split(',').map((i) => i.trim()).filter(Boolean);
      if (ints.length === 1) {
        filter.interests = ints[0];
      } else if (ints.length > 1) {
        filter.interests = { $in: ints };
      }
    }

    // 3. Optional search query filter
    if (req.query.search && req.query.search.trim()) {
      const s = req.query.search.trim();
      const searchConditions = [
        { 'guest.name': { $regex: s, $options: 'i' } },
        { 'guest.phone': { $regex: s, $options: 'i' } },
        { 'guest.email': { $regex: s, $options: 'i' } },
        { 'guest.company': { $regex: s, $options: 'i' } }
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    // Pagination configuration
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const isPaginated = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;

    let query = Guest.find(filter)
      .populate('createdBy.userId', 'name email role department')
      .populate('updatedBy.userId', 'name email role department')
      .sort({ createdAt: -1 })
      .lean(); // Crucial: .lean() avoids instantiating Mongoose documents, saving massive memory!

    if (isPaginated) {
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const [guests, total] = await Promise.all([
      query.exec(),
      Guest.countDocuments(filter)
    ]);

    logger.info('FETCH GUESTS', `Retrieved ${guests.length} of ${total} record(s) for role: ${req.user?.role || 'admin'}`);
    res.json({
      guests,
      total,
      page: isPaginated ? page : 1,
      totalPages: isPaginated ? Math.ceil(total / limit) : 1
    });
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

    // Role-based isolation check for employees
    if (req.user && req.user.role === 'employee') {
      const creatorUserId = guest.createdBy?.userId?._id?.toString() || guest.createdBy?.userId?.toString();
      const creatorEmail = guest.createdBy?.email?.toLowerCase();
      const isOwner = creatorUserId === req.user.id || (creatorEmail && creatorEmail === req.user.email?.toLowerCase());
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only view records you created.' });
      }
    }

    let [totalChanges, totalActivities] = await Promise.all([
      GuestAuditLog.countDocuments({ recordId: id }),
      GuestActivity.countDocuments({
        guestId: id,
        title: { $nin: ['Guest visited the showroom', 'Guest visited the event'] }
      })
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
            name: guest.createdBy?.name || 'Staff User',
            email: guest.createdBy?.email || 'staff@lumossolution.com',
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

// High-performance guest statistics and aggregates for 500,000+ records via MongoDB $facet pipeline
exports.getGuestStats = async (req, res) => {
  try {
    let matchStage = {};
    if (req.user && req.user.role === 'employee') {
      const userObjId = mongoose.Types.ObjectId.isValid(req.user.id)
        ? new mongoose.Types.ObjectId(req.user.id)
        : req.user.id;
      matchStage = {
        $or: [
          { 'createdBy.userId': userObjId },
          { 'createdBy.email': req.user.email }
        ]
      };
    }

    const facetPipeline = [
      { $match: matchStage },
      {
        $facet: {
          metrics: [
            {
              $group: {
                _id: null,
                totalGuests: { $sum: 1 },
                followUpRequired: {
                  $sum: { $cond: [{ $eq: ['$followUp.required', true] }, 1, 0] }
                },
                avgRating: {
                  $avg: {
                    $cond: [{ $gt: ['$feedback.rating', 0] }, '$feedback.rating', null]
                  }
                },
                ratedCount: {
                  $sum: { $cond: [{ $gt: ['$feedback.rating', 0] }, 1, 0] }
                }
              }
            }
          ],
          recentGuests: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 1,
                'guest.name': 1,
                'guest.phone': 1,
                relationship: 1,
                'feedback.rating': 1,
                'followUp.required': 1,
                createdAt: 1
              }
            }
          ],
          interestsAggregation: [
            { $unwind: { path: '$interests', preserveNullAndEmptyArrays: false } },
            {
              $group: {
                _id: '$interests',
                count: { $sum: 1 }
              }
            }
          ],
          relationshipsAggregation: [
            {
              $group: {
                _id: '$relationship',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ];

    const result = await Guest.aggregate(facetPipeline);
    const facetData = result[0] || {};
    const metricData = facetData.metrics?.[0] || {
      totalGuests: 0,
      followUpRequired: 0,
      avgRating: 5.0,
      ratedCount: 0
    };

    const totalGuests = metricData.totalGuests || 0;
    const avgRating = metricData.avgRating ? Number(metricData.avgRating).toFixed(1) : '5.0';

    // 1. Format Interests Breakdown
    const rawInterests = {};
    (facetData.interestsAggregation || []).forEach((item) => {
      if (item._id) rawInterests[item._id] = item.count;
    });

    const categoryInterests = [
      {
        key: 'home-automation',
        label: 'Home Automation',
        count: Object.entries(rawInterests)
          .filter(([k]) => k.toLowerCase().includes('home automation'))
          .reduce((sum, [, c]) => sum + c, 0)
      },
      {
        key: 'lighting-dimming',
        label: 'Lighting & Dimming',
        count: Object.entries(rawInterests)
          .filter(([k]) => k.toLowerCase().includes('lighting') || k.toLowerCase().includes('dimming'))
          .reduce((sum, [, c]) => sum + c, 0)
      },
      {
        key: 'audio-visuals',
        label: 'Audio & Visuals',
        count: Object.entries(rawInterests)
          .filter(([k]) => k.toLowerCase().includes('audio') || k.toLowerCase().includes('visual') || k.toLowerCase().includes('theater'))
          .reduce((sum, [, c]) => sum + c, 0)
      },
      {
        key: 'security',
        label: 'Security',
        count: Object.entries(rawInterests)
          .filter(([k]) => k.toLowerCase().includes('security'))
          .reduce((sum, [, c]) => sum + c, 0)
      }
    ].map((cat) => ({
      ...cat,
      percentage: totalGuests > 0 ? Math.round((cat.count / totalGuests) * 100) : 0
    }));

    // 2. Format Relationships Breakdown
    const rawRelationships = {};
    (facetData.relationshipsAggregation || []).forEach((item) => {
      if (item._id) rawRelationships[item._id] = item.count;
    });

    const categoryRelationships = [
      {
        key: 'existing',
        label: 'Existing Customers',
        color: '#31747d',
        count: Object.entries(rawRelationships)
          .filter(([k]) => k.toLowerCase().includes('existing'))
          .reduce((sum, [, c]) => sum + c, 0)
      },
      {
        key: 'potential',
        label: 'Potential Customers',
        color: '#059669',
        count: Object.entries(rawRelationships)
          .filter(([k]) => k.toLowerCase().includes('potential'))
          .reduce((sum, [, c]) => sum + c, 0)
      },
      {
        key: 'builders',
        label: 'Builders / Developers',
        color: '#6366f1',
        count: Object.entries(rawRelationships)
          .filter(([k]) => k.toLowerCase().includes('builder') || k.toLowerCase().includes('developer'))
          .reduce((sum, [, c]) => sum + c, 0)
      },
      {
        key: 'designers',
        label: 'Interior Designers',
        color: '#f59e0b',
        count: Object.entries(rawRelationships)
          .filter(([k]) => k.toLowerCase().includes('designer') || k.toLowerCase().includes('architect'))
          .reduce((sum, [, c]) => sum + c, 0)
      }
    ];

    const categorizedCount = categoryRelationships.reduce((sum, r) => sum + r.count, 0);
    const otherCount = Math.max(0, totalGuests - categorizedCount);

    if (otherCount > 0 || totalGuests === 0) {
      categoryRelationships.push({
        key: 'other',
        label: 'Other Categories',
        color: '#94a3b8',
        count: otherCount
      });
    }

    const finalRelationships = categoryRelationships.map((item) => ({
      ...item,
      percentage: totalGuests > 0 ? Math.round((item.count / totalGuests) * 100) : 0
    }));

    res.json({
      totalGuests,
      followUpRequired: metricData.followUpRequired || 0,
      averageRating: avgRating,
      ratedGuests: metricData.ratedCount || 0,
      recentGuests: facetData.recentGuests || [],
      interests: categoryInterests,
      relationships: finalRelationships
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

    // Role-based isolation check for employees
    if (req.user && req.user.role === 'employee') {
      const creatorUserId = existingGuest.createdBy?.userId?._id?.toString() || existingGuest.createdBy?.userId?.toString();
      const creatorEmail = existingGuest.createdBy?.email?.toLowerCase();
      const isOwner = creatorUserId === req.user.id || (creatorEmail && creatorEmail === req.user.email?.toLowerCase());
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only update records you created.' });
      }
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
    if (feedback !== undefined) {
      const existingFb = existingGuest.feedback?.toObject?.() || existingGuest.feedback || {};
      updates.feedback = {
        ...existingFb,
        ...feedback,
        rating: feedback.rating !== undefined ? Number(feedback.rating) : (existingFb.rating || 0),
        staffRating: feedback.staffRating !== undefined ? Number(feedback.staffRating) : (existingFb.staffRating || 0),
        feedbackType: feedback.feedbackType || feedback['feedback-type'] || existingFb.feedbackType || 'staff-rating',
        'feedback-type': feedback['feedback-type'] || feedback.feedbackType || existingFb['feedback-type'] || 'staff-rating'
      };
    }
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

    // Return only actual user-logged activities (excluding auto-seeded visit text)
    const activities = await GuestActivity.find({
      guestId: id,
      title: { $nin: ['Guest visited the showroom', 'Guest visited the event'] }
    }).sort({ activityDate: -1, createdAt: -1 });

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

// Dedicated method to update staff rating in MongoDB lumos_event collection
exports.updateStaffRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffRating, remarks } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid guest record ID format' });
    }

    const existingGuest = await Guest.findById(id);
    if (!existingGuest) {
      return res.status(404).json({ success: false, message: 'Guest record not found' });
    }

    // Role-based isolation check for employees
    if (req.user && req.user.role === 'employee') {
      const creatorUserId = existingGuest.createdBy?.userId?._id?.toString() || existingGuest.createdBy?.userId?.toString();
      const creatorEmail = existingGuest.createdBy?.email?.toLowerCase();
      const isOwner = creatorUserId === req.user.id || (creatorEmail && creatorEmail === req.user.email?.toLowerCase());
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only update records you created.' });
      }
    }

    // Resolve authenticated editor
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

    const numericStaffRating = Math.max(1, Math.min(5, Number(staffRating) || 0));

    const updated = await Guest.findByIdAndUpdate(
      id,
      {
        $set: {
          'feedback.staffRating': numericStaffRating,
          'feedback.feedbackType': 'staff-rating',
          'feedback.feedback-type': 'staff-rating',
          updatedBy,
          updatedAt: Date.now()
        }
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy.userId', 'name email role department')
      .populate('updatedBy.userId', 'name email role department');

    // Create audit log entry for staff rating
    try {
      await GuestAuditLog.create({
        recordId: id,
        collectionName: 'lumos_event',
        action: 'UPDATE',
        changedBy: updatedBy,
        changes: [
          {
            field: 'feedback.staffRating',
            from: existingGuest.feedback?.staffRating || 0,
            to: numericStaffRating
          }
        ],
        remarks: remarks || `Staff rating updated to ${numericStaffRating} stars`
      });
    } catch (auditErr) {
      logger.error('CREATE AUDIT LOG ERROR', auditErr.message, auditErr);
    }

    logger.success('STAFF RATING UPDATED', `Guest ID ${id} staff rating set to ${numericStaffRating} by ${updatedBy.email}`);

    res.json({
      success: true,
      message: 'Staff rating saved successfully into MongoDB lumos_event',
      guest: updated
    });
  } catch (error) {
    logger.error('STAFF RATING UPDATE ERROR', error.message, error);
    res.status(500).json({ success: false, message: 'Failed to update staff rating', error: error.message });
  }
};

// GET /api/guests/export
// Export guest records to Excel (.xlsx) or PDF (.pdf) with role-based security
exports.exportGuests = async (req, res) => {
  try {
    const { format = 'xlsx', from, to } = req.query;

    let filter = {};

    // Role-based security check:
    // Employees can only export records created by their own account
    // Admins can export all guest records
    if (req.user && req.user.role === 'employee') {
      const userObjId = mongoose.Types.ObjectId.isValid(req.user.id)
        ? new mongoose.Types.ObjectId(req.user.id)
        : req.user.id;
      filter = {
        $or: [
          { 'createdBy.userId': userObjId },
          { 'createdBy.email': req.user.email }
        ]
      };
    }

    // Apply date range filters
    if (from || to) {
      filter.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    // Fetch records from lumos_event collection
    const records = await Guest.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Calculate dynamic summary metrics
    const totalRecords = records.length;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todayRecords = records.filter((r) => {
      const created = r.createdAt ? new Date(r.createdAt) : null;
      return created && created >= startOfToday && created <= endOfToday;
    }).length;

    const formatDateStr = (dStr) => {
      if (!dStr) return '';
      const d = new Date(dStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    let dateRange = 'All Dates';
    if (from && to) {
      dateRange = `${formatDateStr(from)} – ${formatDateStr(to)}`;
    } else if (from) {
      dateRange = `From ${formatDateStr(from)}`;
    } else if (to) {
      dateRange = `Up to ${formatDateStr(to)}`;
    }

    const summary = {
      totalRecords,
      todayRecords,
      dateRange
    };

    const timeStampStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

    if (String(format).toLowerCase() === 'pdf') {
      const { generateGuestPDF } = require('../services/guestExportService');
      const pdfBuffer = await generateGuestPDF({ records, summary });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Lumos_Guest_Report_${timeStampStr}.pdf"`);
      return res.send(pdfBuffer);
    } else {
      const { generateGuestExcel } = require('../services/guestExportService');
      const excelBuffer = await generateGuestExcel({ records, summary });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="Lumos_Guest_Report_${timeStampStr}.xlsx"`);
      return res.send(excelBuffer);
    }
  } catch (error) {
    logger.error('GUEST EXPORT ERROR', error.message, error);
    res.status(500).json({ success: false, message: 'Failed to export guest records', error: error.message });
  }
};
