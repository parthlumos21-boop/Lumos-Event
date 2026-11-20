const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const AppointmentAuditLog = require('../models/AppointmentAuditLog');
const AppointmentActivity = require('../models/AppointmentActivity');
const User = require('../models/User');
const logger = require('../utils/logger');

const APPOINTMENT_FIELD_LABELS = {
  clientName: 'Client Name',
  location: 'Location / Site',
  contact: 'Contact Number',
  reference: 'Reference',
  referenceName: 'Reference Name',
  internalReference: 'Internal Reference',
  status: 'Appointment Status',
  appointmentDate: 'Appointment Date',
  appointmentTime: 'Appointment Time',
  requirements: 'Client Requirements',
  remark: 'Meeting Remarks'
};

const calculateAppointmentDiff = (oldDoc, newDoc) => {
  const changes = [];
  const fields = Object.keys(APPOINTMENT_FIELD_LABELS);

  for (const field of fields) {
    if (newDoc[field] === undefined) continue;

    let oldVal = oldDoc[field];
    let newVal = newDoc[field];

    if (field === 'appointmentDate') {
      const oldD = oldVal ? new Date(oldVal).toISOString().split('T')[0] : '';
      const newD = newVal ? new Date(newVal).toISOString().split('T')[0] : '';
      if (oldD !== newD) {
        changes.push({
          field,
          fieldLabel: APPOINTMENT_FIELD_LABELS[field],
          oldValue: oldD || '-',
          newValue: newD || '-'
        });
      }
      continue;
    }

    oldVal = oldVal !== undefined && oldVal !== null ? String(oldVal).trim() : '';
    newVal = newVal !== undefined && newVal !== null ? String(newVal).trim() : '';

    if (oldVal !== newVal) {
      changes.push({
        field,
        fieldLabel: APPOINTMENT_FIELD_LABELS[field],
        oldValue: oldVal || '-',
        newValue: newVal || '-'
      });
    }
  }

  return changes;
};

// Generate next sequential Sr. No (e.g. APT-1001)
const generateNextSrNo = async () => {
  const lastRecord = await Appointment.findOne().sort({ createdAt: -1 }).select('srNo');
  let nextNum = 1001;
  if (lastRecord && lastRecord.srNo) {
    const match = lastRecord.srNo.match(/\d+/);
    if (match) {
      nextNum = parseInt(match[0], 10) + 1;
    }
  }
  return `APT-${nextNum}`;
};

// GET /api/appointments/next-sr-no
exports.getNextSrNo = async (req, res) => {
  try {
    const nextSrNo = await generateNextSrNo();
    res.json({ success: true, srNo: nextSrNo });
  } catch (error) {
    logger.error('Error fetching next Sr No:', error);
    res.status(500).json({ success: false, message: 'Failed to generate next Sr No' });
  }
};

// GET /api/appointments/reference-users (Available to authenticated staff & admin)
exports.getReferenceUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['admin', 'employee'] } })
      .select('name email role username')
      .sort({ name: 1 })
      .lean();
    res.json({ success: true, users });
  } catch (error) {
    logger.error('Error fetching reference users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reference users' });
  }
};

// POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const {
      clientName,
      location,
      contact,
      reference,
      referenceName,
      internalReference,
      requirements,
      appointmentDate,
      appointmentTime,
      remark,
      status
    } = req.body;

    if (!clientName || !clientName.trim()) {
      return res.status(400).json({ success: false, message: 'Client name is required' });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ success: false, message: 'Location is required' });
    }
    if (!contact || !contact.trim()) {
      return res.status(400).json({ success: false, message: 'Contact number is required' });
    }
    if (!appointmentDate) {
      return res.status(400).json({ success: false, message: 'Appointment date is required' });
    }
    if (!appointmentTime) {
      return res.status(400).json({ success: false, message: 'Appointment time is required' });
    }

    // Auto-generate Sr. No
    const srNo = await generateNextSrNo();

    // Resolve creator from req.user
    let createdBy = {
      name: 'Staff',
      email: 'staff@lumossolution.com',
      role: 'employee'
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
          email: req.user.email,
          role: req.user.role || 'employee'
        };
      }
    }

    // Normalize reference fields
    const chosenRef = reference || 'Direct Client';
    const cleanRefName = chosenRef !== 'Direct Client' && referenceName ? referenceName.trim() : '';
    const cleanInternalRef = internalReference ? internalReference.trim() : '';

    const initialLogActivity = {
      activityType: 'Meeting Scheduled',
      titleSummary: 'Appointment meeting scheduled',
      activityDateTime: new Date(appointmentDate) || new Date(),
      detailedNotes: `Scheduled meeting with ${clientName.trim()} for ${appointmentTime.trim()} on ${new Date(appointmentDate).toLocaleDateString('en-GB')}. Reference: ${cleanRefName ? `${chosenRef} (${cleanRefName})` : chosenRef}. Internal Reference: ${cleanInternalRef || 'None'}.`,
      createdByLog: {
        userId: createdBy.userId || null,
        name: createdBy.name || 'Staff User',
        email: createdBy.email || 'staff@lumossolution.com',
        role: createdBy.role || 'employee'
      },
      createdAt: new Date()
    };

    const newAppointment = new Appointment({
      srNo,
      clientName: clientName.trim(),
      location: location.trim(),
      contact: contact.trim(),
      reference: chosenRef,
      referenceName: cleanRefName,
      internalReference: cleanInternalRef,
      requirements: requirements ? requirements.trim() : '',
      appointmentDate: new Date(appointmentDate),
      appointmentTime: appointmentTime.trim(),
      remark: remark ? remark.trim() : '',
      status: status || 'Scheduled',
      createdBy,
      logactivity: [initialLogActivity]
    });

    const saved = await newAppointment.save();
    logger.info('APPOINTMENT CREATED', `Created appointment ${saved.srNo} for ${saved.clientName}`);

    // Create initial CREATE audit log
    try {
      await AppointmentAuditLog.create({
        recordId: saved._id,
        collectionName: 'lumos_appointments',
        action: 'CREATE',
        changedBy: {
          userId: createdBy.userId || null,
          name: createdBy.name || 'Staff User',
          email: createdBy.email || 'staff@lumossolution.com',
          role: createdBy.role || 'employee'
        },
        changedAt: new Date(),
        changes: [
          { field: 'clientName', fieldLabel: 'Client Name', oldValue: '-', newValue: saved.clientName },
          { field: 'srNo', fieldLabel: 'Sr. No.', oldValue: '-', newValue: saved.srNo },
          { field: 'status', fieldLabel: 'Status', oldValue: '-', newValue: saved.status }
        ],
        remarks: 'Initial appointment booking created'
      });
    } catch (auditErr) {
      logger.error('Error creating initial appointment audit log:', auditErr);
    }

    // Seed initial business activity
    try {
      await AppointmentActivity.create({
        appointmentId: saved._id,
        activityType: 'Meeting Scheduled',
        title: 'Appointment meeting scheduled',
        description: `Scheduled meeting with ${saved.clientName} for ${saved.appointmentTime} on ${new Date(saved.appointmentDate).toLocaleDateString('en-GB')}. Reference: ${saved.referenceName ? `${saved.reference} (${saved.referenceName})` : saved.reference}.`,
        activityDate: saved.appointmentDate || new Date(),
        createdBy: {
          userId: createdBy.userId || null,
          name: createdBy.name || 'Staff User',
          email: createdBy.email || 'staff@lumossolution.com',
          role: createdBy.role || 'employee'
        }
      });
    } catch (actErr) {
      logger.error('Error creating initial appointment activity:', actErr);
    }

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully',
      appointment: saved
    });
  } catch (error) {
    logger.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create appointment'
    });
  }
};

// GET /api/appointments
exports.getAppointments = async (req, res) => {
  try {
    const {
      q,
      date,
      from,
      to,
      status,
      reference,
      page = 1,
      limit = 100
    } = req.query;

    const filter = {};

    // Keyword search
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { srNo: searchRegex },
        { clientName: searchRegex },
        { location: searchRegex },
        { contact: searchRegex },
        { reference: searchRegex },
        { referenceName: searchRegex },
        { internalReference: searchRegex },
        { requirements: searchRegex }
      ];
    }

    // Role-based user record isolation: employees see only their own created or assigned records; admins see all
    if (req.user && req.user.role === 'employee') {
      const userObjId = mongoose.Types.ObjectId.isValid(req.user.id)
        ? new mongoose.Types.ObjectId(req.user.id)
        : req.user.id;
      const isolationFilter = {
        $or: [
          { 'createdBy.userId': userObjId },
          { 'createdBy.userId': req.user.id },
          { 'createdBy.email': req.user.email?.toLowerCase() },
          { assignedTo: userObjId },
          { assignedTo: req.user.id }
        ]
      };
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, isolationFilter];
        delete filter.$or;
      } else {
        Object.assign(filter, isolationFilter);
      }
    }

    // Single Date filter
    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      filter.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (from || to) {
      filter.appointmentDate = {};
      if (from) {
        filter.appointmentDate.$gte = new Date(new Date(from).setHours(0, 0, 0, 0));
      }
      if (to) {
        filter.appointmentDate.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
      }
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (reference && reference !== 'All') {
      filter.reference = reference;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .sort({ appointmentDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Appointment.countDocuments(filter)
    ]);

    res.json({
      success: true,
      appointments,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    logger.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
};

// GET /api/appointments/:id
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).lean();
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role-based isolation check for employees
    if (req.user && req.user.role === 'employee') {
      const creatorUserId = appointment.createdBy?.userId?._id?.toString() || appointment.createdBy?.userId?.toString();
      const creatorEmail = appointment.createdBy?.email?.toLowerCase();
      const assignedUserId = appointment.assignedTo?._id?.toString() || appointment.assignedTo?.toString();
      const isOwner = creatorUserId === req.user.id ||
        (creatorEmail && creatorEmail === req.user.email?.toLowerCase()) ||
        assignedUserId === req.user.id;
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only view appointments assigned to or created by you.' });
      }
    }

    let totalChanges = await AppointmentAuditLog.countDocuments({ recordId: id });

    // Ensure initial real records exist in MongoDB if record had none
    if (totalChanges === 0) {
      try {
        await AppointmentAuditLog.create({
          recordId: appointment._id,
          collectionName: 'lumos_appointments',
          action: 'CREATE',
          changedBy: {
            userId: appointment.createdBy?.userId?._id || appointment.createdBy?.userId || null,
            name: appointment.createdBy?.name || 'Staff User',
            email: appointment.createdBy?.email || 'staff@lumossolution.com',
            role: appointment.createdBy?.role || 'employee'
          },
          changedAt: appointment.createdAt || new Date(),
          changes: [
            { field: 'clientName', fieldLabel: 'Client Name', oldValue: '-', newValue: appointment.clientName },
            { field: 'srNo', fieldLabel: 'Sr. No.', oldValue: '-', newValue: appointment.srNo },
            { field: 'status', fieldLabel: 'Status', oldValue: '-', newValue: appointment.status }
          ],
          remarks: 'Initial appointment booking created'
        });
        totalChanges = 1;
      } catch (err) {
        logger.error('Error seeding initial appointment audit log:', err);
      }
    }

    // Seed and sort embedded logactivity array in lumos_appointments collection
    if (!appointment.logactivity || appointment.logactivity.length === 0) {
      const initialLog = {
        activityType: 'Meeting Scheduled',
        titleSummary: 'Appointment meeting scheduled',
        activityDateTime: appointment.appointmentDate || appointment.createdAt || new Date(),
        detailedNotes: `Scheduled meeting with ${appointment.clientName} for ${appointment.appointmentTime} on ${new Date(appointment.appointmentDate).toLocaleDateString('en-GB')}. Reference: ${appointment.referenceName ? `${appointment.reference} (${appointment.referenceName})` : (appointment.reference || 'Direct Client')}. Internal Reference: ${appointment.internalReference || 'None'}.`,
        createdByLog: {
          userId: appointment.createdBy?.userId?._id || appointment.createdBy?.userId || null,
          name: appointment.createdBy?.name || 'Staff User',
          email: appointment.createdBy?.email || 'staff@lumossolution.com',
          role: appointment.createdBy?.role || 'employee'
        },
        createdAt: appointment.createdAt || new Date()
      };
      try {
        await Appointment.findByIdAndUpdate(appointment._id, {
          $push: { logactivity: initialLog }
        });
        appointment.logactivity = [initialLog];
      } catch (logErr) {
        logger.error('Error seeding initial logactivity on appointment:', logErr);
      }
    }

    if (appointment.logactivity && appointment.logactivity.length > 0) {
      appointment.logactivity.sort((a, b) => new Date(b.activityDateTime || b.createdAt) - new Date(a.activityDateTime || a.createdAt));
    }

    const totalActivities = appointment.logactivity?.length || 0;

    // Fetch recent 5 audit logs and activities for Overview cards
    const recentAuditLogs = await AppointmentAuditLog.find({ recordId: id }).sort({ changedAt: -1 }).limit(5).lean();

    const recentActivities = (appointment.logactivity || []).slice(0, 5).map((act) => ({
      _id: act._id,
      activityType: act.activityType,
      title: act.titleSummary || act.title,
      titleSummary: act.titleSummary || act.title,
      description: act.detailedNotes || act.description,
      detailedNotes: act.detailedNotes || act.description,
      activityDate: act.activityDateTime || act.activityDate || act.createdAt,
      activityDateTime: act.activityDateTime || act.activityDate || act.createdAt,
      createdBy: act.createdByLog || act.createdBy,
      createdByLog: act.createdByLog || act.createdBy,
      createdAt: act.createdAt
    }));

    res.json({
      success: true,
      appointment,
      stats: { totalChanges, totalActivities },
      recentAuditLogs,
      recentActivities
    });
  } catch (error) {
    logger.error('Error fetching appointment by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointment details' });
  }
};

// PUT /api/appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Appointment.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role-based isolation check for employees
    if (req.user && req.user.role === 'employee') {
      const creatorUserId = existing.createdBy?.userId?._id?.toString() || existing.createdBy?.userId?.toString();
      const creatorEmail = existing.createdBy?.email?.toLowerCase();
      const assignedUserId = existing.assignedTo?._id?.toString() || existing.assignedTo?.toString();
      const isOwner = creatorUserId === req.user.id ||
        (creatorEmail && creatorEmail === req.user.email?.toLowerCase()) ||
        assignedUserId === req.user.id;
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only update appointments assigned to or created by you.' });
      }
    }

    const updateData = { ...req.body };

    // Resolve modifier from req.user
    let updatedBy = {
      name: 'Staff User',
      email: 'staff@lumossolution.com',
      role: 'employee'
    };
    if (req.user?.id) {
      updatedBy = {
        userId: req.user.id,
        name: req.user.name || 'Staff User',
        email: req.user.email,
        role: req.user.role || 'employee'
      };
      updateData.updatedBy = updatedBy;
    }

    // Normalize reference fields if passed
    if (updateData.reference === 'Direct Client') {
      updateData.referenceName = '';
    }

    if (updateData.appointmentDate) {
      updateData.appointmentDate = new Date(updateData.appointmentDate);
    }

    // Calculate audit diff
    const changes = calculateAppointmentDiff(existing.toObject(), updateData);

    const updated = await Appointment.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    // Record audit log if changes were made
    if (changes.length > 0) {
      try {
        await AppointmentAuditLog.create({
          recordId: id,
          collectionName: 'lumos_appointments',
          action: 'UPDATE',
          changedBy: updatedBy,
          changedAt: new Date(),
          changes,
          remarks: req.body.remarks || 'Inline updated via Appointment Profile'
        });
      } catch (auditErr) {
        logger.error('Error writing appointment audit log:', auditErr);
      }
    }

    // Count updated stats
    const [totalChanges, totalActivities] = await Promise.all([
      AppointmentAuditLog.countDocuments({ recordId: id }),
      AppointmentActivity.countDocuments({ appointmentId: id })
    ]);

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updated,
      stats: { totalChanges, totalActivities }
    });
  } catch (error) {
    logger.error('Error updating appointment:', error);
    res.status(500).json({ success: false, message: 'Failed to update appointment' });
  }
};

// GET /api/appointments/:id/audit-logs
exports.getAppointmentAuditLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AppointmentAuditLog.find({ recordId: id })
        .sort({ changedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AppointmentAuditLog.countDocuments({ recordId: id })
    ]);

    res.json({
      success: true,
      logs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    logger.error('Error fetching appointment audit logs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
};

// GET /api/appointments/:id/activities
exports.getAppointmentActivities = async (req, res) => {
  try {
    const { id } = req.params;
    let activities = await AppointmentActivity.find({ appointmentId: id })
      .sort({ activityDate: -1, createdAt: -1 })
      .lean();

    if (activities.length === 0) {
      const appointment = await Appointment.findById(id);
      if (appointment) {
        try {
          const seeded = await AppointmentActivity.create({
            appointmentId: appointment._id,
            activityType: 'Meeting Scheduled',
            title: 'Appointment meeting scheduled',
            description: `Scheduled meeting with ${appointment.clientName} for ${appointment.appointmentTime} on ${new Date(appointment.appointmentDate).toLocaleDateString('en-GB')}.`,
            activityDate: appointment.appointmentDate || new Date(),
            createdBy: {
              userId: appointment.createdBy?.userId || null,
              name: appointment.createdBy?.name || 'Staff User',
              email: appointment.createdBy?.email || 'staff@lumossolution.com',
              role: appointment.createdBy?.role || 'employee'
            }
          });
          activities = [seeded.toObject()];
        } catch (seedErr) {
          logger.error('Error seeding initial appointment activity:', seedErr);
        }
      }
    }

    res.json({
      success: true,
      activities,
      total: activities.length
    });
  } catch (error) {
    logger.error('Error fetching appointment activities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointment activities' });
  }
};

// POST /api/appointments/:id/activities
exports.createAppointmentActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { activityType, title, description, activityDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Activity title is required' });
    }

    let creator = {
      name: 'Staff User',
      email: 'staff@lumossolution.com',
      role: 'employee'
    };
    if (req.user?.id) {
      creator = {
        userId: req.user.id,
        name: req.user.name || 'Staff User',
        email: req.user.email,
        role: req.user.role || 'employee'
      };
    }

    const activity = new AppointmentActivity({
      appointmentId: id,
      activityType: activityType || 'Remarks',
      title: title.trim(),
      description: description ? description.trim() : '',
      activityDate: activityDate ? new Date(activityDate) : new Date(),
      createdBy: creator
    });

    const saved = await activity.save();

    res.status(201).json({
      success: true,
      message: 'Business activity logged successfully',
      activity: saved
    });
  } catch (error) {
    logger.error('Error creating appointment activity:', error);
    res.status(500).json({ success: false, message: 'Failed to log business activity' });
  }
};

// DELETE /api/appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Appointment.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role-based isolation check for employees
    if (req.user && req.user.role === 'employee') {
      const creatorUserId = existing.createdBy?.userId?._id?.toString() || existing.createdBy?.userId?.toString();
      const creatorEmail = existing.createdBy?.email?.toLowerCase();
      const isOwner = creatorUserId === req.user.id || (creatorEmail && creatorEmail === req.user.email?.toLowerCase());
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only delete appointments created by you.' });
      }
    }

    await Appointment.findByIdAndDelete(id);
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    logger.error('Error deleting appointment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete appointment' });
  }
};

// DELETE /api/appointments/batch
exports.batchDeleteAppointments = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of appointment IDs is required' });
    }

    let filter = { _id: { $in: ids } };
    if (req.user && req.user.role === 'employee') {
      const userObjId = mongoose.Types.ObjectId.isValid(req.user.id)
        ? new mongoose.Types.ObjectId(req.user.id)
        : req.user.id;
      filter = {
        _id: { $in: ids },
        $or: [
          { 'createdBy.userId': userObjId },
          { 'createdBy.userId': req.user.id },
          { 'createdBy.email': req.user.email?.toLowerCase() }
        ]
      };
    }

    const result = await Appointment.deleteMany(filter);
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} appointment(s)`
    });
  } catch (error) {
    logger.error('Error batch deleting appointments:', error);
    res.status(500).json({ success: false, message: 'Failed to delete selected appointments' });
  }
};

// GET /api/appointments/:appointmentId/logactivity
exports.getLogActivities = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId).select('logactivity createdBy assignedTo clientName appointmentDate appointmentTime reference referenceName internalReference').lean();
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user && req.user.role === 'employee') {
      const creatorUserId = appointment.createdBy?.userId?._id?.toString() || appointment.createdBy?.userId?.toString();
      const creatorEmail = appointment.createdBy?.email?.toLowerCase();
      const assignedUserId = appointment.assignedTo?._id?.toString() || appointment.assignedTo?.toString();
      const isOwner = creatorUserId === req.user.id ||
        (creatorEmail && creatorEmail === req.user.email?.toLowerCase()) ||
        assignedUserId === req.user.id;
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    let activities = appointment.logactivity || [];

    // Auto-seed initial logactivity if array is empty
    if (activities.length === 0) {
      const initialLog = {
        activityType: 'Meeting Scheduled',
        titleSummary: 'Appointment meeting scheduled',
        activityDateTime: appointment.appointmentDate || appointment.createdAt || new Date(),
        detailedNotes: `Scheduled meeting with ${appointment.clientName} for ${appointment.appointmentTime} on ${new Date(appointment.appointmentDate).toLocaleDateString('en-GB')}. Reference: ${appointment.referenceName ? `${appointment.reference} (${appointment.referenceName})` : (appointment.reference || 'Direct Client')}. Internal Reference: ${appointment.internalReference || 'None'}.`,
        createdByLog: {
          userId: appointment.createdBy?.userId?._id || appointment.createdBy?.userId || null,
          name: appointment.createdBy?.name || 'Staff User',
          email: appointment.createdBy?.email || 'staff@lumossolution.com',
          role: appointment.createdBy?.role || 'employee'
        },
        createdAt: appointment.createdAt || new Date()
      };
      await Appointment.findByIdAndUpdate(appointmentId, {
        $push: { logactivity: initialLog }
      });
      activities = [initialLog];
    }

    activities.sort(
      (a, b) => new Date(b.activityDateTime || b.createdAt) - new Date(a.activityDateTime || a.createdAt)
    );

    res.json({
      success: true,
      activities,
      total: activities.length
    });
  } catch (error) {
    logger.error('Error fetching appointment log activities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity logs' });
  }
};

// POST /api/appointments/:appointmentId/logactivity
exports.postLogActivity = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { activityType, titleSummary, title, activityDateTime, activityDate, detailedNotes, description } = req.body;

    const resolvedTitle = (titleSummary || title || '').trim();
    if (!resolvedTitle) {
      return res.status(400).json({ success: false, message: 'Title / Summary is required' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user && req.user.role === 'employee') {
      const creatorUserId = appointment.createdBy?.userId?._id?.toString() || appointment.createdBy?.userId?.toString();
      const creatorEmail = appointment.createdBy?.email?.toLowerCase();
      const assignedUserId = appointment.assignedTo?._id?.toString() || appointment.assignedTo?.toString();
      const isOwner = creatorUserId === req.user.id ||
        (creatorEmail && creatorEmail === req.user.email?.toLowerCase()) ||
        assignedUserId === req.user.id;
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only add updates to your assigned or created appointments.' });
      }
    }

    let createdByLog = {
      name: 'Staff User',
      email: 'staff@lumossolution.com',
      role: 'employee'
    };

    if (req.user?.id) {
      const dbUser = await User.findById(req.user.id).select('name email role');
      if (dbUser) {
        createdByLog = {
          userId: dbUser._id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role
        };
      } else {
        createdByLog = {
          userId: req.user.id,
          name: req.user.name || 'Staff User',
          email: req.user.email,
          role: req.user.role || 'employee'
        };
      }
    }

    const resolvedDate = activityDateTime || activityDate ? new Date(activityDateTime || activityDate) : new Date();
    const resolvedNotes = (detailedNotes || description || '').trim();

    const newActivity = {
      activityType: activityType || 'Remarks',
      titleSummary: resolvedTitle,
      activityDateTime: resolvedDate,
      detailedNotes: resolvedNotes,
      createdByLog,
      createdAt: new Date()
    };

    // Atomic $push into logactivity array inside lumos_appointments collection
    const updated = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        $push: { logactivity: newActivity },
        $set: {
          updatedBy: {
            userId: createdByLog.userId,
            name: createdByLog.name,
            email: createdByLog.email,
            role: createdByLog.role
          }
        }
      },
      { new: true, runValidators: true }
    );

    // Track in AppointmentAuditLog
    try {
      await AppointmentAuditLog.create({
        recordId: appointment._id,
        collectionName: 'lumos_appointments',
        action: 'UPDATE',
        changedBy: {
          userId: createdByLog.userId || null,
          name: createdByLog.name || 'Staff User',
          email: createdByLog.email || 'staff@lumossolution.com',
          role: createdByLog.role || 'employee'
        },
        changedAt: new Date(),
        changes: [
          {
            field: 'logactivity',
            fieldLabel: 'Activity Update Added',
            oldValue: `Activities count: ${appointment.logactivity?.length || 0}`,
            newValue: `Added "${resolvedTitle}" (${activityType || 'Remarks'})`
          }
        ],
        remarks: `Activity log update: ${resolvedTitle}`
      });
    } catch (auditErr) {
      logger.error('Error logging audit for appointment activity:', auditErr);
    }

    const addedItem = updated.logactivity[updated.logactivity.length - 1];

    res.status(201).json({
      success: true,
      message: 'Activity update saved successfully',
      activity: addedItem,
      logactivity: updated.logactivity
    });
  } catch (error) {
    logger.error('Error saving appointment activity log:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to save activity log' });
  }
};
