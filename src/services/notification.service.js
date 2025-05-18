const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const messages = require('../utils/message');
const Notification = require('../models/notification.model');

/**
 * Create notification for user
 * @param {string} notificationType
 * @param {ObjectId} userId
 * @param {string} title
 * @param {string} bodyText
 * @param {object} data
 */
const createNotificationForUser = (notificationType, userId, title, bodyText, data) => {
  if (!notificationType || !userId || !title || !title || !bodyText || !data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'One or more required parameters are missing');
  }

  const body = {
    notificationType,
    userId,
    title,
    bodyText,
    data,
  };

  return Notification.create(body);
};

/**
 * Get User Notifications
 * @param {ObjectId} userId
 * @returns {Promise<notifications>}
 */
const gellAllUserNotifications = async (userId) => {
  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
  if (!notifications) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.notFound);
  }
  return notifications;
};

/**
 * Mark notification as read
 * @param {String} notificationId
 */
const markNotificationAsRead = async (notificationId) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.notFound);
  }

  await Notification.findByIdAndUpdate(notificationId, { read: true });
};

/**
 * Mark notification as read
 * @param {String} userId
 */
const clearAllNotificationByUserId = async (userId) => {
  const notification = await Notification.findOne({ userId });
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, `No user notification found`);
  }
  await Notification.deleteMany({ userId });
};

module.exports = {
  createNotificationForUser,
  gellAllUserNotifications,
  markNotificationAsRead,
  clearAllNotificationByUserId,
};
