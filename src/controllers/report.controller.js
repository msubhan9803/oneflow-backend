const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const messages = require('../utils/message');
const pick = require('../utils/pick');
const { reportService, emailService, s3Service, backflowService } = require('../services');

const getReportById = catchAsync(async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await reportService.getReportById(reportId);

    res.send(report);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getAllExistingReports = catchAsync(async (req, res) => {
  try {
    const filter = pick(req.query, ['search', 'status']);
    const caseInsensitiveFilter = {};

    const options = pick(req.query, ['sortBy', 'limit', 'page', 'filesLength']);

    const aggregateQuery = [
      {
        $lookup: {
          from: 'scheduledtests',
          localField: 'scheduledTestRef',
          foreignField: '_id',
          as: 'scheduledTestRef',
        },
      },
      { $unwind: '$scheduledTestRef' },
      {
        $lookup: {
          from: 'jobsites',
          localField: 'jobsiteRef',
          foreignField: '_id',
          as: 'jobsiteRef',
        },
      },
      { $unwind: '$jobsiteRef' },
      {
        $lookup: {
          from: 'counties',
          localField: 'jobsiteRef.county',
          foreignField: '_id',
          as: 'jobsiteRef.county',
        },
      },
      { $unwind: '$jobsiteRef.county' },
      {
        $lookup: {
          from: 'users',
          localField: 'jobsiteRef.createdByUser',
          foreignField: '_id',
          as: 'jobsiteRef.createdByUser',
        },
      },
      { $unwind: '$jobsiteRef.createdByUser' },
      {
        $addFields: {
          id: '$_id',
          'jobsiteRef.id': '$jobsiteRef._id',
          'jobsiteRef.county.id': '$jobsiteRef.county._id',
          'jobsiteRef.createdByUser.id': '$jobsiteRef.createdByUser._id',
          'scheduledTestRef.id': '$scheduledTestRef._id',
        },
      },
    ];

    if (filter.search) {
      aggregateQuery.push({
        $match: {
          $or: [
            { 'scheduledTestRef.primaryContactName': { $regex: new RegExp(filter.search, 'i') } },
            { 'jobsiteRef.createdByUser.fullName': { $regex: new RegExp(filter.search, 'i') } },
            { 'scheduledTestRef.serviceConfirmationNumber': { $regex: new RegExp(filter.search, 'i') } },
            { 'jobsiteRef.streetAddress': { $regex: new RegExp(filter.search, 'i') } },
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

    aggregateQuery.push({
      $addFields: {
        filesLength: { $size: '$files' },
      },
    });

    const result = await reportService.queryReportsAggregated(caseInsensitiveFilter, options, aggregateQuery);

    res.send(result);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getMyAllReports = catchAsync(async (req, res) => {
  try {
    const filter = pick(req.query, ['search', 'status']);
    const caseInsensitiveFilter = {
      createdByUser: mongoose.Types.ObjectId(req.user._id),
    };

    const options = pick(req.query, ['sortBy', 'limit', 'page', 'filesLength']);

    const aggregateQuery = [
      { $match: caseInsensitiveFilter },
      {
        $lookup: {
          from: 'scheduledtests',
          localField: 'scheduledTestRef',
          foreignField: '_id',
          as: 'scheduledTestRef',
        },
      },
      { $unwind: '$scheduledTestRef' },
      {
        $lookup: {
          from: 'jobsites',
          localField: 'jobsiteRef',
          foreignField: '_id',
          as: 'jobsiteRef',
        },
      },
      { $unwind: '$jobsiteRef' },
      {
        $lookup: {
          from: 'counties',
          localField: 'jobsiteRef.county',
          foreignField: '_id',
          as: 'jobsiteRef.county',
        },
      },
      { $unwind: '$jobsiteRef.county' },
      {
        $lookup: {
          from: 'users',
          localField: 'jobsiteRef.createdByUser',
          foreignField: '_id',
          as: 'jobsiteRef.createdByUser',
        },
      },
      { $unwind: '$jobsiteRef.createdByUser' },
      {
        $addFields: {
          id: '$_id',
          'jobsiteRef.id': '$jobsiteRef._id',
          'jobsiteRef.county.id': '$jobsiteRef.county._id',
          'jobsiteRef.createdByUser.id': '$jobsiteRef.createdByUser._id',
          'scheduledTestRef.id': '$scheduledTestRef._id',
        },
      },
    ];

    if (filter.search) {
      aggregateQuery.push({
        $match: {
          $or: [
            { 'scheduledTestRef.primaryContactName': { $regex: new RegExp(filter.search, 'i') } },
            { 'jobsiteRef.createdByUser.fullName': { $regex: new RegExp(filter.search, 'i') } },
            { 'scheduledTestRef.serviceConfirmationNumber': { $regex: new RegExp(filter.search, 'i') } },
            { 'jobsiteRef.streetAddress': { $regex: new RegExp(filter.search, 'i') } },
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

    aggregateQuery.push({
      $addFields: {
        filesLength: { $size: '$files' },
      },
    });

    const result = await reportService.queryReportsAggregated(caseInsensitiveFilter, options, aggregateQuery);

    res.send(result);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const updateReportStatus = catchAsync(async (req, res) => {
  try {
    const { reportId, newStatus } = req.query;
    const report = await reportService.updateReportStatus(reportId, newStatus);

    res.send(report);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const deleteFileFromReport = catchAsync(async (req, res) => {
  try {
    const { reportId, fileKey } = req.query;
    const report = await reportService.deleteFileFromReport(reportId, fileKey);

    res.send(report);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const attatchFileToReport = catchAsync(async (req, res) => {
  try {
    const { file } = req;
    const { reportId } = req.body;
    const report = await reportService.attatchFileToReport(reportId, file);

    res.send(report);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const shareReportByEmail = catchAsync(async (req, res) => {
  try {
    const attachmentsFromUpload = req.files;
    const { reportId, subject, sendTo, message } = req.body;

    // Step 1: Get report by id
    const report = await reportService.getReportById(reportId);
    const { jobsiteRef, scheduledTestRef } = report;

    // Step 2: Get the files associated with the report from the database
    // const attachmentsFromDatabase = await Promise.all(
    //   report.files.map(async (fileKey) => {
    //     try {
    //       const { data, base64Data } = await s3Service.fetchMediaBase64(fileKey);

    //       return {
    //         content: base64Data,
    //         filename: fileKey, // Using fileKey as filename, adjust if necessary
    //         type: data.ContentType,
    //         disposition: 'attachment',
    //       };
    //     } catch (error) {
    //       console.error('Error fetching attachment from database:', error);
    //       throw error; // Handle this error more gracefully in a real application
    //     }
    //   })
    // );

    // Combine attachments from upload and database
    const combinedAttachments = [...attachmentsFromUpload];

    // Step 3: Process the combined array of attachments
    const parsedAttachments = await Promise.all(
      combinedAttachments.map(async (attachment) => {
        try {
          if (attachment.bucket && attachment.key) {
            // It's coming from S3
            const { data, base64Data } = await s3Service.fetchMediaBase64(attachment.key);

            return {
              content: base64Data,
              filename: attachment.originalname,
              type: attachment.mimetype,
              disposition: 'attachment',
            };
          }

          return attachment;
        } catch (error) {
          console.error('Error fetching attachment:', error);
          throw error;
        }
      })
    );

    const emailObj = {
      subject,
      // subject2: `Hi, ${report.jobsiteRef.createdByUser.firstName}!`,
      message,
      message2: `The backflow report for ${jobsiteRef.name} at ${scheduledTestRef.serviceConfirmationNumber} is ready!`,
      attachments: parsedAttachments,
    };

    const parsedEmailList = JSON.parse(sendTo)
      .map((elem) => elem.value)
      .concat(scheduledTestRef.email);

    await emailService.sendShareReportEmail(parsedEmailList, emailObj);

    res.status(200).send({ message: messages.ReportSharedSuccessfully });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const deleteReportByAdmin = catchAsync(async (req, res) => {
  try {
    /**
     * Delete report (completely)
     */
    await reportService.deleteReportById(req.params.reportId);

    /**
     * Delete backflow tests (completely)
     */
    await backflowService.deleteBackflowTestsByReportRef(req.params.reportId);

    res.status(httpStatus.OK).send({ message: messages.ResourceDeletedSuccessfully });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

module.exports = {
  getReportById,
  getAllExistingReports,
  getMyAllReports,
  updateReportStatus,
  attatchFileToReport,
  shareReportByEmail,
  deleteFileFromReport,
  deleteReportByAdmin,
};
