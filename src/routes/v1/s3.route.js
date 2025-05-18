const express = require('express');
const s3Controller = require('../../controllers/s3.controller');
const s3Service = require('../../services/s3.service');

const router = express.Router();

router.get('/getMedia/:fileKey', s3Controller.getMedia);
router.post('/addMedia', s3Service.addSingleMediaMiddleware, s3Controller.addMedia);
router.post('/addMultipleMedia', s3Service.addMultipleMiddleware, s3Controller.addMultipleMedia);
router.put('/updateMedia/:oldFileKey', s3Controller.updateMedia);

module.exports = router;
