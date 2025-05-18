/* eslint-disable no-await-in-loop */
const crypto = require('crypto');
const moment = require('moment');
const httpStatus = require('http-status');
const { ScheduledTest } = require('../models');
const constants = require('../utils/constants');
const messages = require('../utils/message');
const ApiError = require('../utils/ApiError');
const settingsService = require('./settings.service');
const jobsitesService = require('./jobsite.service');
const requestLogService = require('./requestLog.service');
const teamUpService = require('./teamUp.service');
const userService = require('./user.service');
const stripeService = require('./stripe.service');

/**
 * Get Cost Calculation
 * @param {Object} county
 * @param {String} numberOfBackflow
 * @param {Object} user
 * @returns {Promise<Jobsite>}
 */
const getCostCalculation = async (county, numberOfBackflow, user) => {
  const isCommercialUser = user.accountType === constants.USER_ACCOUNT_TYPES.commercial;
  let ratePerBackflow = null;
  const rateList = county[isCommercialUser ? 'commercialRateList' : 'residentialRateList'];

  if (numberOfBackflow > rateList.length) {
    ratePerBackflow = rateList[rateList.length - 1];
  } else {
    ratePerBackflow = rateList[numberOfBackflow - 1];
  }

  return ratePerBackflow;
};

/**
 * Helper Methods
 */
const getTripFeeFromScheduledTests = async (scheduledTest) => {
  const oneTripFee = parseInt(scheduledTest.jobsiteId.county.rateForCounty, 10);
  return oneTripFee;
};

/**
 * Get All Scheduled Tests
 * @returns {Promise<QueryResult>}
 */
const getAllScheduledTests = async () => {
  const scheduledTests = await ScheduledTest.find();
  return scheduledTests;
};

/**
 * Query for Scheduled Tests
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryScheduledTests = async (filter, options) => {
  const scheduledTests = await ScheduledTest.paginate(filter, options);
  return scheduledTests;
};

/**
 * Query for Scheduled Tests Aggregated
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryScheduledTestsAggregated = async (filter, options, aggregatedQuery) => {
  const scheduledTests = await ScheduledTest.aggregatedPaginate(filter, options, aggregatedQuery);
  return scheduledTests;
};

/**
 * Get Scheduled Test by Id
 * @param {String} scheduledTestId
 * @returns {Promise<Jobsite>}
 */
const getScheduledTestById = async (scheduledTestId) => {
  const scheduledTest = await ScheduledTest.findById(scheduledTestId).populate({
    path: 'jobsiteId',
    populate: [{ path: 'county' }, { path: 'createdByUser' }],
  });
  if (!scheduledTest) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  return scheduledTest;
};

/**
 * Get Scheduled Test by Jobsite Id
 * @param {String} scheduledTestId
 * @returns {Promise<Jobsite>}
 */
const getScheduledTestByJobsiteId = async (jobsiteId) => {
  const scheduledTest = await ScheduledTest.findOne({ jobsiteId });

  return scheduledTest;
};

/**
 * Get All Scheduled Test by User Id
 * @param {String} userId
 * @returns {Promise<Jobsite>}
 */
const getAllScheduledTestsByUserId = async (userId) => {
  const scheduledTests = await ScheduledTest.find({ createdByUser: userId }).populate({
    path: 'jobsiteId',
    populate: [{ path: 'county' }, { path: 'createdByUser' }],
  });

  return scheduledTests;
};

/**
 * Get Scheduled Test by ServiceConfirmationNumber
 * @param {String} scheduledTestId
 * @returns {Promise<Jobsite>}
 */
const getScheduledTestByServiceConfirmationNumber = async (serviceConfirmationNumber) => {
  const scheduledTest = await ScheduledTest.findOne({ serviceConfirmationNumber })
    .populate('createdByUser')
    .populate({
      path: 'jobsiteId',
      populate: [{ path: 'county' }, { path: 'createdByUser' }],
    });
  if (!scheduledTest) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  return scheduledTest;
};

/**
 * Check if Scheduled Test exist for given jobsite id
 * @param {String} jobsiteId
 * @returns {Promise<Jobsite>}
 */
const checkScheduledTestExistenceByJobisteId = async (jobsiteId) => {
  const scheduledTest = await ScheduledTest.findOne({ jobsiteId });

  return scheduledTest;
};

/**
 * Scheduled Test
 * @param {Object} scheduledTestObj
 * @param {Object} user
 * @returns {Promise<AdminSettings>}
 */
const scheduledTest = async (scheduledTestObj, file, user, jobsite) => {
  /**
   * Not Applicable (due to 1-many jobsite - scheduled test relationship update)
   * Checking if Scheduled Test already exist for this Jobsite Id
   */
  // const alreadyExistingScheduledTest = await getScheduledTestByJobsiteId(scheduledTestObj.jobsiteId);
  // if (alreadyExistingScheduledTest) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, messages.JobsiteAlreadyScheduled);
  // }

  const { newInstallationOrReplacement, rushFee } = scheduledTestObj;
  let scheduledTestModel = new ScheduledTest(scheduledTestObj);

  if (rushFee > 0) {
    scheduledTestModel.isRush = true;
  }

  /**
   * Calculating rank
   */
  scheduledTestModel.rank = 3 - Number(newInstallationOrReplacement === 'true') - Number(rushFee > 0);

  /**
   * Setting validUntilDate if its auto-renew jobsite
   */
  // if (jobsite.autoTestAnnually) {
  //   scheduledTestModel.validUntilDate = moment(scheduledTestObj.scheduledDate).add(1, 'year');
  // }

  /**
   * Net term User
   */
  if (user.isNetPaymentTermRequired) {
    scheduledTestModel.isNetTerms = true;

    /**
     * Handling duein
     */
    const usersPaymentTerm = user.netPaymentTerm.paymentTerms;
    const paymentTermValue = constants.PAYMENT_TERMS_TYPES[usersPaymentTerm];

    const dueInValue = new Date(scheduledTestModel.scheduledDate);
    dueInValue.setDate(dueInValue.getDate() + paymentTermValue);
    scheduledTestModel.dueIn = dueInValue;
  } else {
    /**
     * Regular User
     */

    // Mark scheduled test as paid if user is regular user
    scheduledTestModel.isPaid = true;

    const {
      stripeCustomerId,
      paymentMethodId,
      paymentIntentId,
      cardBrand,
      cardExpMonth,
      cardExpYear,
      cardLast4,
      paymentIntentAmount,
      paymentIntentCurrency,
      country,
      zipCode,
    } = scheduledTestObj;

    scheduledTestModel.stripe.paymentIntentId = paymentIntentId;
    scheduledTestModel.stripe.amount = paymentIntentAmount;
    scheduledTestModel.stripe.currency = paymentIntentCurrency;

    const userFetched = await userService.getUserById(user.id);
    userFetched.stripe.stripeCustomerId = stripeCustomerId;
    userFetched.stripe.paymentMethodId = paymentMethodId;
    userFetched.stripe.cardBrand = cardBrand;
    userFetched.stripe.cardExpMonth = cardExpMonth;
    userFetched.stripe.cardExpYear = cardExpYear;
    userFetched.stripe.cardLast4 = cardLast4;
    userFetched.stripe.country = country;
    userFetched.stripe.zipCode = zipCode;

    await userFetched.save();

    /**
     * Attatch Payment Method To Customer
     */
    await stripeService.attatchPaymentMethodToCustomer(stripeCustomerId, paymentMethodId);
  }

  /**
   * Generate unique serviceConfirmationNumber
   */
  let serviceConfirmationNumber;
  do {
    serviceConfirmationNumber = crypto.randomBytes(4).toString('hex');
  } while (await ScheduledTest.findOne({ serviceConfirmationNumber }));
  scheduledTestModel.serviceConfirmationNumber = serviceConfirmationNumber.toUpperCase();

  scheduledTestModel.reportFileUrl = file ? file.key : null;
  scheduledTestModel.createdByUser = user._id;

  scheduledTestModel = await scheduledTestModel.save();
  scheduledTestModel = await ScheduledTest.findById(scheduledTestModel._id).populate({
    path: 'jobsiteId',
    populate: [{ path: 'county' }, { path: 'createdByUser' }],
  });

  return scheduledTestModel;
};

/**
 * Update Schedule Test Status
 * @param {String} scheduledTestId
 * @param {String} newStatus
 * @param {String} details
 * @returns {Promise<AdminSettings>}
 */
const updateScheduleTestStatus = async (scheduledTestId, newStatus, details) => {
  let scheduledTestDoc = await getScheduledTestById(scheduledTestId);
  const { jobsiteId } = scheduledTestDoc;
  const { county } = jobsiteId;
  let isSendEmail = true;
  const oneBacklowFee = await getCostCalculation(scheduledTestDoc.jobsiteId.county, 1, scheduledTestDoc.createdByUser);

  let message = '';
  switch (newStatus) {
    case constants.ScheduledTestStasuses.pending:
      message = messages.ScheduledTestStatusPendingMessage();

      scheduledTestDoc.statusTracking[newStatus] = {
        time: new Date(),
        message,
      };
      scheduledTestDoc.currentStatus = constants.ScheduledTestStasuses.pending;

      // Not sending email for Pending
      isSendEmail = false;

      break;

    case constants.ScheduledTestStasuses.repairsNeeded:
      message = messages.ScheduledTestStatusRepairsNeededMessage();

      scheduledTestDoc.statusTracking[newStatus] = {
        time: new Date(),
        message,
        details,
      };
      scheduledTestDoc.currentStatus = constants.ScheduledTestStasuses.repairsNeeded;

      break;
    case constants.ScheduledTestStasuses.passed:
      message = messages.ScheduledTestStatusPassedMessage();

      // Updating lastTestDate in Jobsite here
      await jobsitesService.updateJobsiteLastTestDate(jobsiteId.id);

      scheduledTestDoc.statusTracking[newStatus] = {
        time: new Date(),
        message,
      };
      scheduledTestDoc.currentStatus = constants.ScheduledTestStasuses.passed;
      scheduledTestDoc.validUntilDate = moment().add(1, 'year');

      break;
    case constants.ScheduledTestStasuses.notAvailable:
      message = messages.ScheduledTestStatusNotAvailableMessage(oneBacklowFee);

      scheduledTestDoc.statusTracking[newStatus] = {
        time: new Date(),
        message,
      };
      scheduledTestDoc.currentStatus = constants.ScheduledTestStasuses.notAvailable;

      break;

    default:
      break;
  }

  scheduledTestDoc = await scheduledTestDoc.save();

  return {
    scheduledTestDoc,
    isSendEmail,
  };
};

/**
 * Apply Trip Fee on Schedule Test
 * @param {String} scheduledTestId
 * @returns {Promise<AdminSettings>}
 */
const applyTripFee = async (scheduledTestId, user) => {
  const logMessage = messages.ChargedCustomerATripFee;
  let scheduledTestDoc = await getScheduledTestById(scheduledTestId);
  const { createdByUser } = scheduledTestDoc.jobsiteId;
  // const oneTripFee = getTripFeeFromScheduledTests(scheduledTestDoc);
  const oneTripFee = await getCostCalculation(scheduledTestDoc.jobsiteId.county, 1, createdByUser);
  const logsDescription = `$${parseFloat(oneTripFee).toFixed(2)}`;
  let tripFeeChargeResp;

  scheduledTestDoc.total += oneTripFee;
  scheduledTestDoc = await scheduledTestDoc.save();

  /**
   * Charge User for the trip fee using stripe using county.rateForCounty
   * Create Log request for succss/failure of payment
   */
  if (!createdByUser.isNetPaymentTermRequired) {
    tripFeeChargeResp = await stripeService.chargeCustomer(
      createdByUser.stripe.stripeCustomerId,
      createdByUser.stripe.paymentMethodId,
      oneTripFee
    );
  }

  /**
   * Creating Log Message
   */
  await requestLogService.createRequestLog(scheduledTestId, user.fullName, logMessage, logsDescription);

  /**
   * Notify user using email
   */
  // const emailObj = {
  //   message: logMessage,
  //   jobsiteName: scheduledTestDoc.jobsiteId.name,
  //   logsDescription,
  // };
  // await notifyUserService.chargedTripFee(scheduledTestDoc.email, emailObj);

  return {
    scheduledTestDoc,
    tripFeeChargeResp,
  };
};

/**
 * Add Extra Test
 * @param {String} scheduledTestId
 * @returns {Promise<AdminSettings>}
 */
const addExtraTest = async (scheduledTestId, newNumberOfBackflows, adminUser) => {
  let scheduledTestDoc = await getScheduledTestById(scheduledTestId);
  const { createdByUser } = scheduledTestDoc.jobsiteId;
  let extraTestsChargeResp;

  // const oneTripFee = getTripFeeFromScheduledTests(scheduledTestDoc);
  const oneTripFee = await getCostCalculation(
    scheduledTestDoc.jobsiteId.county,
    parseInt(newNumberOfBackflows, 10),
    createdByUser
  );

  const total = parseFloat((oneTripFee * newNumberOfBackflows).toFixed(2));

  const logMessage = messages.AditionalTestsFee;
  const logsDescription = `${newNumberOfBackflows} TESTS - $${total}`;

  scheduledTestDoc.numberOfBackflows += newNumberOfBackflows;
  scheduledTestDoc.backflowTestFee += total;
  scheduledTestDoc.total += total;

  scheduledTestDoc = await scheduledTestDoc.save();

  /**
   * Charge User for the trip fee for newNumberOfBackflows using stripe using county.rateForCounty
   * Create Log request for succss/failure of payment
   */
  if (!createdByUser.isNetPaymentTermRequired) {
    extraTestsChargeResp = await stripeService.chargeCustomer(
      createdByUser.stripe.stripeCustomerId,
      createdByUser.stripe.paymentMethodId,
      total
    );
  }

  /**
   * Creating Log Message
   */
  await requestLogService.createRequestLog(scheduledTestId, adminUser.fullName, logMessage, logsDescription);

  /**
   * Notify user using email
   */
  // const emailObj = {
  //   message: logMessage,
  //   jobsiteName: scheduledTestDoc.jobsiteId.name,
  //   logsDescription,
  // };
  // await notifyUserService.addExtraTest(scheduledTestDoc.email, emailObj);

  return {
    scheduledTestDoc,
    extraTestsChargeResp,
  };
};

/**
 * Confirm Request
 * @param {String} scheduledTestId
 * @returns {Promise<AdminSettings>}
 */
const confirmRequest = async (confirmReqBody, user) => {
  const { scheduleTestId, technician } = confirmReqBody;
  const scheduledTestDoc = await getScheduledTestById(scheduleTestId);
  const message = messages.ScheduledTestStatusScheduledMessage(technician);

  scheduledTestDoc.statusTracking.scheduled = {
    time: new Date(),
    message,
  };
  scheduledTestDoc.currentStatus = constants.ScheduledTestStasuses.scheduled;
  await scheduledTestDoc.save();

  await teamUpService.createEventOnSubCalendar(confirmReqBody);

  const logMessage = messages.ScheduleTestRequestConfirmed;

  /**
   * Creating Log Message
   */
  await requestLogService.createRequestLog(scheduleTestId, user.fullName, logMessage);

  return scheduledTestDoc;
};

/**
 * Reshedule Request
 * @param {String} scheduledTestId
 * @param {String} date
 * @param {String} preferredTime
 * @returns {Promise<AdminSettings>}
 */
const resheduleRequest = async (scheduledTestId, date, preferredTime, user) => {
  const scheduledTestDoc = await getScheduledTestById(scheduledTestId);
  scheduledTestDoc.scheduledDate = date;
  scheduledTestDoc.preferredScheduledTime = preferredTime;

  scheduledTestDoc.currentStatus = constants.ScheduledTestStasuses.pending;
  scheduledTestDoc.statusTracking = {
    pending: {
      time: new Date(),
      message: messages.ScheduledTestStatusPendingMessage(),
    },
    scheduled: {
      time: null,
      message: null,
    },
    repairsNeeded: {
      time: null,
      message: null,
      details: null,
    },
    passed: {
      time: null,
      message: null,
    },
    notAvailable: {
      time: null,
      message: null,
    },
  };

  /**
   * Calculating Rush fee
   */
  const { rushFee } = await settingsService.getAllAdminSettings();
  const newScheduledDate = new Date(date);
  const currentDate = new Date();
  const timeDifferenceInHours = (newScheduledDate - currentDate) / (1000 * 60 * 60);

  // Setting the rush fee based on the time difference
  if (timeDifferenceInHours < 48) {
    scheduledTestDoc.rushFee = rushFee;
  } else {
    scheduledTestDoc.rushFee = 0;
  }

  await scheduledTestDoc.save();
  const logMessage = messages.ScheduleTestRescheduled.toUpperCase();
  const logsDescription = '';

  /**
   * Creating Log Message
   */
  await requestLogService.createRequestLog(scheduledTestId, user.fullName, logMessage, logsDescription);

  /**
   * Notify user using email
   */
  // const emailObj = {
  //   message: logMessage,
  //   jobsiteName: scheduledTestDoc.jobsiteId.name,
  //   logsDescription,
  //   newDate: date,
  //   newTime: preferredTime,
  // };
  // await notifyUserService.scheduledTestReschedule(scheduledTestDoc.email, emailObj);

  return scheduledTestDoc;
};

/**
 * Delete Scheduled Tests by User Id
 * @param {String} createdByUser
 * @returns {Promise<Jobsite>}
 */
const deleteScheduledTestsByUserId = async (createdByUser) => {
  await ScheduledTest.deleteMany({ createdByUser });
};

/**
 * Delete Scheduled Tests by Jobsite Id
 * @param {String} jobsiteId
 * @returns {Promise<Jobsite>}
 */
const deleteScheduledTestByJobsiteId = async (jobsiteId) => {
  await ScheduledTest.deleteMany({ jobsiteId });
};

/**
 * Delete Scheduled Test Id
 * @param {String} scheduledTestId
 * @returns {Promise<Jobsite>}
 */
const deleteScheduledTestById = async (scheduledTestId) => {
  await ScheduledTest.deleteOne({ _id: scheduledTestId });
};

/**
 * Create Payment Intent
 * @param {Object} user
 * @param {Number} amount
 * @returns {Promise<Jobsite>}
 */
const createPaymentIntent = async (user, amount) => {
  let customerId = null;

  if (!user.stripe.stripeCustomerId) {
    // Step 1: Create a new customer with Stripe
    const customer = await stripeService.createStripeCustomer(user.email);
    customerId = customer.id;
  } else {
    customerId = user.stripe.stripeCustomerId;
  }

  // Step 2: Create a payment intent
  const paymentIntent = await stripeService.createPaymentIntent(amount, customerId);

  return {
    clientSecret: paymentIntent.client_secret,
    stripeCustomerId: customerId,
  };
};

/**
 * Toggle Scheduled Test Paid State
 * @param {String} scheduledTestId
 * @returns {Promise<Jobsite>}
 */
const toggleScheduledTestPaidState = async (scheduledTestId, newState) => {
  let scheduledTestModel = await ScheduledTest.findById(scheduledTestId);
  scheduledTestModel.isPaid = newState === 'true';

  scheduledTestModel = await scheduledTestModel.save();

  return scheduledTestModel;
};

/**
 * Get Total Revenue
 * @returns {Promise<Number>}
 */
const getTotalRevenue = async () => {
  const totalRevenue = await ScheduledTest.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
      },
    },
    {
      $project: {
        totalRevenue: {
          $round: ['$totalRevenue', 2],
        },
      },
    },
  ]);

  return totalRevenue;
};

/**
 * Get Total Tests
 * @returns {Promise<Number>}
 */
const getTotalTests = async () => {
  const totalTests = await ScheduledTest.countDocuments();

  return totalTests;
};

/**
 * Mark Request as Expired
 * @param {String} scheduledTestId
 * @returns {Promise<Jobsite>}
 */
const markRequestAsExpired = async (scheduledTestId) => {
  let scheduledTestDoc = await ScheduledTest.findById(scheduledTestId);
  scheduledTestDoc.statusTracking.expired = {
    time: new Date(),
    message: '',
  };
  scheduledTestDoc.currentStatus = constants.ScheduledTestStasuses.expired;

  scheduledTestDoc = await scheduledTestDoc.save();

  return scheduledTestDoc;
};

module.exports = {
  getAllScheduledTests,
  queryScheduledTests,
  queryScheduledTestsAggregated,
  getScheduledTestById,
  getScheduledTestByServiceConfirmationNumber,
  getAllScheduledTestsByUserId,
  getCostCalculation,
  checkScheduledTestExistenceByJobisteId,
  scheduledTest,
  updateScheduleTestStatus,
  applyTripFee,
  addExtraTest,
  confirmRequest,
  resheduleRequest,
  deleteScheduledTestsByUserId,
  deleteScheduledTestByJobsiteId,
  deleteScheduledTestById,
  createPaymentIntent,
  toggleScheduledTestPaidState,
  getTotalRevenue,
  getTotalTests,
  markRequestAsExpired,
};
