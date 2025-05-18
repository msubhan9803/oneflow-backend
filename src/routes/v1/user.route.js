const express = require('express');
const auth = require('../../middlewares/auth');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.get('/getUserById/:userId', auth(), userController.getUserById);
router.get('/getAllUsers', auth('admin'), userController.getAllUsers);
router.post('/emailUniqueCheck', userController.emailUniqueCheck);
router.post('/approveNetUser/:userId', auth('admin'), userController.approveNetUser);
router.post('/toggleUserAccess/:userId', auth('admin'), userController.toggleUserAccess);
router.delete('/deleteUser/:userId', auth('admin'), userController.deleteUser);
router.post('/changePassword', auth(), userController.changePassword);
router.post('/updateContactInfo', auth(), userController.updateContactInfo);
router.post(
  '/updateStripeAndAttatchStripeCustomerIdAndPmId',
  auth(),
  userController.updateStripeAndAttatchStripeCustomerIdAndPmId
);
router.post('/updateCreditPointForUser', auth('admin'), userController.updateCreditPointForUser);

module.exports = router;
