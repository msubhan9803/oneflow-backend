const moment = require('moment');
const { formatCurrency } = require('../utils/helper');
const constants = require('../utils/constants');
const { scheduledTestService, settingsService, jobsiteService, emailService, userService } = require('../services');

const autoRenewReminderBefore10Days = async (agenda) => {
  agenda.define(constants.agendaJobs.auto_renew_on_before_10_days, async (job) => {
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
    const total = updatedBackflowTestCost;

    /**
     * Email
     */
    const scheduledTestEmailObj = {
      subject: `Cost Estimate for Upcoming Test`,
      subject2: `Hi, ${primaryContactName}`,
      message: `Here are the cost estimates for your upcoming backflow test(s) at the jobsite: ${jobsite.name}`,
      jobsiteName: jobsite.name,
      serviceConfirmationNumber,
      scheduledDate: moment(scheduledDate).format('MM-DD-YYYY'),
      preferredScheduledTime,
      numberOfBackflows,
      backflowTestFee,
      rushFee: 0,
      dueIn,
      tax: 0,
      serviceFee: 0,
      total: formatCurrency(total),
    };
    await emailService.sendUpcomingAutoRenewalScheduledTestEmail(email, scheduledTestEmailObj);
  });
};

module.exports = autoRenewReminderBefore10Days;
