const express = require('express');
const auth = require('../../middlewares/auth');
const jobsiteController = require('../../controllers/jobsite.controller');

const router = express.Router();

router.get('/getJobsiteById/:jobsiteId', auth(), jobsiteController.getJobsiteById);
router.get('/getAllJobsites', auth('admin'), jobsiteController.getAllJobsites);
router.get('/getMyJobsites', auth(), jobsiteController.getMyJobsites);
router.post('/createJobsite', auth(), jobsiteController.createJobsite);
router.put('/updateJobsite', auth(), jobsiteController.updateJobsite);
router.delete('/deleteJobsite/:jobsiteId', auth(), jobsiteController.deleteJobsite);

module.exports = router;
