/* eslint-disable no-restricted-syntax */
const moment = require('moment');
const constants = require('../utils/constants');
const notificationService = require('../services/notification.service');
const { formatCurrency } = require('../utils/helper');
const { notifyUserService, reportService, jobsiteService, userService } = require('../services');

/**
 * Scheduled Test Helper
 */
const scheduledTestHelper = async (scheduledTestRes, jobsite, agendaInstance) => {
  const jobsiteName = scheduledTestRes.jobsiteId.name;
  // const currentStatus = scheduledTestRes.currentStatus.replace(/([A-Z])/g, ' $1').toUpperCase();
  // const emailMessage = messages.StatusUpdatedTo(jobsiteName, currentStatus);

  /**
   * Notify user using email
   */
  const scheduledTestEmailObj = {
    subject: `Thank you for booking with us!`,
    message: 'A member of the One Flow Back flow team will contact your shortly to confirm your backflow service request.',
    jobsiteName,
    serviceConfirmationNumber: scheduledTestRes.serviceConfirmationNumber,
    scheduledDate: moment(scheduledTestRes.scheduledDate).format('MM-DD-YYYY'),
    preferredScheduledTime: scheduledTestRes.preferredScheduledTime,
    numberOfBackflows: scheduledTestRes.numberOfBackflows,
    rushFee: formatCurrency(scheduledTestRes.rushFee),
    dueIn: scheduledTestRes.dueIn,
    tax: formatCurrency(scheduledTestRes.tax),
    serviceFee: formatCurrency(scheduledTestRes.serviceFee),
    total: formatCurrency(scheduledTestRes.total),
    checkStatusLink: `${process.env.FRONTEND_URL}/check-status?id=${scheduledTestRes.serviceConfirmationNumber}`,
  };
  await notifyUserService.userNotificationAboutScheduledTest(scheduledTestRes.email, scheduledTestEmailObj);

  /**
   * Creating report
   */
  const report = await reportService.createReport(
    scheduledTestRes._id,
    scheduledTestRes.jobsiteId._id,
    scheduledTestRes.createdByUser
  );

  /**
   * Updating Jobsite status to In Use
   */
  await jobsiteService.updateJobsiteSiteToInUse(scheduledTestRes.jobsiteId._id);

  /**
   * Notify user using database Notification
   */
  const NOTIFICATION_TITLE_STATUS = constants.NOTIFICATION_STATE_TYPES.STATUS_UPDATE.replaceAll('_', ' ');
  const bodyTextStatus = `Service request #${scheduledTestRes.serviceConfirmationNumber} Pending!`;
  await notificationService.createNotificationForUser(
    constants.NOTIFICATION_STATE_TYPES.STATUS_UPDATE,
    scheduledTestRes.createdByUser,
    NOTIFICATION_TITLE_STATUS,
    bodyTextStatus,
    {
      scheduledTestId: scheduledTestRes._id,
      jobsiteId: scheduledTestRes.jobsiteId._id,
    }
  );

  /**
   * Notify user using database Notification
   */
  const NOTIFICATION_TITLE_REPORT = constants.NOTIFICATION_STATE_TYPES.REPORT_READY.replaceAll('_', ' ');
  const bodyTextReport = `The report for request #${scheduledTestRes.serviceConfirmationNumber} was completed!`;
  await notificationService.createNotificationForUser(
    constants.NOTIFICATION_STATE_TYPES.REPORT_READY,
    scheduledTestRes.createdByUser,
    NOTIFICATION_TITLE_REPORT,
    bodyTextReport,
    {
      redirectUrl: `${process.env.FRONTEND_URL}/report/${report._id}`,
    }
  );

  /**
   * Notify Admin using database Notification
   */
  const adminUsers = await userService.getAllAdminUsers();
  adminUsers.forEach(async (admin) => {
    const NOTIFICATION_TITLE_ADMIN_STATUS = constants.NOTIFICATION_STATE_TYPES.NEW_REQUEST.replaceAll('_', ' ');
    const bodyTextStatusAmin = `${scheduledTestRes.primaryContactName} scheduled a request (#${scheduledTestRes.serviceConfirmationNumber})`;
    await notificationService.createNotificationForUser(
      constants.NOTIFICATION_STATE_TYPES.NEW_REQUEST,
      admin._id,
      NOTIFICATION_TITLE_ADMIN_STATUS,
      bodyTextStatusAmin,
      {
        redirectUrl: `${process.env.FRONTEND_URL}/request/${scheduledTestRes.serviceConfirmationNumber}`,
      }
    );
  });

  /**
   * Payment reminder jobs for Net user
   */
  // const dueInJobDate = scheduledTestRes.dueIn;
  const dueInJobDate = moment().add(1, 'minutes');
  console.log('Due In Date');
  console.log(dueInJobDate.format('llll'));
  console.log(' ');

  if (scheduledTestRes.isNetTerms) {
    const paymentReminder = moment(dueInJobDate).subtract(5, process.env.AGENDA_JOB_UNIT);
    const paymentDueToday = moment(dueInJobDate);
    const finalReminder = moment(dueInJobDate).add(3, process.env.AGENDA_JOB_UNIT);
    const accountSuspensionNotice = moment(finalReminder).add(1, process.env.AGENDA_JOB_UNIT);

    const jobData = {
      scheduledTestId: scheduledTestRes._id,
    };

    /**
     * Upcoming Payment Reminder
     * To user using Email + Notification
     */
    await agendaInstance.schedule(paymentReminder, constants.agendaJobs.payment_reminder_before_5_days, jobData);

    /**
     * Payment Due Reminder
     * To user using Email + Notification
     * To admin using Notification
     */
    await agendaInstance.schedule(paymentDueToday, constants.agendaJobs.payment_due_today, jobData);

    /**
     * Final Reminder
     * To user using Email + Notification
     */
    await agendaInstance.schedule(finalReminder, constants.agendaJobs.final_reminder, jobData);

    /**
     * Account Suspension
     * To admin using Notification
     */
    await agendaInstance.schedule(accountSuspensionNotice, constants.agendaJobs.account_suspension_notice, jobData);

    console.log('Payment Reminder: ');
    console.log(paymentReminder.format('llll'));
    console.log(' ');

    console.log('Payment Due Today: ');
    console.log(paymentDueToday.format('llll'));
    console.log(' ');

    console.log('Final Reminder: ');
    console.log(finalReminder.format('llll'));
    console.log(' ');

    console.log('Account Suspension Notice: ');
    console.log(accountSuspensionNotice.format('llll'));
    console.log(' ');
  }
};

module.exports = {
  scheduledTestHelper,
};
