const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const logger = require('../utils/logger');

let isProcessing = false;

/**
 * Checks for due follow-up reminders and dispatches notifications
 */
const processDueReminders = async () => {
  if (isProcessing) return; // Prevent concurrent overlap
  isProcessing = true;

  try {
    const now = new Date();

    // Find appointments containing at least one due, unsent, pending reminder
    const appointments = await Appointment.find({
      'followUps': {
        $elemMatch: {
          'reminder.enabled': true,
          'reminder.isSent': false,
          'reminder.reminderAt': { $lte: now },
          'status': 'Pending'
        }
      }
    });

    if (!appointments || appointments.length === 0) {
      isProcessing = false;
      return;
    }

    for (const appt of appointments) {
      if (!appt.followUps || !Array.isArray(appt.followUps)) continue;

      for (const flw of appt.followUps) {
        if (
          flw.reminder?.enabled === true &&
          flw.reminder?.isSent === false &&
          flw.reminder?.reminderAt &&
          new Date(flw.reminder.reminderAt) <= now &&
          flw.status === 'Pending'
        ) {
          // Concurrency-safe atomic check-and-update to ensure single dispatch
          const updated = await Appointment.findOneAndUpdate(
            {
              _id: appt._id,
              'followUps.followUpId': flw.followUpId,
              'followUps.reminder.isSent': false
            },
            {
              $set: {
                'followUps.$.reminder.isSent': true,
                'followUps.$.reminder.sentAt': now
              },
              $push: {
                logactivity: {
                  activityType: 'Follow-up Call',
                  titleSummary: `Reminder Dispatched for Follow-up at ${flw.followUpTime} (Owner: ${flw.appointmentOwner?.name || 'Staff'})`,
                  activityDateTime: now,
                  detailedNotes: `Automated reminder was dispatched for follow-up on ${flw.followUpDate ? new Date(flw.followUpDate).toLocaleDateString('en-GB') : ''} at ${flw.followUpTime}. Client: ${appt.clientName || 'N/A'}.`,
                  createdByLog: {
                    userId: flw.appointmentOwner?.userId || null,
                    name: 'System Reminder Engine',
                    email: 'system@lumosevent.com',
                    role: 'system'
                  },
                  createdAt: now
                }
              }
            },
            { new: true }
          );

          if (updated) {
            const ownerName = flw.appointmentOwner?.name || 'Appointment Owner';
            const ownerEmail = flw.appointmentOwner?.email || 'N/A';
            logger.success(
              'REMINDER ENGINE',
              `Dispatched reminder for appointment ${appt.srNo || appt._id} (FollowUp ID: ${flw.followUpId}) to owner ${ownerName} (${ownerEmail})`
            );
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error during reminder worker execution:', error);
  } finally {
    isProcessing = false;
  }
};

/**
 * Starts the node-cron scheduled worker
 */
const startReminderWorker = () => {
  logger.info('REMINDER ENGINE', 'Initializing automated appointment reminder worker (interval: every 1 minute)...');

  // Schedule task every minute
  const task = cron.schedule('* * * * *', () => {
    processDueReminders();
  });

  // Run initial check immediately on server startup
  processDueReminders();

  return task;
};

module.exports = {
  startReminderWorker,
  processDueReminders
};
