const constants = require('../utils/constants');
const { scheduledTestService, emailService, notificationService } = require('../services');

const paymentReminderBefore5Days = async (agenda) => {
  agenda.define(constants.agendaJobs.payment_reminder_before_5_days, async (job) => {
    const { scheduledTestId } = job.attrs.data;

    /**
     * Fetching Scheduled Test
     */
    const { email, primaryContactName, serviceConfirmationNumber, createdByUser, jobsiteId } =
      await scheduledTestService.getScheduledTestById(scheduledTestId);

    /**
     * Upcoming Payment Reminder Email
     */
    const scheduledTestEmailObj = {
      subject: `Payment Reminder`,
      subject2: `Hi, ${primaryContactName}`,
      message: `Just reminding you that the payment for the backflow request #${serviceConfirmationNumber} is due in 5 days.`,
    };
    await emailService.sendPaymentReminderEmails(email, scheduledTestEmailObj);

    /**
     * Notify user using database Notification
     */
    const NOTIFICATION_TITLE = constants.NOTIFICATION_STATE_TYPES.PAYMENT_REMINDER.replaceAll('_', ' ');
    const bodyText = `Payment for request #${serviceConfirmationNumber} is due in 5 days.`;
    await notificationService.createNotificationForUser(
      constants.NOTIFICATION_STATE_TYPES.PAYMENT_REMINDER,
      createdByUser,
      NOTIFICATION_TITLE,
      bodyText,
      {
        redirectUrl: `${process.env.FRONTEND_URL}/request/${serviceConfirmationNumber}`,
      }
    );
  });
};

module.exports = paymentReminderBefore5Days;
