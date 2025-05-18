const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const constants = require('../utils/constants');

const { Schema } = mongoose;

const jobsiteSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      unique: true,
    },
    createdByUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    county: {
      type: Schema.Types.ObjectId,
      ref: 'County',
    },
    streetAddress: {
      type: String,
      required: false,
    },
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
    billingAddress: {
      type: String,
      required: false,
    },
    autoTestAnnually: {
      type: Boolean,
      required: false,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(constants.JOBSITE_STATUS_TYPES),
      default: constants.JOBSITE_STATUS_TYPES.unassigned,
    },
    lastTestDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
jobsiteSchema.plugin(toJSON);
jobsiteSchema.plugin(paginate);

/**
 * @typedef Jobsite
 */
const Jobsite = mongoose.model('Jobsite', jobsiteSchema);

module.exports = Jobsite;
