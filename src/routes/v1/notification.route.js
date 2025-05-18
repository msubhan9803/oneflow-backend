const express = require('express');
const auth = require('../../middlewares/auth');
const notificationController = require('../../controllers/notification.controller');

const router = express.Router();

router.get('/gellAllUserNotifications/:userId', auth(), notificationController.gellAllUserNotifications);
router.put('/markNotificationAsRead/:notificationId', auth(), notificationController.markNotificationAsRead);
router.delete('/clearAllNotificationsByUserId/:userId', auth(), notificationController.clearAllNotificationByUserId);

module.exports = router;
