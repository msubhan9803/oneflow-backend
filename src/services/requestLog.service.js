/* eslint-disable no-await-in-loop */
const { RequestLog } = require('../models');

/**
 * Get All Request Logs By Scheduled Id
 * @param {String} scheduledTestId
 * @returns {Promise<Jobsite>}
 */
const getAllRequestLogsByScheduledId = async (scheduledTestId) => {
  const reqeustlogs = await RequestLog.find({ scheduledRequestRef: scheduledTestId });

  return reqeustlogs;
};

/**
 * Create Update Scheduled Test Request Log
 * @param {String} scheduledTestId
 * @returns {Promise<Jobsite>}
 */
const createRequestLog = async (scheduledTestId, createdByUser, logMessage, logDescription = '') => {
  let requestLog = new RequestLog({
    scheduledRequestRef: scheduledTestId,
    logMessage,
    logDescription,
    createdByUser,
  });

  requestLog = await requestLog.save();

  return requestLog;
};

module.exports = {
  getAllRequestLogsByScheduledId,
  createRequestLog,
};
