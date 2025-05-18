const constants = require('../utils/constants');
const { scheduledTestService, emailService, notificationService, userService } = require('../services');

const paymentDueToday = async (agenda) => {
  agenda.define(constants.agendaJobs.payment_due_today, async (job) => {
    const { scheduledTestId } = job.attrs.data;

    /**
     * Fetching Scheduled Test
     */
    const { email, primaryContactName, serviceConfirmationNumber, createdByUser, jobsiteId } =
      await scheduledTestService.getScheduledTestById(scheduledTestId);

    /**
     * Payment Due Email
     */
    const scheduledTestEmailObj = {
      subject: `Payment Due`,
      subject2: `Hi, ${primaryContactName}`,
      message: `The payment for the backflow request #${serviceConfirmationNumber} is due today. Make a payment at your earliest convenience.`,
    };
    await emailService.sendPaymentReminderEmails(email, scheduledTestEmailObj);

    /**
     * Notify user using database Notification
     */
    const NOTIFICATION_TITLE = constants.NOTIFICATION_STATE_TYPES.PAYMENT_DUE.replaceAll('_', ' ');
    const bodyText = `Payment for request #${serviceConfirmationNumber} is due today.`;
    await notificationService.createNotificationForUser(
      constants.NOTIFICATION_STATE_TYPES.PAYMENT_DUE,
      createdByUser,
      NOTIFICATION_TITLE,
      bodyText,
      {
        redirectUrl: `${process.env.FRONTEND_URL}/request/${serviceConfirmationNumber}`,
      }
    );

    /**
     * Notify Admin using database Notification
     */
    const adminUsers = await userService.getAllAdminUsers();
    adminUsers.forEach(async (admin) => {
      const NOTIFICATION_TITLE_ADMIN_STATUS = constants.NOTIFICATION_STATE_TYPES.NET_PAYMENT_DUE.replaceAll('_', ' ');
      const bodyTextStatusAmin = `The payment for request #${serviceConfirmationNumber} is due today.`;
      await notificationService.createNotificationForUser(
        constants.NOTIFICATION_STATE_TYPES.NET_PAYMENT_DUE,
        admin._id,
        NOTIFICATION_TITLE_ADMIN_STATUS,
        bodyTextStatusAmin,
        {
          redirectUrl: `${process.env.FRONTEND_URL}/request/${serviceConfirmationNumber}`,
        }
      );
    });
  });
};

module.exports = paymentDueToday;
