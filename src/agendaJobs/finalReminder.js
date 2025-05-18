const constants = require('../utils/constants');
const { scheduledTestService, emailService, notificationService } = require('../services');

const finalReminder = async (agenda) => {
  agenda.define(constants.agendaJobs.final_reminder, async (job) => {
    const { scheduledTestId } = job.attrs.data;

    /**
     * Fetching Scheduled Test
     */
    const { email, primaryContactName, serviceConfirmationNumber, createdByUser, jobsiteId } =
      await scheduledTestService.getScheduledTestById(scheduledTestId);

    /**
     * Final Reminder Account Suspension Notice
     */
    const scheduledTestEmailObj = {
      subject: `Account Suspension Notice`,
      subject2: `Hi, ${primaryContactName}`,
      message: `Your grace period is almost up! Make a payment for the backflow request #${serviceConfirmationNumber} by tomorrow to avoid losing access to your account.`,
    };
    await emailService.sendPaymentReminderEmails(email, scheduledTestEmailObj);

    /**
     * Notify user using database Notification
     */
    const NOTIFICATION_TITLE = constants.NOTIFICATION_STATE_TYPES.FINAL_REMINDER.replaceAll('_', ' ');
    const bodyText = `Complete payment for request #${serviceConfirmationNumber} by tomorrow to avoid account suspension.`;
    await notificationService.createNotificationForUser(
      constants.NOTIFICATION_STATE_TYPES.FINAL_REMINDER,
      createdByUser,
      NOTIFICATION_TITLE,
      bodyText,
      {
        redirectUrl: `${process.env.FRONTEND_URL}/request/${serviceConfirmationNumber}`,
      }
    );
  });
};

module.exports = finalReminder;
