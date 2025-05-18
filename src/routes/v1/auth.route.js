const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/newCustomerRegistrationByAdmin', auth('admin'), authController.newCustomerRegistrationByAdmin);
router.post('/adminResendVerificationEmail', auth('admin'), authController.adminResendVerificationEmail);
router.post('/verifyAccountByAdmin', auth('admin'), authController.verifyAccountByAdmin);
router.post('/registerAdmin', authController.registerAdmin);

module.exports = router;
