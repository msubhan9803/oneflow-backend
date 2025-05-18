const express = require('express');
const auth = require('../../middlewares/auth');
const reportController = require('../../controllers/report.controller');
const { addSingleMediaMiddleware, addMultipleMiddleware } = require('../../middlewares/multer');

const router = express.Router();

router.get('/getReportById/:reportId', auth(), reportController.getReportById);
router.get('/getMyAllReports', auth(), reportController.getMyAllReports);

router.get('/getAllExistingReports', auth('admin'), reportController.getAllExistingReports);
router.post('/updateReportStatus', auth('admin'), reportController.updateReportStatus);
router.post('/attatchFileToReport', auth('admin'), addSingleMediaMiddleware, reportController.attatchFileToReport);
router.post('/shareReportByEmail', auth('admin'), addMultipleMiddleware, reportController.shareReportByEmail);
router.delete('/deleteFileFromReport', auth('admin'), reportController.deleteFileFromReport);
router.delete('/deleteReportByAdmin/:reportId', auth('admin'), reportController.deleteReportByAdmin);

module.exports = router;
