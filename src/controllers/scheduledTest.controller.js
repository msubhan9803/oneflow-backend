/* eslint-disable no-restricted-syntax */
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const moment = require('moment');
const agenda = require('../lib/agenda');
const ApiError = require('../utils/ApiError');
const messages = require('../utils/message');
const constants = require('../utils/constants');
const notificationService = require('../services/notification.service');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const {
  scheduledTestService,
  notifyUserService,
  requestLogService,
  reportService,
  jobsiteService,
  countyService,
  userService,
  backflowService,
  settingsService,
  stripeService,
} = require('../services');
const { scheduledTestHelper } = require('../helpers/scheduledTestHelper');

const getScheduledTestById = catchAsync(async (req, res) => {
  try {
    const jobsite = await scheduledTestService.getScheduledTestById(req.params.scheduledTestId);
    if (!jobsite) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
    }
    res.send(jobsite);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getScheduledTestByServiceConfirmationNumber = catchAsync(async (req, res) => {
  try {
    const jobsite = await scheduledTestService.getScheduledTestByServiceConfirmationNumber(
      req.params.serviceConfirmationNumber
    );
    if (!jobsite) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
    }
    res.send(jobsite);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getAllExistingScheduledTests = catchAsync(async (req, res) => {
  try {
    const filter = pick(req.query, ['search', 'newInstallationOrReplacement', 'isRush', 'currentStatus']);
    const caseInsensitiveFilter = {
      isEnabled: true,
    };

    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    const aggregateQuery = [
      { $match: caseInsensitiveFilter },
      {
        $lookup: {
          from: 'jobsites',
          localField: 'jobsiteId',
          foreignField: '_id',
          as: 'jobsiteId',
        },
      },
      { $unwind: '$jobsiteId' },
      {
        $lookup: {
          from: 'counties',
          localField: 'jobsiteId.county',
          foreignField: '_id',
          as: 'jobsiteId.county',
        },
      },
      { $unwind: '$jobsiteId.county' },
      {
        $lookup: {
          from: 'users',
          localField: 'createdByUser',
          foreignField: '_id',
          as: 'createdByUser',
        },
      },
      { $unwind: '$createdByUser' },
      {
        $addFields: {
          id: '$_id',
          'jobsiteId.id': '$jobsiteId._id',
          'jobsiteId.county.id': '$jobsiteId.county._id',
          'createdByUser.id': '$createdByUser._id',
        },
      },
    ];

    if (filter.search) {
      aggregateQuery.push({
        $match: {
          $or: [
            { primaryContactName: { $regex: new RegExp(filter.search, 'i') } },
            { serviceConfirmationNumber: { $regex: new RegExp(filter.search, 'i') } },
            { phoneNumber: { $regex: new RegExp(filter.search, 'i') } },
            { rank: { $eq: filter.search } },
            { 'jobsiteId.streetAddress': { $regex: new RegExp(filter.search, 'i') } },
            { preferredScheduledTime: { $eq: filter.search } },
            { currentStatus: { $regex: new RegExp(filter.search, 'i') } },
            {
              $expr: {
                $regexMatch: {
                  input: {
                    $concat: [
                      {
                        $substr: [
                          {
                            $arrayElemAt: [
                              ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                              { $subtract: [{ $month: '$scheduledDate' }, 1] },
                            ],
                          },
                          0,
                          3,
                        ],
                      },
                      ' ',
                      { $toString: { $dayOfMonth: '$scheduledDate' } },
                      ', ',
                      { $toString: { $year: '$scheduledDate' } },
                    ],
                  },
                  regex: new RegExp(filter.search, 'i'),
                },
              },
            },
          ],
        },
      });
    }

    if (filter.newInstallationOrReplacement) {
      aggregateQuery.push({
        $match: {
          $or: [{ newInstallationOrReplacement: { $eq: filter.newInstallationOrReplacement === 'true' } }],
        },
      });
    }

    if (filter.isRush) {
      aggregateQuery.push({
        $match: {
          $or: [{ isRush: { $eq: filter.isRush === 'true' } }],
        },
      });
    }

    if (filter.currentStatus) {
      aggregateQuery.push({
        $match: { currentStatus: { $eq: filter.currentStatus } },
      });
    }

    const result = await scheduledTestService.queryScheduledTestsAggregated(caseInsensitiveFilter, options, aggregateQuery);

    res.send(result);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getMyAllScheduledTests = catchAsync(async (req, res) => {
  try {
    const filter = pick(req.query, ['search', 'newInstallationOrReplacement', 'isRush', 'currentStatus']);
    const caseInsensitiveFilter = {
      isEnabled: true,
      createdByUser: mongoose.Types.ObjectId(req.user._id),
    };

    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    const aggregateQuery = [
      { $match: caseInsensitiveFilter },
      {
        $lookup: {
          from: 'jobsites',
          localField: 'jobsiteId',
          foreignField: '_id',
          as: 'jobsiteId',
        },
      },
      { $unwind: '$jobsiteId' },
      {
        $lookup: {
          from: 'counties',
          localField: 'jobsiteId.county',
          foreignField: '_id',
          as: 'jobsiteId.county',
        },
      },
      { $unwind: '$jobsiteId.county' },
      {
        $lookup: {
          from: 'users',
          localField: 'createdByUser',
          foreignField: '_id',
          as: 'createdByUser',
        },
      },
      { $unwind: '$createdByUser' },
      {
        $addFields: {
          id: '$_id',
          'jobsiteId.id': '$jobsiteId._id',
          'jobsiteId.county.id': '$jobsiteId.county._id',
          'createdByUser.id': '$createdByUser._id',
        },
      },
    ];

    if (filter.search) {
      aggregateQuery.push({
        $match: {
          $or: [
            { primaryContactName: { $regex: new RegExp(filter.search, 'i') } },
            { serviceConfirmationNumber: { $regex: new RegExp(filter.search, 'i') } },
            { phoneNumber: { $regex: new RegExp(filter.search, 'i') } },
            { rank: { $eq: filter.search } },
            { 'jobsiteId.streetAddress': { $regex: new RegExp(filter.search, 'i') } },
            { preferredScheduledTime: { $eq: filter.search } },
            { currentStatus: { $regex: new RegExp(filter.search, 'i') } },
            {
              $expr: {
                $regexMatch: {
                  input: {
                    $concat: [
                      {
                        $substr: [
                          {
                            $arrayElemAt: [
                              ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                              { $subtract: [{ $month: '$scheduledDate' }, 1] },
                            ],
                          },
                          0,
                          3,
                        ],
                      },
                      ' ',
                      { $toString: { $dayOfMonth: '$scheduledDate' } },
                      ', ',
                      { $toString: { $year: '$scheduledDate' } },
                    ],
                  },
                  regex: new RegExp(filter.search, 'i'),
                },
              },
            },
          ],
        },
      });
    }

    if (filter.newInstallationOrReplacement) {
      aggregateQuery.push({
        $match: {
          $or: [{ newInstallationOrReplacement: { $eq: filter.newInstallationOrReplacement === 'true' } }],
        },
      });
    }

    if (filter.isRush) {
      aggregateQuery.push({
        $match: {
          $or: [{ isRush: { $eq: filter.isRush === 'true' } }],
        },
      });
    }

    if (filter.currentStatus) {
      aggregateQuery.push({
        $match: { currentStatus: { $eq: filter.currentStatus } },
      });
    }

    const result = await scheduledTestService.queryScheduledTestsAggregated(caseInsensitiveFilter, options, aggregateQuery);

    res.send(result);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getCostCalculation = catchAsync(async (req, res) => {
  try {
    const { jobsiteId, numberOfBackflow } = req.query;
    const jobsite = await jobsiteService.getJobsiteById(jobsiteId);
    const countyDoc = await countyService.getCountyById(jobsite.county);
    const user = await userService.getUserById(req.user._id);
    const ratePerBackflowTest = await scheduledTestService.getCostCalculation(
      countyDoc,
      parseInt(numberOfBackflow, 10),
      user
    );

    res.status(httpStatus.OK).send({ ratePerBackflowTest });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getAllScheduledTestsByUserId = catchAsync(async (req, res) => {
  try {
    const result = await scheduledTestService.getAllScheduledTestsByUserId(req.params.userId);

    res.send(result);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getAllRequestLogsByScheduledId = catchAsync(async (req, res) => {
  try {
    const result = await requestLogService.getAllRequestLogsByScheduledId(req.params.scheduledTestId);

    res.send(result);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const scheduledATest = catchAsync(async (req, res) => {
  try {
    const { file } = req;
    const jobsite = await jobsiteService.getJobsiteById(req.body.jobsiteId);
    const scheduledTestRes = await scheduledTestService.scheduledTest(req.body, file, req.user, jobsite);

    /**
     * Updating User's credit points
     */
    await userService.updateCreditPointByUserId(scheduledTestRes.createdByUser, req.body.remainingCredit);

    /**
     * Running scheduled test helper
     */
    const agendaInstance = await agenda.getAgendaInstance();
    await scheduledTestHelper(scheduledTestRes, jobsite, agendaInstance);

    res.status(httpStatus.CREATED).send(scheduledTestRes);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const updateScheduleTestStatus = catchAsync(async (req, res) => {
  try {
    const { scheduledTestId, newStatus, details } = req.query;
    const { scheduledTestDoc, isSendEmail } = await scheduledTestService.updateScheduleTestStatus(
      scheduledTestId,
      newStatus,
      details,
      req.user
    );
    const jobsite = await jobsiteService.getJobsiteById(scheduledTestDoc.jobsiteId);

    const currentStatus = scheduledTestDoc.currentStatus.replace(/([A-Z])/g, ' $1').toUpperCase();
    const logMessage = `${messages.RequestLogStatusUpdatedTo} ${currentStatus}`;

    /**
     * Creating Log Message
     */
    await requestLogService.createRequestLog(scheduledTestId, req.user.fullName, logMessage);

    /**
     * * * * * * * * * * * *
     * Scheduling agenda jobs
     * * * * * * * * * * * *
     */
    if (scheduledTestDoc.currentStatus === constants.ScheduledTestStasuses.passed) {
      const agendaInstance = await agenda.getAgendaInstance();

      // const validUntilDateJobDate = scheduledTestDoc.validUntilDate;
      const validUntilDateJobDate = moment().add(2, 'minutes');
      console.log('Valid Until Date');
      console.log(validUntilDateJobDate.format('llll'));
      console.log(' ');

      if (jobsite.autoTestAnnually) {
        const jobData = {
          scheduledTestId: scheduledTestDoc._id,
        };

        /**
         * Auto Renew On Reminder Before 10 Days
         */
        const jobExecutionDateBefore10Days = moment(validUntilDateJobDate).subtract(10, process.env.AGENDA_JOB_UNIT);
        await agendaInstance.schedule(
          jobExecutionDateBefore10Days,
          constants.agendaJobs.auto_renew_on_before_10_days,
          jobData
        );

        /**
         * Auto Renew On Reminder Before 5 Days
         */
        const jobExecutionDateBefore5Days = moment(validUntilDateJobDate).subtract(5, process.env.AGENDA_JOB_UNIT);
        await agendaInstance.schedule(
          jobExecutionDateBefore5Days,
          constants.agendaJobs.auto_renew_on_before_5_days,
          jobData
        );

        console.log('Auto Renew On Reminder Before 10 Days');
        console.log('Job Execution Date Before 10 Days');
        console.log(jobExecutionDateBefore10Days.format('llll'));
        console.log(' ');

        console.log('Auto Renew On Reminder Before 5 Days');
        console.log('Job Execution Date Before 5 Days');
        console.log(jobExecutionDateBefore5Days.format('llll'));
        console.log(' ');
      } else {
        const jobData = {
          scheduledTestId: scheduledTestDoc._id,
        };

        /**
         * Auto Renew Off Reminder Before 5 Days
         */
        const jobExecutionDateBefore5Days = moment(validUntilDateJobDate).subtract(5, process.env.AGENDA_JOB_UNIT);
        await agendaInstance.schedule(
          jobExecutionDateBefore5Days,
          constants.agendaJobs.auto_renew_off_before_5_days,
          jobData
        );

        await agendaInstance.schedule(moment(validUntilDateJobDate), constants.agendaJobs.mark_request_as_expired, jobData);

        console.log('Auto Renew Off Reminder Before 5 Days');
        console.log('Job Execution Date Before 5 Days');
        console.log(jobExecutionDateBefore5Days.format('llll'));
        console.log(' ');
      }
    }

    /**
     * Notify user using email
     * isSendEmail = false for pending
     * isSendEmail = true for repairsNeeded, passed, notAvailable
     */
    if (isSendEmail) {
      let subject = null;
      let message = null;
      let scheduledTestEmailObj = null;
      let type = null;
      let status = null;

      const checkStatusLink = `${process.env.FRONTEND_URL}/check-status?id=${scheduledTestDoc.serviceConfirmationNumber}`;
      switch (newStatus) {
        case constants.ScheduledTestStasuses.repairsNeeded:
          type = constants.ScheduledTestStasuses.repairsNeeded;
          subject = 'One Flow - Repairs Needed';
          message = `The status for service request #“${scheduledTestDoc.serviceConfirmationNumber}” was changed to: REPAIRS NEEDED`;
          status = 'Repairs Needed';

          scheduledTestEmailObj = {
            subject,
            message,
            details: scheduledTestDoc.statusTracking.repairsNeeded.details,
            checkStatusLink,
          };

          break;
        case constants.ScheduledTestStasuses.passed:
          type = constants.ScheduledTestStasuses.passed;
          subject = 'One Flow - Passed';
          message = `The status for service request #“${scheduledTestDoc.serviceConfirmationNumber}” was changed to: Passed`;
          status = 'Passed';

          scheduledTestEmailObj = {
            subject,
            message,
            details: scheduledTestDoc.statusTracking.passed.message,
            checkStatusLink,
          };

          break;
        case constants.ScheduledTestStasuses.notAvailable:
          type = constants.ScheduledTestStasuses.notAvailable;
          subject = 'One Flow - Not Available';
          message = `The status for service request #“${scheduledTestDoc.serviceConfirmationNumber}” was changed to: Not Available`;
          status = 'Not Available';

          scheduledTestEmailObj = {
            subject,
            message,
            details: scheduledTestDoc.statusTracking.notAvailable.message,
            checkStatusLink,
          };

          break;

        default:
          break;
      }

      await notifyUserService.updatedScheduleTestStatus(scheduledTestDoc.email, scheduledTestEmailObj, type);

      /**
       * Notify user using database Notification
       */
      const NOTIFICATION_TITLE = constants.NOTIFICATION_STATE_TYPES.STATUS_UPDATE.replaceAll('_', ' ');
      const bodyText = `Service request #${scheduledTestDoc.serviceConfirmationNumber} ${status}!`;
      await notificationService.createNotificationForUser(
        constants.NOTIFICATION_STATE_TYPES.STATUS_UPDATE,
        scheduledTestDoc.createdByUser,
        NOTIFICATION_TITLE,
        bodyText,
        {
          redirectUrl: `${process.env.FRONTEND_URL}/request/${scheduledTestDoc.serviceConfirmationNumber}`,
        }
      );
    }

    res.status(httpStatus.OK).send({ message: messages.StatusUpdatedSuccessfully });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const confirmRequest = catchAsync(async (req, res) => {
  try {
    const scheduledTestRes = await scheduledTestService.confirmRequest(req.body, req.user);
    const jobsiteName = scheduledTestRes.jobsiteId.name;

    /**
     * Notify user using email
     */
    const checkStatusLink = `${process.env.FRONTEND_URL}/check-status?id=${scheduledTestRes.serviceConfirmationNumber}`;
    const scheduledTestEmailObj = {
      subject: `One Flow - Your request has been confirmed`,
      message: `The service request #${scheduledTestRes.serviceConfirmationNumber} has been confirmed.`,
      serviceConfirmationNumber: scheduledTestRes.serviceConfirmationNumber,
      jobsiteName,
      streetAddress: scheduledTestRes.jobsiteId.streetAddress,
      confirmedDate: moment(req.body.startDate).format('MM-DD-YYYY'),
      confirmedTime: req.body.startTime,
      numberOfBackflows: scheduledTestRes.numberOfBackflows,
      checkStatusLink,
    };
    await notifyUserService.confirmRequestNotify(scheduledTestRes.email, scheduledTestEmailObj);

    /**
     * Notify user using database Notification
     */
    const NOTIFICATION_TITLE = constants.NOTIFICATION_STATE_TYPES.REQUEST_CONFIRMATION.replaceAll('_', ' ');
    const bodyText = `Service for request #${scheduledTestRes.serviceConfirmationNumber} has been confirmed for ${moment(
      scheduledTestRes.statusTracking.scheduled.time
    ).format('MM-DD-YYYY')} at ${moment(scheduledTestRes.statusTracking.scheduled.time).format(
      'hh:mm A'
    )}. We'll see you soon!`;
    await notificationService.createNotificationForUser(
      constants.NOTIFICATION_STATE_TYPES.REQUEST_CONFIRMATION,
      scheduledTestRes.createdByUser,
      NOTIFICATION_TITLE,
      bodyText,
      {
        redirectUrl: `${process.env.FRONTEND_URL}/request/${scheduledTestRes.serviceConfirmationNumber}`,
      }
    );

    res.status(httpStatus.OK).send({ message: messages.ScheduleTestRequestConfirmed });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const applyTripFee = catchAsync(async (req, res) => {
  try {
    const { scheduledTestId } = req.query;
    await scheduledTestService.applyTripFee(scheduledTestId, req.user);

    res.status(httpStatus.OK).send({ message: messages.TripFeeChargedSuccessfully });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const addExtraTest = catchAsync(async (req, res) => {
  try {
    const { scheduledTestId, numberOfExtraBackflows } = req.query;
    await scheduledTestService.addExtraTest(scheduledTestId, parseInt(numberOfExtraBackflows, 10), req.user);

    res.status(httpStatus.OK).send({ message: messages.BackflowTestExtendedSuccessfully });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const resheduleRequest = catchAsync(async (req, res) => {
  try {
    const { scheduledTestId, date, preferredTime } = req.query;
    await scheduledTestService.resheduleRequest(scheduledTestId, date, preferredTime, req.user);

    res.status(httpStatus.OK).send({ message: messages.ScheduleTestRescheduled });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const createPaymentIntent = catchAsync(async (req, res) => {
  try {
    const paymentIntentResp = await scheduledTestService.createPaymentIntent(req.user, req.query.total);

    res.status(httpStatus.OK).send({ ...paymentIntentResp });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const toggleScheduledTestPaidState = catchAsync(async (req, res) => {
  try {
    const scheduledTest = await scheduledTestService.toggleScheduledTestPaidState(
      req.query.scheduledTestId,
      req.query.newState
    );

    res.status(httpStatus.OK).send({ message: scheduledTest.isPaid ? messages.MarkedAsPaid : messages.MarkedAsUnpaid });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const deleteScheduledTestById = catchAsync(async (req, res) => {
  try {
    const { scheduledTestId } = req.params;

    /**
     * Deteling scheduled Test (completely)
     */
    await scheduledTestService.deleteScheduledTestById(scheduledTestId);

    /**
     * Deteling report (completely)
     */
    await reportService.deleteReportByScheduledRef(scheduledTestId);

    /**
     * Deteling report (completely)
     */
    await backflowService.deleteBackflowTestsByScheduledTestRef(scheduledTestId);

    res.status(httpStatus.OK).send({ message: messages.ResourceDeletedSuccessfully });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const rescheduleTest = catchAsync(async (req, res) => {
  try {
    const { previousRequestNumber } = req.query;

    const {
      _id,
      jobsiteId,
      createdByUser,
      primaryContactName,
      phoneNumber,
      email,
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
    } = await scheduledTestService.getScheduledTestByServiceConfirmationNumber(previousRequestNumber);
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
    const newScheduledDate = moment();
    const newValidDate = moment().add(1, 'year');

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
    const { rushFee, tax, serviceFee } = await settingsService.getAllAdminSettings();

    /**
     * Totat
     * rushFee = 0 as not in rush
     */
    const creditPoints = user.creditPoint || 0;
    const total = Math.max(0 + tax + serviceFee + updatedBackflowTestCost - creditPoints, 0);
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
      rushFee,
      tax,
      serviceFee,
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

    /**
     * Cancel Mark as Expired job
     */
    const agendaInstance = await agenda.getAgendaInstance();
    agendaInstance.cancel(
      { 'data.scheduledTestId': _id, name: constants.agendaJobs.mark_request_as_expired },
      (err, numRemoved) => {
        if (err) {
          console.error('Error cancelling job:', err);
        } else {
          console.log(`Removed ${numRemoved} jobs`);
        }
      }
    );

    res.status(httpStatus.OK).send(scheduledTestRes);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

module.exports = {
  getScheduledTestById,
  getMyAllScheduledTests,
  getScheduledTestByServiceConfirmationNumber,
  getAllExistingScheduledTests,
  getAllRequestLogsByScheduledId,
  getCostCalculation,
  scheduledATest,
  scheduledTestHelper,
  updateScheduleTestStatus,
  applyTripFee,
  addExtraTest,
  confirmRequest,
  resheduleRequest,
  getAllScheduledTestsByUserId,
  createPaymentIntent,
  toggleScheduledTestPaidState,
  deleteScheduledTestById,
  rescheduleTest,
};
