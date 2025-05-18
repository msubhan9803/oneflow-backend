const mongoose = require('mongoose');
const { toJSON, paginate, aggregatedPaginate } = require('./plugins');
const constants = require('../utils/constants');

const { Schema } = mongoose;

const reportSchema = new Schema(
  {
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
    status: {
      type: String,
      enum: Object.values(constants.ReportStatuses),
      default: constants.ReportStatuses.pending,
    },
    files: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
reportSchema.plugin(toJSON);
reportSchema.plugin(paginate);
reportSchema.plugin(aggregatedPaginate);

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
