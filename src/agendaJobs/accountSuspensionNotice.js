const constants = require('../utils/constants');
const { scheduledTestService, notificationService, userService } = require('../services');

const accountSuspensionNotice = async (agenda) => {
  agenda.define(constants.agendaJobs.account_suspension_notice, async (job) => {
    const { scheduledTestId } = job.attrs.data;

    /**
     * Fetching Scheduled Test
     */
    const { serviceConfirmationNumber, primaryContactName } = await scheduledTestService.getScheduledTestById(
      scheduledTestId
    );

    /**
     * Notify Admin using database Notification
     */
    const adminUsers = await userService.getAllAdminUsers();
    adminUsers.forEach(async (admin) => {
      const NOTIFICATION_TITLE_ADMIN_STATUS = constants.NOTIFICATION_STATE_TYPES.ACCOUNT_SUSPENSION_NOTICE.replaceAll(
        '_',
        ' '
      );
      const bodyTextStatusAmin = `Request #${serviceConfirmationNumber} for ${primaryContactName} has surpassed the payment grace period.`;
      await notificationService.createNotificationForUser(
        constants.NOTIFICATION_STATE_TYPES.ACCOUNT_SUSPENSION_NOTICE,
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

module.exports = accountSuspensionNotice;
