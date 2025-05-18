const express = require('express');
const auth = require('../../middlewares/auth');
const countyController = require('../../controllers/county.controller');

const router = express.Router();

router.get('/getCountyById/:countyId', auth(), countyController.getCountyById);
router.get('/getAllCounties', countyController.getAllCounties);
router.post('/createCounty', auth('admin'), countyController.createCounty);
router.put('/updateCounty', auth('admin'), countyController.updateCounty);

module.exports = router;
