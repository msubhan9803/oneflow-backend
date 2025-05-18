const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

const requestLogSchema = new Schema(
  {
    scheduledRequestRef: { type: Schema.Types.ObjectId, ref: 'ScheduledRequest' },
    logMessage: String,
    logDescription: String,
    createdByUser: String,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
requestLogSchema.plugin(toJSON);
requestLogSchema.plugin(paginate);

const RequestLog = mongoose.model('RequestLog', requestLogSchema);

module.exports = RequestLog;
