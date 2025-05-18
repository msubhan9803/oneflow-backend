const express = require('express');
const auth = require('../../middlewares/auth');
const scheduledTestController = require('../../controllers/scheduledTest.controller');
const { addSingleMediaMiddleware } = require('../../middlewares/multer');

const router = express.Router();

router.get('/getAllExistingScheduledTests', auth('admin'), scheduledTestController.getAllExistingScheduledTests);
router.get('/getScheduledTestById/:scheduledTestId', auth(), scheduledTestController.getScheduledTestById);
router.get(
  '/getScheduledTestByServiceConfirmationNumber/:serviceConfirmationNumber',
  auth(),
  scheduledTestController.getScheduledTestByServiceConfirmationNumber
);
router.get('/getMyAllScheduledTests', auth(), scheduledTestController.getMyAllScheduledTests);
router.get('/getAllScheduledTestsByUserId/:userId', auth(), scheduledTestController.getAllScheduledTestsByUserId);
router.get(
  '/getAllRequestLogsByScheduledId/:scheduledTestId',
  auth(),
  scheduledTestController.getAllRequestLogsByScheduledId
);
router.get('/getCostCalculation', auth(), scheduledTestController.getCostCalculation);
router.post('/createPaymentIntent', auth(), scheduledTestController.createPaymentIntent);
router.post('/scheduledATest', auth(), addSingleMediaMiddleware, scheduledTestController.scheduledATest);
router.post('/updateScheduleTestStatus', auth('admin'), scheduledTestController.updateScheduleTestStatus);
router.post('/applyTripFee', auth('admin'), scheduledTestController.applyTripFee);
router.post('/addExtraTest', auth('admin'), scheduledTestController.addExtraTest);
router.post('/confirmRequest', auth('admin'), scheduledTestController.confirmRequest);
router.post('/resheduleRequest', auth(), scheduledTestController.resheduleRequest);
router.post('/rescheduleTest', scheduledTestController.rescheduleTest);
router.post('/toggleScheduledTestPaidState', auth('admin'), scheduledTestController.toggleScheduledTestPaidState);
router.delete('/deleteScheduledTestById/:scheduledTestId', auth(), scheduledTestController.deleteScheduledTestById);

module.exports = router;
