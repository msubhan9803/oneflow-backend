const express = require('express');
const auth = require('../../middlewares/auth');
const generalController = require('../../controllers/general.controller');

const router = express.Router();

router.get('/getAllCountries', auth(), generalController.getAllCountries);

module.exports = router;
