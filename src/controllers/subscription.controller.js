const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const messages = require('../utils/message');
const { SUBSCRIPTION_TYPES } = require('../utils/constants');
const { subscriptionService, jobsiteService, userService, stripeService } = require('../services');

const getSubscriptionById = catchAsync(async (req, res) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(req.params.subscriptionId);
    if (!subscription) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
    }
    res.send(subscription);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getAllSubscriptions = catchAsync(async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getAllSubscriptions();
    if (subscriptions.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
    }
    res.send(subscriptions);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const retrieveCustomer = catchAsync(async (req, res) => {
  try {
    const subscriptions = await stripeService.retrieveCustomer(req.params.stripeCustomerId);
    if (subscriptions.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
    }
    res.send(subscriptions);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const createSubscription = catchAsync(async (req, res) => {
  try {
    const subscription = await subscriptionService.createSubscription(req.body);
    res.status(httpStatus.CREATED).send(subscription);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const updateSubscription = catchAsync(async (req, res) => {
  try {
    const subscription = await subscriptionService.updateSubscription(req.body);
    res.status(httpStatus.OK).send(subscription);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const updateUsersToFreePlan = catchAsync(async (req, res) => {
  try {
    await subscriptionService.updateUsersToFreePlan();
    res.status(httpStatus.OK).send({ message: 'Updated all users to free plan' });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const retrieveProducts = catchAsync(async (req, res) => {
  try {
    const products = await stripeService.retrieveProducts();

    res.send(products);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const retrieveProductByProductId = catchAsync(async (req, res) => {
  try {
    const products = await stripeService.retrieveProductByProductId(req.params.productId);

    res.send(products);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const createBillingSession = catchAsync(async (req, res) => {
  try {
    const user = await userService.getUserById(req.user._id);
    const billingSession = await stripeService.createBillingSession(user.stripe.stripeCustomerId);

    res.send(billingSession);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const upgradeUserSubscription = catchAsync(async (req, res) => {
  try {
    const { newSubscriptionId } = req.params;
    const { stripeProductId } = await subscriptionService.getSubscriptionById(newSubscriptionId);
    const user = await userService.getUserById(req.user._id);
    const { stripe } = user;
    const { stripeCustomerId, paymentMethodId } = stripe;

    // Charging Card for due today + tax -- [NA] Already done on frontend
    // const total = dueToday + tax;
    // await stripeService.chargeCustomer(stripeCustomerId, paymentMethodId, total);

    // Check if the user is already subscribed
    const alreadySubscribed = await stripeService.getCustomersCurrentScheduledSubscription(stripeCustomerId);

    if (alreadySubscribed && alreadySubscribed.status !== 'canceled') {
      // Update the subscription if needed
      await stripeService.upgradeSubscription(stripeCustomerId, stripeProductId);
    } else {
      // Create Future subscription (next year)
      await stripeService.createSubscription(stripeCustomerId, paymentMethodId, stripeProductId);
    }

    // Upgrading subscription in the system
    const userResp = await subscriptionService.updateUserSubscription(req.user._id, newSubscriptionId);

    res.status(httpStatus.OK).send({ message: messages.SubscriptionUpdatedSuccessfully, user: userResp });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const downgradeUserSubscription = catchAsync(async (req, res) => {
  try {
    const { newSubscriptionId } = req.params;
    const user = await userService.getUserById(req.user._id);

    if (user.currentSubscriptionPlan.id === newSubscriptionId) {
      throw new ApiError(httpStatus.BAD_REQUEST, messages.AlreadySubscribed);
    }

    // Checking if user is allowed to downgrade
    const userJobsiteCount = await jobsiteService.getUserJobsiteCount(req.user._id);
    const newSubscription = await subscriptionService.getSubscriptionById(newSubscriptionId);

    if (userJobsiteCount > newSubscription.maxJobsites) {
      throw new ApiError(httpStatus.BAD_REQUEST, messages.CurrentJobsitesCountIsExceedingLimit);
    }

    const currentSubscription = await stripeService.getCustomersCurrentScheduledSubscription(user.stripe.stripeCustomerId);

    // Handle Stripe Downgrade Operations
    if (newSubscription.name === SUBSCRIPTION_TYPES.pro) {
      // Downgrade to pro in Stripe
      await stripeService.downgradeSubscription(user.stripe.stripeCustomerId, newSubscription.stripeProductId);
    } else if (newSubscription.name === SUBSCRIPTION_TYPES.free) {
      // Cancel subscription in Stripe
      await stripeService.cancelSubscription(currentSubscription.id);
    }

    // Downgrading subscription in the system
    const userResp = await subscriptionService.updateUserSubscription(req.user._id, newSubscriptionId);

    res.status(httpStatus.OK).send({ message: messages.SubscriptionUpdatedSuccessfully, user: userResp });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

module.exports = {
  getSubscriptionById,
  getAllSubscriptions,
  retrieveCustomer,
  retrieveProductByProductId,
  createSubscription,
  updateSubscription,
  updateUsersToFreePlan,
  createBillingSession,
  retrieveProducts,
  upgradeUserSubscription,
  downgradeUserSubscription,
};
