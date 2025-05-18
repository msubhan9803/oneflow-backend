const httpStatus = require('http-status');
const { AdminSettings } = require('../models');
const ApiError = require('../utils/ApiError');
const messages = require('../utils/message');

/**
 * Get All AdminSettings
 * @returns {Promise<Array<AdminSettings>>}
 */
const getAllAdminSettings = async () => {
  const adminSettings = await AdminSettings.findOne();
  return adminSettings;
};

/**
 * Post AdminSettings
 * @param {Object} adminSettingsObj
 * @returns {Promise<AdminSettings>}
 */
const createAdminSettings = async (adminSettingsObj) => {
  const alreadyExistingAdminSettings = await AdminSettings.findOne({
    nameOfOrganization: adminSettingsObj.nameOfOrganization,
  });
  if (alreadyExistingAdminSettings) {
    throw new ApiError(httpStatus.BAD_REQUEST, messages.ResourceAlreadyExists);
  }
  let adminSettings = new AdminSettings(adminSettingsObj);
  adminSettings = await adminSettings.save();
  return adminSettings;
};

/**
 * Update AdminSettings
 * @param {Object} adminSettingsObj
 * @returns {Promise<AdminSettings>}
 */
const updateAdminSettings = async (adminSettingsObj) => {
  const adminSettings = await AdminSettings.findOne({
    _id: adminSettingsObj.id,
  });

  if (!adminSettings) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  Object.assign(adminSettings, adminSettingsObj);

  await adminSettings.save();
  return adminSettings;
};

module.exports = {
  getAllAdminSettings,
  createAdminSettings,
  updateAdminSettings,
};
