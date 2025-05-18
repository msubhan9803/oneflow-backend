const emailService = require('./email.service');

const userNotificationAboutVerificationEmail = async (email, emailObj) => {
  await emailService.sendVerificationEmail(email, emailObj);
};

const userNotificationAboutResetPasswordEmail = async (email, emailObj) => {
  await emailService.sendResetPasswordEmail(email, emailObj);
};

const userNotificationAboutScheduledTest = async (email, emailObj) => {
  await emailService.sendScheduledTestCreationEmail(email, emailObj);
};

const updatedScheduleTestStatus = async (email, emailObj, type) => {
  await emailService.sendUpdatedScheduleTestStatusEmail(email, emailObj, type);
};

const chargedTripFee = async (email, emailObj) => {
  await emailService.sendChargedTripFeeEmail(email, emailObj);
};

const addExtraTest = async (email, emailObj) => {
  await emailService.sendAddExtraTestEmail(email, emailObj);
};

const scheduledTestReschedule = async (email, emailObj) => {
  await emailService.sendScheduledTestRescheduleEmail(email, emailObj);
};

const confirmRequestNotify = async (email, emailObj) => {
  await emailService.sendConfirmRequestEmail(email, emailObj);
};

const userManagementNotify = async (email, emailObj) => {
  await emailService.sendUserManagementEmail(email, emailObj);
};

const userNetAccountApprovalNotify = async (email, emailObj) => {
  await emailService.sendUserNetAccountApprovalNotify(email, emailObj);
};

module.exports = {
  userNotificationAboutVerificationEmail,
  userNotificationAboutResetPasswordEmail,
  userNotificationAboutScheduledTest,
  updatedScheduleTestStatus,
  chargedTripFee,
  addExtraTest,
  scheduledTestReschedule,
  confirmRequestNotify,
  userManagementNotify,
  userNetAccountApprovalNotify,
};
