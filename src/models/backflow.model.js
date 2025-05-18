const mongoose = require('mongoose');
const { toJSON, paginate, aggregatedPaginate } = require('./plugins');
const constants = require('../utils/constants');

const { Schema } = mongoose;

const backflowTestSchema = new Schema(
  {
    reportRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
    },
    scheduledTestRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScheduledTest',
    },
    jobsiteRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Jobsite',
    },
    createdByUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    serialNumber: {
      type: String,
    },
    make: {
      type: String,
    },
    model: {
      type: String,
    },
    deviceLocation: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(constants.BackflowTestStatuses),
    },
    details: {
      type: String,
    },
    snapshots: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// add plugins that convert mongoose to json and add pagination
backflowTestSchema.plugin(toJSON);
backflowTestSchema.plugin(paginate);
backflowTestSchema.plugin(aggregatedPaginate);

const BackflowTest = mongoose.model('BackflowTest', backflowTestSchema);

module.exports = BackflowTest;
