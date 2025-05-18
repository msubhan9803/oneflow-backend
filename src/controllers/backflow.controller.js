const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const { backflowService, reportService } = require('../services');
const messages = require('../utils/message');

const createBackflowTest = catchAsync(async (req, res) => {
  try {
    const { files } = req;
    const report = await reportService.getReportById(req.body.reportRef);
    const backflowTest = await backflowService.createBackflowTest(
      req.body,
      report.scheduledTestRef.id,
      report.jobsiteRef.id,
      files,
      report.createdByUser
    );

    res.status(httpStatus.OK).send(backflowTest);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getBackflowsByReportId = catchAsync(async (req, res) => {
  try {
    const filter = pick(req.query, ['search', 'status']);
    const caseInsensitiveFilter = {};
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'filesLength']);

    const aggregateQuery = [
      {
        $match: {
          reportRef: mongoose.Types.ObjectId(req.params.reportId),
        },
      },
      {
        $addFields: {
          snapshotsLength: { $size: '$snapshots' },
          makeModel: { $concat: ['$make', ' - ', '$model'] },
        },
      },
    ];

    if (filter.search) {
      aggregateQuery.push({
        $match: {
          $or: [
            { serialNumber: { $regex: new RegExp(filter.search, 'i') } },
            { makeModel: { $regex: new RegExp(filter.search, 'i') } },
            { deviceLocation: { $regex: new RegExp(filter.search, 'i') } },
            { status: { $regex: new RegExp(filter.search, 'i') } },
          ],
        },
      });
    }

    if (filter.status) {
      aggregateQuery.push({
        $match: { status: { $eq: filter.status } },
      });
    }

    const result = await backflowService.queryBackflowsAggregated(caseInsensitiveFilter, options, aggregateQuery);

    res.send(result);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getBackflowsByJobsiteId = catchAsync(async (req, res) => {
  try {
    const filter = pick(req.query, ['search', 'status']);
    const caseInsensitiveFilter = {};
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'filesLength']);

    const aggregateQuery = [
      {
        $match: {
          jobsiteRef: mongoose.Types.ObjectId(req.params.jobsiteId),
        },
      },
      {
        $addFields: {
          snapshotsLength: { $size: '$snapshots' },
          makeModel: { $concat: ['$make', ' - ', '$model'] },
        },
      },
    ];

    if (filter.search) {
      aggregateQuery.push({
        $match: {
          $or: [
            { serialNumber: { $regex: new RegExp(filter.search, 'i') } },
            { makeModel: { $regex: new RegExp(filter.search, 'i') } },
            { deviceLocation: { $regex: new RegExp(filter.search, 'i') } },
            { status: { $regex: new RegExp(filter.search, 'i') } },
          ],
        },
      });
    }

    if (filter.status) {
      aggregateQuery.push({
        $match: { status: { $eq: filter.status } },
      });
    }

    const result = await backflowService.queryBackflowsAggregated(caseInsensitiveFilter, options, aggregateQuery);

    res.send(result);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getBackflowsByScheduledTestId = catchAsync(async (req, res) => {
  try {
    const filter = pick(req.query, ['search', 'status']);
    const caseInsensitiveFilter = {};
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'filesLength']);

    const aggregateQuery = [
      {
        $match: {
          scheduledTestRef: mongoose.Types.ObjectId(req.params.scheduledTestId),
        },
      },
      {
        $addFields: {
          snapshotsLength: { $size: '$snapshots' },
          makeModel: { $concat: ['$make', ' - ', '$model'] },
        },
      },
    ];

    if (filter.search) {
      aggregateQuery.push({
        $match: {
          $or: [
            { serialNumber: { $regex: new RegExp(filter.search, 'i') } },
            { makeModel: { $regex: new RegExp(filter.search, 'i') } },
            { deviceLocation: { $regex: new RegExp(filter.search, 'i') } },
            { status: { $regex: new RegExp(filter.search, 'i') } },
          ],
        },
      });
    }

    if (filter.status) {
      aggregateQuery.push({
        $match: { status: { $eq: filter.status } },
      });
    }

    const result = await backflowService.queryBackflowsAggregated(caseInsensitiveFilter, options, aggregateQuery);

    res.send(result);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getBackflowById = catchAsync(async (req, res) => {
  try {
    const backflow = await backflowService.getBackflowById(req.params.backflowId);
    if (!backflow) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
    }
    res.status(httpStatus.OK).send(backflow);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const updateBackflowTest = catchAsync(async (req, res) => {
  try {
    const { testId } = req.params;
    const updateData = req.body;
    const newFiles = req.files;

    const backflowTest = await backflowService.updateBackflowTest(testId, updateData, newFiles);
    res.status(httpStatus.OK).send(backflowTest);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const deleteBackflowTest = catchAsync(async (req, res) => {
  try {
    await backflowService.deleteBackflowTest(req.params.testId);
    res.status(httpStatus.OK).send({ message: messages.ResourceDeletedSuccessfully });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

module.exports = {
  createBackflowTest,
  getBackflowById,
  getBackflowsByReportId,
  getBackflowsByJobsiteId,
  getBackflowsByScheduledTestId,
  updateBackflowTest,
  deleteBackflowTest,
};
