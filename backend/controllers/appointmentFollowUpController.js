const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const AppointmentAuditLog = require('../models/AppointmentAuditLog');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Calculates reminderAt Date based on date string (YYYY-MM-DD), time string (HH:mm)
 * and reminderBefore in minutes, interpreting in Indian Standard Time (Asia/Kolkata, UTC+05:30).
 */
const calculateReminderTimestamp = (dateStr, timeStr, reminderBeforeMinutes = 15) => {
  if (!dateStr || !timeStr) return null;

  try {
    const rawDatePart = typeof dateStr === 'string'
      ? dateStr.split('T')[0]
      : new Date(dateStr).toISOString().split('T')[0];

    const [year, month, day] = rawDatePart.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
      return null;
    }

    // IST is UTC + 5:30 -> Offset is -330 minutes
    const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
    const meetingUtcMs = Date.UTC(year, month - 1, day, hours, minutes, 0) - istOffsetMs;

    const reminderUtcMs = meetingUtcMs - (Number(reminderBeforeMinutes) || 15) * 60 * 1000;
    return new Date(reminderUtcMs);
  } catch (err) {
    logger.error('Error calculating reminder timestamp:', err);
    return null;
  }
};

/**
 * POST /api/appointments/:id/follow-ups
 * Create a new follow-up for an appointment
 */
exports.createFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { followUpDate, followUpTime, notes = '', reminder = {}, assignedToUserId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID format' });
    }

    if (!followUpDate || !followUpTime) {
      return res.status(400).json({ success: false, message: 'Follow-up Date and Time are required' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Resolve Appointment Owner
    const apptOwner = {
      userId: appointment.createdBy?.userId || req.user.id,
      name: appointment.createdBy?.name || 'Appointment Owner',
      email: appointment.createdBy?.email || req.user.email,
      role: appointment.createdBy?.role || 'employee'
    };

    // Resolve Assigned Staff Member if specified
    let assignedStaff = null;
    if (assignedToUserId && mongoose.Types.ObjectId.isValid(assignedToUserId)) {
      const assignedUser = await User.findById(assignedToUserId);
      if (assignedUser) {
        assignedStaff = {
          userId: assignedUser._id,
          name: assignedUser.name,
          email: assignedUser.email,
          role: assignedUser.role || 'employee'
        };
      }
    }

    // Creator details from authenticated token
    const creator = {
      userId: req.user.id,
      name: req.user.name || 'Staff User',
      email: req.user.email || 'staff@lumossolution.com',
      role: req.user.role || 'employee'
    };

    // Calculate Reminder Settings
    const isReminderEnabled = reminder.enabled !== false;
    const reminderBeforeMinutes = Number(reminder.reminderBefore) || 15;
    const reminderAt = isReminderEnabled
      ? calculateReminderTimestamp(followUpDate, followUpTime, reminderBeforeMinutes)
      : null;

    // Build Recipients List: includes both Appointment Owner and Creator
    const notifyRecipients = [];
    if (apptOwner.userId) {
      notifyRecipients.push({
        userId: apptOwner.userId,
        name: apptOwner.name,
        email: apptOwner.email,
        role: apptOwner.role,
        isNotified: false
      });
    }

    // If creator is different from owner, also notify creator
    if (creator.userId && String(creator.userId) !== String(apptOwner.userId)) {
      notifyRecipients.push({
        userId: creator.userId,
        name: creator.name,
        email: creator.email,
        role: creator.role,
        isNotified: false
      });
    }

    if (assignedStaff && String(assignedStaff.userId) !== String(apptOwner.userId) && String(assignedStaff.userId) !== String(creator.userId)) {
      notifyRecipients.push({
        userId: assignedStaff.userId,
        name: assignedStaff.name,
        email: assignedStaff.email,
        role: assignedStaff.role,
        isNotified: false
      });
    }

    const followUpId = `flw_${new mongoose.Types.ObjectId().toString()}`;
    const cleanDate = new Date(followUpDate);

    const newFollowUp = {
      followUpId,
      followUpDate: cleanDate,
      followUpTime: String(followUpTime).trim(),
      notes: String(notes).slice(0, 5000).trim(),
      appointmentOwner: apptOwner,
      assignedTo: assignedStaff || apptOwner,
      reminder: {
        enabled: isReminderEnabled,
        reminderBefore: reminderBeforeMinutes,
        reminderUnit: reminder.reminderUnit || 'minutes',
        reminderAt,
        isSent: false,
        sentAt: null,
        notifyRecipients
      },
      status: 'Pending',
      createdBy: creator,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Format human-readable date for logs
    const dateFormatted = cleanDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const activitySummary = `Follow-up Scheduled for ${dateFormatted} at ${followUpTime} (Owner: ${apptOwner.name})`;

    // Push into appointment's followUps and logactivity arrays atomically
    const updated = await Appointment.findByIdAndUpdate(
      id,
      {
        $push: {
          followUps: newFollowUp,
          logactivity: {
            activityType: 'Follow-up Call',
            titleSummary: activitySummary,
            activityDateTime: new Date(),
            detailedNotes: notes ? `Notes: ${notes}` : 'Scheduled follow-up reminder',
            createdByLog: {
              userId: creator.userId,
              name: creator.name,
              email: creator.email,
              role: creator.role
            },
            createdAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    );

    // Track Audit Log
    try {
      await AppointmentAuditLog.create({
        recordId: appointment._id,
        collectionName: 'lumos_appointments',
        action: 'UPDATE',
        changedBy: creator,
        changedAt: new Date(),
        changes: [
          {
            field: 'followUps',
            fieldLabel: 'Follow-up Created',
            oldValue: `Total follow-ups: ${appointment.followUps?.length || 0}`,
            newValue: `Scheduled on ${dateFormatted} at ${followUpTime} (Owner: ${apptOwner.name})`
          }
        ],
        remarks: `Follow-up created: ${activitySummary}`
      });
    } catch (auditErr) {
      logger.error('Error writing audit log for follow-up creation:', auditErr);
    }

    const savedFollowUp = updated.followUps.find((f) => f.followUpId === followUpId);

    res.status(201).json({
      success: true,
      message: 'Follow-up scheduled successfully',
      followUp: savedFollowUp,
      followUps: updated.followUps
    });
  } catch (error) {
    logger.error('Error creating appointment follow-up:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to schedule follow-up' });
  }
};

/**
 * GET /api/appointments/:id/follow-ups
 * Retrieve all follow-ups for an appointment
 */
exports.getFollowUps = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID format' });
    }

    const appointment = await Appointment.findById(id).select('followUps createdBy clientName srNo');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const now = new Date();

    // Dynamically mark overdue items if date/time has passed and status is still Pending
    const followUps = (appointment.followUps || []).map((flw) => {
      const flwObj = flw.toObject ? flw.toObject() : { ...flw };
      if (flwObj.status === 'Pending' && flwObj.followUpDate) {
        try {
          const dPart = new Date(flwObj.followUpDate).toISOString().split('T')[0];
          const [y, m, d] = dPart.split('-').map(Number);
          const [hh, mm] = (flwObj.followUpTime || '23:59').split(':').map(Number);
          const istOffset = (5 * 60 + 30) * 60 * 1000;
          const dueUtc = Date.UTC(y, m - 1, d, hh, mm) - istOffset;
          if (dueUtc < now.getTime()) {
            flwObj.status = 'Overdue';
          }
        } catch (_) {}
      }
      return flwObj;
    });

    // Sort: Pending & Overdue first (by date ascending), then Completed and Cancelled (by date descending)
    followUps.sort((a, b) => {
      const activeA = a.status === 'Pending' || a.status === 'Overdue';
      const activeB = b.status === 'Pending' || b.status === 'Overdue';
      if (activeA && !activeB) return -1;
      if (!activeA && activeB) return 1;

      return new Date(a.followUpDate) - new Date(b.followUpDate);
    });

    res.json({
      success: true,
      followUps,
      total: followUps.length,
      pendingCount: followUps.filter((f) => f.status === 'Pending' || f.status === 'Overdue').length
    });
  } catch (error) {
    logger.error('Error fetching appointment follow-ups:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch follow-ups' });
  }
};

/**
 * PUT /api/appointments/:id/follow-ups/:followUpId
 * Update follow-up details (date, time, notes, reminder)
 */
exports.updateFollowUp = async (req, res) => {
  try {
    const { id, followUpId } = req.params;
    const { followUpDate, followUpTime, notes, reminder, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID format' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const existingFollowUp = appointment.followUps.find((f) => f.followUpId === followUpId);
    if (!existingFollowUp) {
      return res.status(404).json({ success: false, message: 'Follow-up record not found' });
    }

    const updatedDate = followUpDate ? new Date(followUpDate) : existingFollowUp.followUpDate;
    const updatedTime = followUpTime || existingFollowUp.followUpTime;
    const updatedNotes = notes !== undefined ? String(notes).slice(0, 5000).trim() : existingFollowUp.notes;

    let updatedReminder = { ...existingFollowUp.reminder };
    if (reminder) {
      const isEnabled = reminder.enabled !== undefined ? reminder.enabled : existingFollowUp.reminder.enabled;
      const beforeMin = Number(reminder.reminderBefore) || existingFollowUp.reminder.reminderBefore || 15;
      const reminderAt = isEnabled ? calculateReminderTimestamp(updatedDate, updatedTime, beforeMin) : null;

      updatedReminder.enabled = isEnabled;
      updatedReminder.reminderBefore = beforeMin;
      updatedReminder.reminderUnit = reminder.reminderUnit || existingFollowUp.reminder.reminderUnit || 'minutes';
      updatedReminder.reminderAt = reminderAt;
      // If rescheduled, reset isSent so reminder fires at the new time
      if (updatedDate.getTime() !== existingFollowUp.followUpDate.getTime() || updatedTime !== existingFollowUp.followUpTime) {
        updatedReminder.isSent = false;
        updatedReminder.sentAt = null;
      }
    }

    const updateFields = {
      'followUps.$.followUpDate': updatedDate,
      'followUps.$.followUpTime': updatedTime,
      'followUps.$.notes': updatedNotes,
      'followUps.$.reminder': updatedReminder,
      'followUps.$.updatedAt': new Date()
    };

    if (status && ['Pending', 'Completed', 'Cancelled', 'Overdue'].includes(status)) {
      updateFields['followUps.$.status'] = status;
      if (status === 'Completed') {
        updateFields['followUps.$.completedAt'] = new Date();
      }
    }

    const dateStr = updatedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

    const updated = await Appointment.findOneAndUpdate(
      { _id: id, 'followUps.followUpId': followUpId },
      {
        $set: updateFields,
        $push: {
          logactivity: {
            activityType: 'Follow-up Call',
            titleSummary: `Follow-up Updated / Rescheduled to ${dateStr} at ${updatedTime}`,
            activityDateTime: new Date(),
            detailedNotes: updatedNotes ? `Notes: ${updatedNotes}` : 'Follow-up parameters updated',
            createdByLog: {
              userId: req.user.id,
              name: req.user.name || 'Staff User',
              email: req.user.email || 'staff@lumossolution.com',
              role: req.user.role || 'employee'
            },
            createdAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    );

    const saved = updated.followUps.find((f) => f.followUpId === followUpId);

    res.json({
      success: true,
      message: 'Follow-up updated successfully',
      followUp: saved,
      followUps: updated.followUps
    });
  } catch (error) {
    logger.error('Error updating appointment follow-up:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update follow-up' });
  }
};

/**
 * PATCH /api/appointments/:id/follow-ups/:followUpId/status
 * Complete or Cancel a follow-up
 */
exports.updateFollowUpStatus = async (req, res) => {
  try {
    const { id, followUpId } = req.params;
    const { status, resolutionNotes = '' } = req.body;

    if (!['Completed', 'Cancelled', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be Completed, Cancelled, or Pending' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const flw = appointment.followUps.find((f) => f.followUpId === followUpId);
    if (!flw) {
      return res.status(404).json({ success: false, message: 'Follow-up record not found' });
    }

    const now = new Date();
    const updateQuery = {
      'followUps.$.status': status,
      'followUps.$.updatedAt': now
    };

    if (status === 'Completed') {
      updateQuery['followUps.$.completedAt'] = now;
    }

    const activitySummary = status === 'Completed'
      ? `Follow-up Completed for ${flw.followUpTime} (Owner: ${flw.appointmentOwner?.name || 'Staff'})`
      : `Follow-up Cancelled`;

    const updated = await Appointment.findOneAndUpdate(
      { _id: id, 'followUps.followUpId': followUpId },
      {
        $set: updateQuery,
        $push: {
          logactivity: {
            activityType: status === 'Completed' ? 'Customer Interaction' : 'Remarks',
            titleSummary: activitySummary,
            activityDateTime: now,
            detailedNotes: resolutionNotes ? `Resolution: ${resolutionNotes}` : `Follow-up status changed to ${status}`,
            createdByLog: {
              userId: req.user.id,
              name: req.user.name || 'Staff User',
              email: req.user.email || 'staff@lumossolution.com',
              role: req.user.role || 'employee'
            },
            createdAt: now
          }
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `Follow-up marked as ${status}`,
      followUps: updated.followUps
    });
  } catch (error) {
    logger.error('Error changing follow-up status:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update follow-up status' });
  }
};

/**
 * DELETE /api/appointments/:id/follow-ups/:followUpId
 * Remove a follow-up record
 */
exports.deleteFollowUp = async (req, res) => {
  try {
    const { id, followUpId } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const flw = appointment.followUps.find((f) => f.followUpId === followUpId);
    if (!flw) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      {
        $pull: { followUps: { followUpId } },
        $push: {
          logactivity: {
            activityType: 'Remarks',
            titleSummary: `Follow-up Removed (${flw.followUpTime})`,
            activityDateTime: new Date(),
            detailedNotes: `Follow-up for ${flw.followUpTime} was deleted.`,
            createdByLog: {
              userId: req.user.id,
              name: req.user.name || 'Staff User',
              email: req.user.email || 'staff@lumossolution.com',
              role: req.user.role || 'employee'
            },
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Follow-up deleted successfully',
      followUps: updated.followUps
    });
  } catch (error) {
    logger.error('Error deleting follow-up:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete follow-up' });
  }
};

/**
 * GET /api/appointments/upcoming-reminders
 * Dashboard lightweight endpoint returning total pending reminder count and top 3 upcoming reminders
 */
exports.getUpcomingReminders = async (req, res) => {
  try {
    let match = {};
    if (req.user && req.user.role !== 'admin') {
      const userObjId = mongoose.Types.ObjectId.isValid(req.user.id)
        ? new mongoose.Types.ObjectId(req.user.id)
        : null;
      const userEmail = (req.user.email || '').toLowerCase().trim();
      const userName = (req.user.name || '').trim();

      const userConditions = [
        { 'createdBy.userId': req.user.id },
        { 'followUps.appointmentOwner.userId': req.user.id },
        { 'followUps.assignedTo.userId': req.user.id }
      ];

      if (userObjId) {
        userConditions.push(
          { 'createdBy.userId': userObjId },
          { 'followUps.appointmentOwner.userId': userObjId },
          { 'followUps.assignedTo.userId': userObjId }
        );
      }

      if (userEmail) {
        userConditions.push(
          { 'createdBy.email': userEmail },
          { 'followUps.appointmentOwner.email': userEmail },
          { 'followUps.assignedTo.email': userEmail }
        );
      }

      if (userName) {
        userConditions.push(
          { 'createdBy.name': userName },
          { 'followUps.appointmentOwner.name': userName },
          { internalReference: userName }
        );
      }

      match = { $or: userConditions };
    }

    const query = {
      ...match,
      followUps: { $exists: true, $ne: [] }
    };

    const appointments = await Appointment.find(query)
      .select('clientName srNo createdBy internalReference followUps')
      .lean();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const allReminders = [];

    appointments.forEach((appt) => {
      if (!appt.followUps || !Array.isArray(appt.followUps)) return;

      appt.followUps.forEach((flw) => {
        // Only include active pending/overdue follow-ups
        if (flw.status === 'Completed' || flw.status === 'Cancelled') return;

        const fDate = flw.followUpDate ? new Date(flw.followUpDate) : null;
        let isOverdue = flw.status === 'Overdue';

        if (fDate && flw.status === 'Pending') {
          try {
            const dPart = fDate.toISOString().split('T')[0];
            const [y, m, d] = dPart.split('-').map(Number);
            const [hh, mm] = (flw.followUpTime || '23:59').split(':').map(Number);
            const istOffset = (5 * 60 + 30) * 60 * 1000;
            const dueUtc = Date.UTC(y, m - 1, d, hh, mm) - istOffset;
            if (dueUtc < now.getTime()) {
              isOverdue = true;
            }
          } catch (_) {}
        }

        let dateLabel = '';
        if (fDate) {
          const flwDay = new Date(fDate.getFullYear(), fDate.getMonth(), fDate.getDate());
          if (flwDay.getTime() === today.getTime()) {
            dateLabel = 'Today';
          } else if (flwDay.getTime() === tomorrow.getTime()) {
            dateLabel = 'Tomorrow';
          } else {
            dateLabel = fDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          }
        }

        let timeLabel = flw.followUpTime || '';
        if (timeLabel && timeLabel.includes(':')) {
          const [hStr, mStr] = timeLabel.split(':');
          let h = Number(hStr);
          const m = mStr;
          const ampm = h >= 12 ? 'PM' : 'AM';
          h = h % 12 || 12;
          timeLabel = `${String(h).padStart(2, '0')}:${m} ${ampm}`;
        }

        const formattedDateTime = dateLabel && timeLabel ? `${dateLabel} · ${timeLabel}` : (dateLabel || timeLabel || 'Upcoming');

        allReminders.push({
          followUpId: flw.followUpId || (flw._id ? flw._id.toString() : ''),
          appointmentId: appt._id ? appt._id.toString() : '',
          srNo: appt.srNo || '',
          clientName: appt.clientName || 'Client',
          title: `Follow up with ${appt.clientName || 'Client'}`,
          description: flw.notes || '',
          notes: flw.notes || '',
          followUpDate: flw.followUpDate,
          followUpTime: flw.followUpTime,
          formattedDateTime,
          status: isOverdue ? 'Overdue' : 'Pending',
          isOverdue,
          ownerName: flw.appointmentOwner?.name || appt.createdBy?.name || 'Staff'
        });
      });
    });

    const totalPendingCount = allReminders.length;

    // Sort order: Overdue first, then Today, then upcoming by date & time ascending
    allReminders.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return new Date(a.followUpDate) - new Date(b.followUpDate);
    });

    res.json({
      success: true,
      totalPendingCount,
      reminders: allReminders.slice(0, 3)
    });
  } catch (error) {
    logger.error('Error fetching dashboard upcoming reminders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming reminders' });
  }
};
