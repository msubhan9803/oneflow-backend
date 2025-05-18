const moment = require('moment');
const { formatCurrency } = require('../utils/helper');
const constants = require('../utils/constants');
const {
  scheduledTestService,
  settingsService,
  jobsiteService,
  emailService,
  userService,
  notificationService,
} = require('../services');

const autoRenewOffReminderBefore5Days = async (agenda) => {
  agenda.define(constants.agendaJobs.auto_renew_off_before_5_days, async (job) => {
    const { scheduledTestId } = job.attrs.data;

    /**
     * Fetching Scheduled Test
     */
    const {
      numberOfBackflows,
      email,
      scheduledDate,
      preferredScheduledTime,
      dueIn,
      serviceConfirmationNumber,
      jobsiteId,
      createdByUser,
      primaryContactName,
      backflowTestFee,
    } = await scheduledTestService.getScheduledTestById(scheduledTestId);

    /**
     * Fetching Jobsite
     */
    const jobsite = await jobsiteService.getJobsiteById(jobsiteId);

    /**
     * Fetching Settings
     */
    const { rushFee, tax, serviceFee } = await settingsService.getAllAdminSettings();

    /**
     * Fetching User
     */
    const user = await userService.getUserById(createdByUser);

    /**
     * Fetching Updated Backflow Pricing
     */
    const updatedPricingPerBackflow = await scheduledTestService.getCostCalculation(jobsite.county, numberOfBackflows, user);
    const updatedBackflowTestCost = updatedPricingPerBackflow * numberOfBackflows;

    /**
     * Totat
     */
    const total = rushFee + tax + serviceFee + updatedBackflowTestCost;

    /**
     * Email
     */
    const scheduledTestEmailObj = {
      subject: `Your Backflow Devices Need Testing!`,
      subject2: `Hi, ${primaryContactName}`,
      message: `It’s soon time to test your backflow device(s) at the following jobsite: ${jobsite.name}. Here’s a cost estimate based on your last test.`,
      jobsiteName: jobsite.name,
      serviceConfirmationNumber,
      scheduledDate: moment(scheduledDate).add(1, 'year').format('MM-DD-YYYY'),
      preferredScheduledTime,
      numberOfBackflows,
      backflowTestFee,
      rushFee: formatCurrency(rushFee),
      dueIn,
      tax: formatCurrency(tax),
      serviceFee: formatCurrency(serviceFee),
      total: formatCurrency(total),
      scheduleTestLink: `${process.env.FRONTEND_URL}/reschedule?previousRequestNumber=${serviceConfirmationNumber}`,
    };
    await emailService.sendAutoRenewalOffScheduledTestEmail(email, scheduledTestEmailObj);

    /**
     * Notify user using database Notification
     */
    const NOTIFICATION_TITLE = constants.NOTIFICATION_STATE_TYPES.REMINDER.replaceAll('_', ' ');
    const bodyText = `Retest backflows under request #${serviceConfirmationNumber} before ${moment(scheduledDate).format(
      'MM/DD/YYYY'
    )} to prevent potential water interruptions by the city. Schedule a new request now.`;
    await notificationService.createNotificationForUser(
      constants.NOTIFICATION_STATE_TYPES.REMINDER,
      createdByUser,
      NOTIFICATION_TITLE,
      bodyText,
      {
        redirectUrl: `${process.env.FRONTEND_URL}/request/${serviceConfirmationNumber}`,
      }
    );
  });
};

module.exports = autoRenewOffReminderBefore5Days;
