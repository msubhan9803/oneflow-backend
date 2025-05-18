const httpStatus = require('http-status');
const { Report } = require('../models');
const ApiError = require('../utils/ApiError');
const messages = require('../utils/message');

/**
 * Get Report by Id
 * @param {String} reportId
 * @returns {Promise<Report>}
 */
const getReportById = async (reportId) => {
  const report = await Report.findById(reportId)
    .populate({
      path: 'jobsiteRef',
      populate: [{ path: 'county' }, { path: 'createdByUser' }],
    })
    .populate('scheduledTestRef');

  if (!report) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  return report;
};

/**
 * Query for Reports Aggregated
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryReportsAggregated = async (filter, options, aggregatedQuery) => {
  const reports = await Report.aggregatedPaginate(filter, options, aggregatedQuery);
  return reports;
};

/**
 * Create Report
 * @param {String} scheduledTestRef
 * @param {String} jobsiteRef
 * @returns {Promise<Subscription>}
 */
const createReport = async (scheduledTestRef, jobsiteRef, createdByUser) => {
  let report = new Report({
    scheduledTestRef,
    jobsiteRef,
    createdByUser,
  });

  report = await report.save();

  return report;
};

/**
 * Update Report Status
 * @param {String} reportId
 * @param {String} jobsiteRef
 * @returns {Promise<Subscription>}
 */
const updateReportStatus = async (reportId, newStatus) => {
  let report = await getReportById(reportId);
  report.status = newStatus;

  report = await report.save();

  return report;
};

/**
 * Delete File From Report
 * @param {String} reportId
 * @param {String} jobsfileKeyiteRef
 * @returns {Promise<Subscription>}
 */
const deleteFileFromReport = async (reportId, fileKey) => {
  let report = await getReportById(reportId);
  report.files = report.files.filter((file) => file !== fileKey);

  report = await report.save();

  return report;
};

/**
 * Attatch File to Report
 * @param {String} reportId
 * @param {Object} file
 * @returns {Promise<Subscription>}
 */
const attatchFileToReport = async (reportId, file) => {
  let report = await getReportById(reportId);
  report.files.push(file.key);

  report = await report.save();

  return report;
};

/**
 * Delete Reports by Id
 * @param {String} reportRef
 * @returns {Promise<Jobsite>}
 */
const deleteReportById = async (reportRef) => {
  await Report.findByIdAndDelete(reportRef);
};

/**
 * Delete Reports by User Id
 * @param {String} createdByUser
 * @returns {Promise<Jobsite>}
 */
const deleteReportsByUserId = async (createdByUser) => {
  await Report.deleteMany({ createdByUser });
};

/**
 * Delete Reports by Jobsite Id
 * @param {String} jobsiteRef
 * @returns {Promise<Jobsite>}
 */
const deleteReportByJobsiteId = async (jobsiteRef) => {
  await Report.deleteMany({ jobsiteRef });
};

/**
 * Delete Report by Scheduled Test Ref
 * @param {String} scheduledTestRef
 * @returns {Promise<Jobsite>}
 */
const deleteReportByScheduledRef = async (scheduledTestRef) => {
  await Report.deleteOne({ scheduledTestRef });
};

module.exports = {
  getReportById,
  queryReportsAggregated,
  createReport,
  updateReportStatus,
  attatchFileToReport,
  deleteReportById,
  deleteFileFromReport,
  deleteReportsByUserId,
  deleteReportByJobsiteId,
  deleteReportByScheduledRef,
};
