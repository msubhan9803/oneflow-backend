const httpStatus = require('http-status');
const { Subscription, User } = require('../models');
const ApiError = require('../utils/ApiError');
const constants = require('../utils/constants');
const messages = require('../utils/message');
const userService = require('./user.service');

/**
 * Get subscription by id
 * @param {String} subscriptionId
 * @returns {Promise<Subscription>}
 */
const getSubscriptionById = async (subscriptionId) => {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  return subscription;
};

/**
 * Get All Subscriptions
 * @returns {Promise<Array<Subscription>>}
 */
const getAllSubscriptions = async () => {
  const subscriptions = await Subscription.find();
  return subscriptions;
};

/**
 * Post subscription
 * @param {Object} subscriptionObj
 * @returns {Promise<Subscription>}
 */
const createSubscription = async (subscriptionObj) => {
  const alreadyExistingSubscription = await Subscription.findOne({
    name: subscriptionObj.name,
  });
  if (alreadyExistingSubscription) {
    throw new ApiError(httpStatus.BAD_REQUEST, messages.ResourceAlreadyExists);
  }
  let subscription = new Subscription(subscriptionObj);
  subscription = await subscription.save();

  return subscription;
};

/**
 * Update subscription
 * @param {Object} subscriptionObj
 * @returns {Promise<Subscription>}
 */
const updateSubscription = async (subscriptionObj) => {
  const subscription = await Subscription.findOne({
    _id: subscriptionObj.id,
  });

  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  Object.assign(subscription, subscriptionObj);

  await subscription.save();
  return subscription;
};

/**
 * Check User remaining subscriptions
 * @param {String} userId
 * @param {Number} userJobsitesCount
 * @returns {Promise<Subscription>}
 */
const checkUserRemainingSubscriptions = async (userId, userJobsitesCount) => {
  const user = await userService.getUserById(userId);
  const subscription = await Subscription.findById(user.currentSubscriptionPlan);

  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found for user');
  }

  /**
   * Checking if subscription isn't pro
   * And user has reached the maximum number of jobsites allowed by their subscription
   */
  if (subscription.maxJobsites !== -1 && userJobsitesCount >= subscription.maxJobsites) {
    throw new ApiError(httpStatus.FORBIDDEN, messages.MaxJobisteLimitReached);
  }
};

/**
 * Update Users to Free plan
 * @param {String} userId
 * @param {Number} userJobsitesCount
 * @returns {Promise<Subscription>}
 */
const updateUsersToFreePlan = async () => {
  const freePlan = await Subscription.findOne({ name: constants.SUBSCRIPTION_TYPES.free });

  const users = await User.find();

  const updatePromises = users.map((user) => {
    const tempUser = { ...user };
    tempUser.currentSubscriptionPlan = freePlan._id;

    const trackingEntry = {
      subscribedPlan: freePlan._id,
      subscriptionStartedDate: new Date(),
    };

    if (!tempUser.subscriptionsTracking.some((track) => track.subscribedPlan.equals(freePlan._id))) {
      tempUser.subscriptionsTracking.push(trackingEntry);
    }

    return tempUser.save();
  });

  await Promise.all(updatePromises);
};

/**
 * Update user subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const updateUserSubscription = async (userId, newSubscriptionId) => {
  const newSubscription = await getSubscriptionById(newSubscriptionId);

  let user = await userService.getUserById(userId);
  user.currentSubscriptionPlan = newSubscription._id;
  user.subscriptionsTracking.push({
    subscribedPlan: newSubscription._id,
    subscriptionStartedDate: new Date(),
  });

  user = await user.save();

  return user;
};

module.exports = {
  getSubscriptionById,
  getAllSubscriptions,
  createSubscription,
  updateSubscription,
  checkUserRemainingSubscriptions,
  updateUsersToFreePlan,
  updateUserSubscription,
};
