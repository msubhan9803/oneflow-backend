const express = require('express');
const auth = require('../../middlewares/auth');
const subscriptionController = require('../../controllers/subscription.controller');

const router = express.Router();

router.get('/getSubscriptionById/:subscriptionId', auth('admin'), subscriptionController.getSubscriptionById);
router.get('/getAllSubscriptions', auth(), subscriptionController.getAllSubscriptions);
router.get('/retrieveCustomer/:stripeCustomerId', auth('admin'), subscriptionController.retrieveCustomer);
router.get('/retrieveProducts', auth('admin'), subscriptionController.retrieveProducts);
router.get('/retrieveProductByProductId/:productId', auth('admin'), subscriptionController.retrieveProductByProductId);
router.post('/createSubscription', auth('admin'), subscriptionController.createSubscription);
router.put('/updateSubscription', auth('admin'), subscriptionController.updateSubscription);
router.post('/updateUsersToFreePlan', auth('admin'), subscriptionController.updateUsersToFreePlan);
router.post('/createBillingSession', auth(), subscriptionController.createBillingSession);
router.post('/upgradeUserSubscription/:newSubscriptionId', auth(), subscriptionController.upgradeUserSubscription);
router.post('/downgradeUserSubscription/:newSubscriptionId', auth(), subscriptionController.downgradeUserSubscription);

module.exports = router;
