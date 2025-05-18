const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// AWS S3 configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const bucketName = process.env.BUCKET_NAME;

// Multer middleware configuration for single file upload
const addSingleMediaMiddleware = multer({
  storage: multerS3({
    s3,
    bucket: bucketName,
    metadata(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
      cb(null, `${Date.now().toString()}-${file.originalname}`);
    },
  }),
}).single('file');

// Multer middleware configuration for multiple files upload
const addMultipleMiddleware = multer({
  storage: multerS3({
    s3,
    bucket: bucketName,
    key(req, file, cb) {
      cb(null, `${Date.now().toString()}-${file.originalname}`);
    },
  }),
}).array('files', 10); // Maximum number of files to upload at once

// Modified Multer middleware configuration for single file upload
const uploadSingle = (req, res, next) => {
  multer({
    storage: multerS3({
      s3,
      bucket: bucketName,
      key(req, file, cb) {
        const key = req.params.oldFileKey;
        cb(null, key);
      },
    }),
  }).single('file')(req, res, next);
};

/**
 * Fetch Media as base64 using key
 * @param {String} reportId
 * @param {Object} file
 * @returns {Promise<Subscription>}
 */
const fetchMediaBase64 = async (fileKey) => {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };

  const data = await s3.getObject(params).promise();
  const base64Data = data.Body.toString('base64');

  return {
    data,
    base64Data,
  };
};

module.exports = {
  s3,
  bucketName,
  addSingleMediaMiddleware,
  addMultipleMiddleware,
  uploadSingle,
  fetchMediaBase64,
};
