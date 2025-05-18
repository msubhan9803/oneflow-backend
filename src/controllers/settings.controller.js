const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const messages = require('../utils/message');
const constants = require('../utils/constants');
const { settingsService, userService, scheduledTestService } = require('../services');

const getAllAdminSettings = catchAsync(async (req, res) => {
  try {
    const adminSettingsList = await settingsService.getAllAdminSettings();
    if (!adminSettingsList) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
    }
    res.send(adminSettingsList);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getAllTimeSlots = catchAsync(async (req, res) => {
  try {
    res.send(constants.timeSlots);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getStatsForAdmin = catchAsync(async (req, res) => {
  try {
    /**
     * Getting User count
     */
    const totalCustomersCount = await userService.getUserCount();

    /**
     * Getting totat revenue
     */
    const totalRevenue = await scheduledTestService.getTotalRevenue();

    /**
     * Getting total tests
     */
    const totalTests = await scheduledTestService.getTotalTests();

    const stats = {
      totalCustomersCount,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0,
      totalTests,
    };

    res.json(stats);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const createAdminSettings = catchAsync(async (req, res) => {
  try {
    const adminSettings = await settingsService.createAdminSettings(req.body);
    res.status(httpStatus.CREATED).send(adminSettings);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const updateAdminSettings = catchAsync(async (req, res) => {
  try {
    const adminSettings = await settingsService.updateAdminSettings(req.body);
    res.status(httpStatus.OK).send(adminSettings);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

module.exports = {
  getAllAdminSettings,
  getStatsForAdmin,
  getAllTimeSlots,
  createAdminSettings,
  updateAdminSettings,
};
