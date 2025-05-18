const httpStatus = require('http-status');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const messages = require('../utils/message');
const s3Service = require('../services/s3.service');

const getMedia = catchAsync(async (req, res) => {
  try {
    const object = s3Service.s3.getObject({
      Bucket: s3Service.bucketName,
      Key: req.params.fileKey,
    });

    const readStream = object.createReadStream();

    // Get file extension and determine MIME type
    const ext = path.extname(req.params.fileKey);
    let mimeType;

    switch (ext.toLowerCase()) {
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.pdf':
        mimeType = 'application/pdf';
        break;
      case '.doc':
        mimeType = 'application/msword';
        break;
      case '.docx':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.xls':
        mimeType = 'application/vnd.ms-excel';
        break;
      case '.xlsx':
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      // Add more cases as needed
      default:
        mimeType = 'application/octet-stream';
    }

    res.setHeader('Content-Type', mimeType);

    readStream.on('error', (err) => {
      console.log('getting media error from s3: ', err);
      // ... (rest of your error handling code)
    });

    readStream.pipe(res);
  } catch (err) {
    // ... (rest of your error handling code)
  }
});

const addMedia = catchAsync(async (req, res) => {
  const fileKey = req.file.key;
  res.status(httpStatus.CREATED).json({ fileKey });
});

const updateMedia = catchAsync(async (req, res) => {
  try {
    const { oldFileKey } = req.params;

    await s3Service.s3
      .deleteObject({
        Bucket: s3Service.bucketName,
        Key: oldFileKey,
      })
      .promise();

    s3Service.uploadSingle(req, res, (err) => {
      if (err) {
        return res.status(500).json({ message: messages.s3UploadingError });
      }
      res.json({ fileKey: oldFileKey });
    });
  } catch (err) {
    res.status(500).json({ message: messages.s3UploadError });
  }
});

const addMultipleMedia = catchAsync(async (req, res) => {
  const fileKeys = req.files.map((file) => file.key);

  res.status(httpStatus.OK).json({ fileKeys });
});

module.exports = {
  getMedia,
  addMedia,
  updateMedia,
  addMultipleMedia,
};
