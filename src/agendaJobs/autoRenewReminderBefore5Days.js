const moment = require('moment');
const constants = require('../utils/constants');
const { scheduledTestService, jobsiteService, userService, stripeService } = require('../services');
const { scheduledTestHelper } = require('../helpers/scheduledTestHelper');

const autoRenewReminderBefore5Days = async (agenda) => {
  agenda.define(constants.agendaJobs.auto_renew_on_before_5_days, async (job) => {
    const { scheduledTestId } = job.attrs.data;

    /**
     * Fetching Previous Scheduled Test
     */
    const {
      jobsiteId,
      createdByUser,
      primaryContactName,
      phoneNumber,
      email,
      validUntilDate,
      preferredScheduledTime,
      numberOfBackflows,
      newInstallationOrReplacement,
      anyLockedBackflows,
      anyBackflowInsideBuilding,
      anyLockedBackflowRequiringOnsiteStaff,
      isAlarm,
      isTestMode,
      additionalInstructions,
      reportFileUrl,
      stripe,
    } = await scheduledTestService.getScheduledTestById(scheduledTestId);
    const { paymentIntentId, paymentIntentAmount, paymentIntentCurrency } = stripe;

    /**
     * Fetching User
     */
    const user = await userService.getUserById(createdByUser);

    const { stripeCustomerId, paymentMethodId, cardBrand, cardExpMonth, cardExpYear, cardLast4, country, zipCode } =
      user.stripe;

    /**
     * Setting new scheduled date and valid until date
     */
    const newScheduledDate = moment(validUntilDate);
    const newValidDate = moment(validUntilDate).add(1, 'year');

    /**
     * Fetching Jobsite
     */
    const jobsite = await jobsiteService.getJobsiteById(jobsiteId);

    /**
     * Fetching Updated Backflow Pricing
     */
    const backflowTestFee = await scheduledTestService.getCostCalculation(jobsite.county, numberOfBackflows, user);
    const updatedBackflowTestCost = backflowTestFee * numberOfBackflows;

    /**
     * Fetching Settings
     */
    // const { rushFee, tax, serviceFee } = await settingsService.getAllAdminSettings();

    /**
     * Totat
     * rushFee = 0 as not in rush
     */
    const creditPoints = user.creditPoint || 0;
    const total = Math.max(updatedBackflowTestCost - creditPoints, 0);
    const remainingCredit = Math.max(creditPoints - total, 0);

    /**
     * Charging Card
     */
    if (!user.isNetPaymentTermRequired && total > 0) {
      await stripeService.chargeCustomer(user.stripe.stripeCustomerId, user.stripe.paymentMethodId, total);
    }

    /**
     * Creating Scheduled Test
     */
    const newScheduledTestObj = {
      jobsiteId,
      createdByUser,
      primaryContactName,
      phoneNumber,
      email,
      scheduledDate: newScheduledDate,
      validUntilDate: newValidDate,
      preferredScheduledTime,
      numberOfBackflows,
      newInstallationOrReplacement,
      anyLockedBackflows,
      anyBackflowInsideBuilding,
      anyLockedBackflowRequiringOnsiteStaff,
      isAlarm,
      isTestMode,
      additionalInstructions,
      total,
      stripeCustomerId,
      paymentMethodId,
      cardBrand,
      cardExpMonth,
      cardExpYear,
      cardLast4,
      country,
      zipCode,
      paymentIntentId,
      paymentIntentAmount,
      paymentIntentCurrency,
      backflowTestFee,
      rushFee: 0,
      tax: 0,
      serviceFee: 0,
      reportFileUrl,
    };
    const scheduledTestRes = await scheduledTestService.scheduledTest(
      newScheduledTestObj,
      {
        key: reportFileUrl,
      },
      user,
      jobsite
    );

    /**
     * Updating User's credit points
     */
    await userService.updateCreditPointByUserId(user.id, remainingCredit);

    await scheduledTestHelper(scheduledTestRes, jobsite, agenda);
  });
};

module.exports = autoRenewReminderBefore5Days;
