/* eslint-disable no-await-in-loop */
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { BackflowTest } = require('../models');
const ApiError = require('../utils/ApiError');
const messages = require('../utils/message');

/**
 * Query for Reports Aggregated
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryBackflowsAggregated = async (filter, options, aggregatedQuery) => {
  const backflowResult = await BackflowTest.aggregatedPaginate(filter, options, aggregatedQuery);
  return backflowResult;
};

/**
 * Create a backflow test
 * @param {Object} backflowTestData
 * @returns {Promise<BackflowTest>}
 */
const createBackflowTest = async (backflowTestData, scheduledTestRef, jobsiteRef, files, createdByUser) => {
  let backflowTest = new BackflowTest(backflowTestData);
  backflowTest.scheduledTestRef = scheduledTestRef;
  backflowTest.jobsiteRef = jobsiteRef;
  backflowTest.snapshots = files.map((file) => file.key);
  backflowTest.createdByUser = createdByUser;

  backflowTest = await backflowTest.save();
  return backflowTest;
};

/**
 * Get backflows by report ID
 * @param {String} reportId
 * @returns {Promise<Array<BackflowTest>>}
 */
const getBackflowsByReportId = async (reportId) => {
  const backflows = await BackflowTest.find({ reportRef: mongoose.Types.ObjectId(reportId) });
  return backflows;
};

/**
 * Get Backflow By Id
 * @param {String} backflowId
 * @returns {Promise<Array<BackflowTest>>}
 */
const getBackflowById = async (backflowId) => {
  const backflow = await BackflowTest.findById(backflowId);
  return backflow;
};

/**
 * Update a backflow test
 * @param {String} testId
 * @param {Object} updateData
 * @returns {Promise<BackflowTest>}
 */
const updateBackflowTest = async (testId, updateData, newFiles) => {
  // Get the backflowTest record
  const backflowTest = await BackflowTest.findById(testId);
  if (!backflowTest) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  // Handling the deletion of files from the snapshots array
  if (updateData.deletedSnapshots && updateData.deletedSnapshots.length > 0) {
    const deletedSnapshots = JSON.parse(updateData.deletedSnapshots);

    deletedSnapshots.forEach((snapshotUrl) => {
      const index = backflowTest.snapshots.indexOf(snapshotUrl);
      if (index > -1) {
        backflowTest.snapshots.splice(index, 1);
      }
    });
  }

  // Handling the addition of new files to the snapshots array
  if (newFiles && newFiles.length > 0) {
    newFiles.forEach((file) => {
      backflowTest.snapshots.push(file.key); // Assuming 'file.location' contains the S3 URL of the uploaded file
    });
  }

  // Merge other update fields from the request body
  Object.assign(backflowTest, updateData);

  // Save the updated backflowTest record
  await backflowTest.save();

  return backflowTest;
};

/**
 * Delete a backflow test
 * @param {String} testId
 * @returns {Promise<void>}
 */
const deleteBackflowTest = async (testId) => {
  const backflowTest = await BackflowTest.findById(testId);
  if (!backflowTest) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  await BackflowTest.deleteOne({ _id: testId });
};

/**
 * Delete BackflowTests by User Id
 * @param {String} createdByUser
 * @returns {Promise<Jobsite>}
 */
const deleteBackflowTestsByUserId = async (createdByUser) => {
  await BackflowTest.deleteMany({ createdByUser });
};

/**
 * Delete Backflow Tests by Jobsite Id
 * @param {String} jobsiteRef
 * @returns {Promise<Jobsite>}
 */
const deleteBackflowTestsByJobsiteId = async (jobsiteRef) => {
  await BackflowTest.deleteMany({ jobsiteRef });
};

/**
 * Delete Backflow Tests By Report Ref
 * @param {String} reportRef
 */
const deleteBackflowTestsByReportRef = async (reportRef) => {
  await BackflowTest.deleteMany({ reportRef });
};

/**
 * Delete Backflow Tests By Scheduled Test Ref
 * @param {String} scheduledTestRef
 */
const deleteBackflowTestsByScheduledTestRef = async (scheduledTestRef) => {
  await BackflowTest.deleteMany({ scheduledTestRef });
};

module.exports = {
  queryBackflowsAggregated,
  createBackflowTest,
  getBackflowById,
  getBackflowsByReportId,
  updateBackflowTest,
  deleteBackflowTest,
  deleteBackflowTestsByUserId,
  deleteBackflowTestsByJobsiteId,
  deleteBackflowTestsByReportRef,
  deleteBackflowTestsByScheduledTestRef,
};
