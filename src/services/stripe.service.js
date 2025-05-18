const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { stripeCurrency } = require('../utils/constants');

/**
 * Helper Methods
 */
const convertDollarstoCents = (amount) => Math.floor(amount * 100);

/**
 * Create Stripe Customer
 * @param {String} email
 * @returns {Promise<Jobsite>}
 */
const createStripeCustomer = async (email) => {
  const customer = await stripe.customers.create({
    description: 'Customer for backflow testing',
    email,
  });

  return customer;
};

/**
 * Create Payment Intent
 * @param {String} userId
 * @returns {Promise<Jobsite>}
 */
const createPaymentIntent = async (amount, customerId) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: convertDollarstoCents(amount),
    currency: stripeCurrency,
    customer: customerId,
  });

  return paymentIntent;
};

/**
 * Charge Customer
 * @param {String} stripeCustomerId
 * @param {Number} amount
 * @returns {Promise<Jobsite>}
 */
const chargeCustomer = async (stripeCustomerId, paymentMethodId, amount) => {
  const paymentIntentCharge = await stripe.paymentIntents.create({
    amount: convertDollarstoCents(amount),
    currency: stripeCurrency,
    customer: stripeCustomerId,
    payment_method: paymentMethodId,
    confirm: true,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never',
    },
  });

  return paymentIntentCharge;
};

/**
 * Retrieve Products
 * @returns {Promise<Array<StripeProduct>>}
 */
const retrieveProducts = async () => {
  const products = await stripe.products.list();

  return products;
};

/**
 * Retrieve Products
 * @param {String} productId
 * @returns {Promise<Jobsite>}
 */
const retrieveProductByProductId = async (productId) => {
  const product = await stripe.products.retrieve(productId);

  return product;
};

/**
 * Create Subscription
 * @param {String} stripeCustomerId
 * @param {Number} amount
 * @returns {Promise<Jobsite>}
 */
const createSubscription = async (stripeCustomerId, paymentMethodId, productId) => {
  const productDetails = await retrieveProductByProductId(productId);

  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const billingCycleAnchor = Math.round(oneYearFromNow.getTime() / 1000);

  const subscriptionSchedule = await stripe.subscriptionSchedules.create({
    customer: stripeCustomerId,
    start_date: billingCycleAnchor,
    end_behavior: 'release',
    phases: [
      {
        items: [
          {
            price: productDetails.default_price,
            quantity: 1,
          },
        ],
      },
    ],
  });

  return subscriptionSchedule;
};

/**
 * Check is user subscribed
 * @param {String} stripeCustomerId
 * @param {Number} amount
 * @returns {Promise<Jobsite>}
 */
const getCustomersCurrentScheduledSubscription = async (stripeCustomerId) => {
  const { data } = await stripe.subscriptionSchedules.list();
  const isExistingSubscription = data.find((subscription) => subscription.customer === stripeCustomerId);

  return isExistingSubscription;
};

/**
 * Update Subscription
 * @param {String} stripeCustomerId
 * @param {Number} amount
 * @returns {Promise<Jobsite>}
 */
const updateSubscription = async (stripeCustomerId, productId) => {
  const productDetails = await retrieveProductByProductId(productId);

  // Assuming a user can only have one subscription. Adjust accordingly if they can have multiple.
  const currentSubscription = await getCustomersCurrentScheduledSubscription(stripeCustomerId);

  await stripe.subscriptions.update(currentSubscription.id, {
    items: [
      {
        id: currentSubscription.items.data[0].id,
        price: productDetails.default_price,
      },
    ],
  });
};

/**
 * Upgrade Subscription
 * @param {String} stripeCustomerId
 * @param {String} productId
 * @returns {Promise<void>}
 */
const upgradeSubscription = async (stripeCustomerId, productId) => {
  const productDetails = await retrieveProductByProductId(productId);

  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const billingCycleAnchor = Math.round(oneYearFromNow.getTime() / 1000);

  // Assuming a user can only have one subscription. Adjust accordingly if they can have multiple.
  const currentSubscription = await getCustomersCurrentScheduledSubscription(stripeCustomerId);

  await stripe.subscriptionSchedules.update(currentSubscription.id, {
    phases: [
      {
        items: [
          {
            price: productDetails.default_price,
            quantity: 1,
          },
        ],
        start_date: billingCycleAnchor,
        iterations: 1,
      },
    ],
  });
};

/**
 * Downgrade Subscription
 * @param {String} stripeCustomerId
 * @param {String} productId
 * @returns {Promise<void>}
 */
const downgradeSubscription = async (stripeCustomerId, productId) => {
  const productDetails = await retrieveProductByProductId(productId);

  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const billingCycleAnchor = Math.round(oneYearFromNow.getTime() / 1000);

  // Assuming a user can only have one subscription. Adjust accordingly if they can have multiple.
  const currentSubscription = await getCustomersCurrentScheduledSubscription(stripeCustomerId);

  await stripe.subscriptionSchedules.update(currentSubscription.id, {
    phases: [
      {
        items: [
          {
            price: productDetails.default_price,
            quantity: 1,
          },
        ],
        start_date: billingCycleAnchor,
        iterations: 1,
      },
    ],
  });
};

/**
 * Cancel Subscription
 * @param {String} stripeSubscriptionId
 * @returns {Promise<Stripe.Subscription>}
 */
const cancelSubscription = async (stripeSubscriptionId) => {
  return stripe.subscriptionSchedules.cancel(stripeSubscriptionId);
};

/**
 * Create Billing Session
 * @param {String} stripeCustomerId
 * @param {Number} amount
 * @returns {Promise<Jobsite>}
 */
const createBillingSession = async (stripeCustomerId) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: process.env.STRIPE_REDIRECT_URL_AFTER_BILLING_MANAGEMENT,
  });

  return session;
};

/**
 * Retrieve Customer
 * @param {String} stripeCustomerId
 * @returns {Promise<any>}
 */
const retrieveCustomer = async (stripeCustomerId) => {
  const customer = await stripe.customers.retrieve(stripeCustomerId);

  return customer;
};

/**
 * Attatch Payment Method To Customer
 * @param {String} stripeCustomerId
 * @returns {Promise<any>}
 */
const attatchPaymentMethodToCustomer = async (stripeCustomerId, paymentMethodId) => {
  const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });

  const customer = await stripe.customers.update(stripeCustomerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  return {
    paymentMethod,
    customer,
  };
};

module.exports = {
  createStripeCustomer,
  createPaymentIntent,
  getCustomersCurrentScheduledSubscription,
  updateSubscription,
  upgradeSubscription,
  downgradeSubscription,
  cancelSubscription,
  createBillingSession,
  retrieveProducts,
  retrieveProductByProductId,
  chargeCustomer,
  createSubscription,
  retrieveCustomer,
  attatchPaymentMethodToCustomer,
};
