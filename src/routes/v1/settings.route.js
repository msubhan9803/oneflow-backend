const express = require('express');
const auth = require('../../middlewares/auth');
const adminSettingsController = require('../../controllers/settings.controller');

const router = express.Router();

router.get('/getAllAdminSettings', auth(), adminSettingsController.getAllAdminSettings);
router.get('/getAllTimeSlots', auth(), adminSettingsController.getAllTimeSlots);
router.get('/getStatsForAdmin', auth('admin'), adminSettingsController.getStatsForAdmin);
router.post('/createAdminSettings', auth('admin'), adminSettingsController.createAdminSettings);
router.put('/updateAdminSettings', auth('admin'), adminSettingsController.updateAdminSettings);

module.exports = router;
