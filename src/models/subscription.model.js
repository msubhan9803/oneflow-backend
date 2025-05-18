const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const constants = require('../utils/constants');

const subscriptionSchema = mongoose.Schema(
  {
    stripeProductId: {
      type: String,
    },
    name: {
      type: String,
      enum: Object.values(constants.SUBSCRIPTION_TYPES),
      required: true,
    },
    maxJobsites: {
      type: Number, // Set to -1 for unlimited
      required: true,
    },
    price: {
      // yearly
      type: Number,
      required: true,
    },
    dueToday: {
      // 0.25 * price
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
      required: true,
    },
    featuresList: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
subscriptionSchema.plugin(toJSON);
subscriptionSchema.plugin(paginate);

/**
 * @typedef Subscription
 */
const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
