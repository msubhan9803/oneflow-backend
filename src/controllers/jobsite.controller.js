/* eslint-disable no-restricted-syntax */
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const messages = require('../utils/message');
const { jobsiteService, scheduledTestService, reportService, backflowService } = require('../services');

const getAllJobsites = catchAsync(async (req, res) => {
  try {
    const filter = pick(req.query, ['search', 'status', 'autoTestAnnually', 'county']);

    const caseInsensitiveFilter = {};
    for (const key in filter) {
      if (key === 'autoTestAnnually') {
        if (filter[key]) {
          caseInsensitiveFilter[key] = filter[key] === 'true';
        }
      } else if (key === 'county') {
        if (filter[key]) {
          caseInsensitiveFilter[key] = filter[key];
        }
      } else if (key === 'search') {
        if (filter[key]) {
          caseInsensitiveFilter.$or = [
            { name: { $regex: filter[key], $options: 'i' } },
            { streetAddress: { $regex: filter[key], $options: 'i' } },
            { billingAddress: { $regex: filter[key], $options: 'i' } },
          ];

          if (parseFloat(filter[key]) && !Number.isNaN(parseFloat(filter[key]))) {
            caseInsensitiveFilter.$or.push({ latitude: parseFloat(filter[key]) });
            caseInsensitiveFilter.$or.push({ longitude: parseFloat(filter[key]) });
          }
        }
      } else {
        caseInsensitiveFilter[key] = { $regex: filter[key], $options: 'i' };
      }
    }

    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const result = await jobsiteService.queryJobsites(caseInsensitiveFilter, options);

    res.send(result);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getMyJobsites = catchAsync(async (req, res) => {
  try {
    const filter = pick(req.query, ['search', 'status', 'autoTestAnnually', 'county']);

    const caseInsensitiveFilter = {};
    for (const key in filter) {
      if (key === 'autoTestAnnually') {
        if (filter[key]) {
          caseInsensitiveFilter[key] = filter[key] === 'true';
        }
      } else if (key === 'county') {
        if (filter[key]) {
          caseInsensitiveFilter[key] = filter[key];
        }
      } else if (key === 'search') {
        if (filter[key]) {
          caseInsensitiveFilter.$or = [
            { name: { $regex: filter[key], $options: 'i' } },
            { streetAddress: { $regex: filter[key], $options: 'i' } },
            { billingAddress: { $regex: filter[key], $options: 'i' } },
          ];

          if (parseFloat(filter[key]) && !Number.isNaN(parseFloat(filter[key]))) {
            caseInsensitiveFilter.$or.push({ latitude: parseFloat(filter[key]) });
            caseInsensitiveFilter.$or.push({ longitude: parseFloat(filter[key]) });
          }
        }
      } else {
        caseInsensitiveFilter[key] = { $regex: filter[key], $options: 'i' };
      }
    }
    caseInsensitiveFilter.createdByUser = mongoose.Types.ObjectId(req.user._id);

    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const result = await jobsiteService.queryJobsites(caseInsensitiveFilter, options);

    const userJobsiteLimit = await jobsiteService.getUserJobsiteAnalyticsUnderPlan(req.user._id);

    res.send({
      ...result,
      ...userJobsiteLimit,
    });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getJobsiteById = catchAsync(async (req, res) => {
  try {
    const jobsite = await jobsiteService.getJobsiteById(req.params.jobsiteId);
    if (!jobsite) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
    }
    res.send(jobsite);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const createJobsite = catchAsync(async (req, res) => {
  try {
    const jobsite = await jobsiteService.createJobsite(req.body, req.user._id);
    res.status(httpStatus.CREATED).send(jobsite);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const updateJobsite = catchAsync(async (req, res) => {
  try {
    // const scheduledTest = await scheduledTestService.checkScheduledTestExistenceByJobisteId(req.body.id);
    // if (scheduledTest) {
    //   throw new ApiError(httpStatus.NOT_FOUND, messages.JobsiteAlreadyInUse);
    // }

    const jobsite = await jobsiteService.updateJobsite(req.body, req.user._id);
    res.status(httpStatus.OK).send(jobsite);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const deleteJobsite = catchAsync(async (req, res) => {
  try {
    /**
     * Not applicable due to 1-many jobsite-scheduled test relationship
     */
    // if (req.user.role !== 'admin') {
    //   const scheduledTest = await scheduledTestService.checkScheduledTestExistenceByJobisteId(req.params.jobsiteId);
    //   if (scheduledTest) {
    //     throw new ApiError(httpStatus.NOT_FOUND, messages.JobsiteAlreadyInUse);
    //   }
    // }

    /**
     * Deleting Jobsite (completely)
     */
    await jobsiteService.deleteJobsite(req.params.jobsiteId, req.user._id);

    /**
     * Deleting scheduled tests of this jobsite
     */
    await scheduledTestService.deleteScheduledTestByJobsiteId(req.params.jobsiteId);

    /**
     * Deleting reports of this jobsite
     */
    await reportService.deleteReportByJobsiteId(req.params.jobsiteId);

    /**
     * Deleting backflow tests of this jobsite
     */
    await backflowService.deleteBackflowTestsByJobsiteId(req.params.jobsiteId);

    res.status(httpStatus.OK).send({ message: messages.ResourceDeletedSuccessfully });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

module.exports = {
  getJobsiteById,
  getAllJobsites,
  getMyJobsites,
  createJobsite,
  updateJobsite,
  deleteJobsite,
};
