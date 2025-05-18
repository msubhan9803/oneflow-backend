const notificationService = require('../services/notification.service');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const messages = require('../utils/message');

const gellAllUserNotifications = catchAsync(async (req, res) => {
  const notifications = await notificationService.gellAllUserNotifications(req.params.userId);
  if (!notifications.length) {
    throw new ApiError(404, messages.NoNotificationsFoundForUser);
  }
  res.status(200).send(notifications);
});

const markNotificationAsRead = catchAsync(async (req, res) => {
  await notificationService.markNotificationAsRead(req.params.notificationId);
  res.status(200).send({ message: messages.NotificationMarkedAsRead });
});

const clearAllNotificationByUserId = catchAsync(async (req, res) => {
  await notificationService.clearAllNotificationByUserId(req.params.userId);
  res.status(200).send({ message: messages.NotificationsCleared });
});

module.exports = {
  gellAllUserNotifications,
  markNotificationAsRead,
  clearAllNotificationByUserId,
};
