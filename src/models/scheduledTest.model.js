const mongoose = require('mongoose');
const constants = require('../utils/constants');
const { toJSON, paginate, aggregatedPaginate } = require('./plugins');
const message = require('../utils/message');

const { Schema } = mongoose;

const scheduledTestSchema = new Schema(
  {
    isEnabled: {
      type: Boolean,
      default: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    primaryContactName: String,
    phoneNumber: String,
    email: String,
    jobsiteId: { type: Schema.Types.ObjectId, ref: 'Jobsite' },
    createdByUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    scheduledDate: Date,
    validUntilDate: { type: Date, default: null },
    preferredScheduledTime: String,
    numberOfBackflows: Number,
    reportFileUrl: { type: String, default: null },
    newInstallationOrReplacement: Boolean,
    anyLockedBackflows: { type: String, enum: Object.values(constants.ScheduledTestYesSureNoteSure) },
    anyBackflowInsideBuilding: { type: String, enum: Object.values(constants.ScheduledTestYesSureNoteSure) },
    anyLockedBackflowRequiringOnsiteStaff: { type: String, enum: Object.values(constants.ScheduledTestYesSureNoteSure) },
    isAlarm: { type: String, enum: Object.values(constants.ScheduledTestYesSureNoteSure) },
    isTestMode: { type: String, enum: Object.values(constants.ScheduledTestYesSureNoteSure) },
    additionalInstructions: String,
    isNetTerms: { type: Boolean, default: false },
    isRush: { type: Boolean, default: false },
    rank: { type: Number, default: null },
    stripe: {
      paymentIntentId: String,
      amount: String,
      currency: String,
    },
    backflowTestFee: Number, // trip fee coming from county
    rushFee: { type: Number, default: null }, // rush fee from admin settings
    tax: Number, // tax fee from admin settings
    serviceFee: Number, // service fee from admin settings
    total: Number,
    dueIn: { type: Date, default: null },
    termsAndConditionsAccepted: { type: Boolean, default: true },
    serviceConfirmationNumber: { type: String, unique: true },
    statusTracking: {
      pending: {
        time: { type: Date, default: Date.now },
        message: {
          type: String,
          default: message.ScheduledTestStatusPendingMessage,
        },
      },
      scheduled: {
        time: { type: Date, default: null },
        message: String,
      },
      repairsNeeded: {
        time: { type: Date, default: null },
        message: String,
        details: { type: String, default: null },
      },
      passed: {
        time: { type: Date, default: null },
        message: String,
      },
      notAvailable: {
        time: { type: Date, default: null },
        message: String,
      },
      expired: {
        time: { type: Date, default: null },
        message: String,
      },
    },
    currentStatus: {
      type: String,
      enum: Object.values(constants.ScheduledTestStasuses),
      default: constants.ScheduledTestStasuses.pending,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
scheduledTestSchema.plugin(toJSON);
scheduledTestSchema.plugin(paginate);
scheduledTestSchema.plugin(aggregatedPaginate);

const ScheduledTest = mongoose.model('ScheduledTest', scheduledTestSchema);

module.exports = ScheduledTest;
