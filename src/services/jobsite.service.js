const httpStatus = require('http-status');
const { Jobsite } = require('../models');
const ApiError = require('../utils/ApiError');
const messages = require('../utils/message');
const constants = require('../utils/constants');
const subscriptionService = require('./subscription.service');
const userService = require('./user.service');

/**
 * Query for jobsites
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryJobsites = async (filter, options) => {
  const jobsites = await Jobsite.paginate(filter, options);
  return jobsites;
};

/**
 * Get jobsite by id
 * @param {String} jobsiteId
 * @returns {Promise<Jobsite>}
 */
const getJobsiteById = async (jobsiteId) => {
  const jobsite = await Jobsite.findById(jobsiteId).populate('county');
  if (!jobsite) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  return jobsite;
};

/**
 * Get All Jobsites
 * @returns {Promise<Array<Jobsite>>}
 */
const getAllJobsites = async () => {
  const jobsites = await Jobsite.find();
  return jobsites;
};

/**
 * Create jobsite
 * @param {Object} jobsiteObj
 * @param {String} userId
 * @returns {Promise<Jobsite>}
 */
const createJobsite = async (jobsiteObj, userId) => {
  const existingJobsite = await Jobsite.findOne({ name: jobsiteObj.name });
  if (existingJobsite) {
    throw new ApiError(httpStatus.BAD_REQUEST, messages.JobsiteAlreadyExists);
  }

  const userJobsitesCount = await Jobsite.countDocuments({ createdByUser: userId });
  const user = await userService.getUserById(userId);

  /**
   * Check if user has remaining jobsites
   */
  if (user.role !== 'admin') {
    await subscriptionService.checkUserRemainingSubscriptions(userId, userJobsitesCount);
  }

  let jobsite = new Jobsite(jobsiteObj);
  jobsite.createdByUser = userId;

  jobsite = await jobsite.save();
  return jobsite;
};

/**
 * Update jobsite
 * @param {Object} jobsiteObj
 * @param {String} userId
 * @returns {Promise<Jobsite>}
 */
const updateJobsite = async (jobsiteObj, userId) => {
  const jobsite = await Jobsite.findById(jobsiteObj.id);
  const jobsiteUserId = jobsite.createdByUser.toString();

  if (jobsite.name !== jobsiteObj.name) {
    const existingJobsiteByName = await Jobsite.findOne({ name: jobsiteObj.name });
    if (existingJobsiteByName) {
      throw new ApiError(httpStatus.BAD_REQUEST, messages.JobsiteAlreadyExists);
    }
  }

  const jobsiteUser = await userService.getUserById(jobsiteUserId);
  const currentUser = await userService.getUserById(userId);

  if (jobsiteUser.role === 'admin' && currentUser.role !== 'admin') {
    throw new ApiError(httpStatus.UNAUTHORIZED, messages.UnauthorizedAccess);
  }

  if (!jobsite) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  Object.assign(jobsite, jobsiteObj);

  await jobsite.save();
  return jobsite;
};

/**
 * Delete jobsite
 * @param String jobsiteId
 * @returns {Promise<Jobsite>}
 */
const deleteJobsite = async (jobsiteId, userId) => {
  const jobsite = await Jobsite.findById(jobsiteId);

  if (!jobsite) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  const jobsiteUser = await userService.getUserById(jobsite.createdByUser);
  const currentUser = await userService.getUserById(userId);

  if (jobsiteUser.role === 'admin' && currentUser.role !== 'admin') {
    throw new ApiError(httpStatus.UNAUTHORIZED, messages.UnauthorizedAccess);
  }

  const jobsiteOwner = jobsite.createdByUser.toString();

  if (currentUser.role !== 'admin' && jobsiteOwner !== userId.toString()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, messages.UnauthorizedAccess);
  }

  await Jobsite.deleteOne({ _id: jobsiteId });
};

/**
 * Get User Jobsite Analytics UnderPlan
 * @param {String} userId
 * @returns {Promise<Jobsite>}
 */
const getUserJobsiteAnalyticsUnderPlan = async (userId) => {
  const inUseJobCount = await Jobsite.countDocuments({
    createdByUser: userId,
    status: constants.JOBSITE_STATUS_TYPES.inUse,
  });
  const user = await userService.getUserById(userId);

  return {
    inUseJobCount,
    userPlanMaxJobsites: user.currentSubscriptionPlan.maxJobsites,
  };
};

/**
 * Update jobsite lastTestDate value
 * @param {String} userId
 * @returns {Promise<Jobsite>}
 */
const updateJobsiteLastTestDate = async (jobsiteId) => {
  const jobsite = await getJobsiteById(jobsiteId);
  jobsite.lastTestDate = new Date();

  await jobsite.save();
};

/**
 * Updating Jobsite status to In Use
 * @param {String} jobsiteId
 * @returns {Promise<Jobsite>}
 */
const updateJobsiteSiteToInUse = async (jobsiteId) => {
  const jobsite = await getJobsiteById(jobsiteId);
  jobsite.status = constants.JOBSITE_STATUS_TYPES.inUse;

  await jobsite.save();
};

/**
 * Delete Jobsites By UserId
 * @param {String} createdByUser
 * @returns {Promise<Jobsite>}
 */
const deleteJobsitesByUserId = async (createdByUser) => {
  await Jobsite.deleteMany({ createdByUser });
};

/**
 * Get User Jobsites Count
 * @param {String} createdByUser
 * @returns {Promise<Jobsite>}
 */
const getUserJobsiteCount = async (createdByUser) => {
  return Jobsite.countDocuments({ createdByUser });
};

module.exports = {
  getJobsiteById,
  getAllJobsites,
  createJobsite,
  updateJobsite,
  deleteJobsite,
  queryJobsites,
  getUserJobsiteAnalyticsUnderPlan,
  updateJobsiteLastTestDate,
  updateJobsiteSiteToInUse,
  deleteJobsitesByUserId,
  getUserJobsiteCount,
};
