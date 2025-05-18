const express = require('express');
const auth = require('../../middlewares/auth');
const backflowController = require('../../controllers/backflow.controller');
const { addMultipleMiddleware } = require('../../middlewares/multer');

const router = express.Router();

router.post('/createBackflowTest', auth('admin'), addMultipleMiddleware, backflowController.createBackflowTest);
router.get('/getBackflowsByReportId/:reportId', auth(), backflowController.getBackflowsByReportId);
router.get('/getBackflowsByJobsiteId/:jobsiteId', auth(), backflowController.getBackflowsByJobsiteId);
router.get('/getBackflowsByScheduledTestId/:scheduledTestId', auth(), backflowController.getBackflowsByScheduledTestId);
router.get('/getBackflowById/:backflowId', auth(), backflowController.getBackflowById);
router.put('/updateBackflowTest/:testId', auth('admin'), addMultipleMiddleware, backflowController.updateBackflowTest);
router.delete('/deleteBackflowTest/:testId', auth('admin'), backflowController.deleteBackflowTest);

module.exports = router;
