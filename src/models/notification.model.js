const mongoose = require('mongoose');
const { NOTIFICATION_STATE_TYPES } = require('../utils/constants');

const notificationSchema = new mongoose.Schema(
  {
    notificationType: {
      type: String,
      enum: Object.keys(NOTIFICATION_STATE_TYPES),
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    bodyText: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
