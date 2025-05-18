const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const userService = require('../services/user.service');
const notifyUserService = require('../services/notifyUser.service');
const notificationService = require('../services/notification.service');
const { jobsiteService, scheduledTestService, reportService, backflowService, stripeService } = require('../services');
const { UserNotFound, EmailIsUnique, NetUserApproved } = require('../utils/message');
const { IsNetTermsApprovedByAdminTypes, NOTIFICATION_STATE_TYPES } = require('../utils/constants');
const messages = require('../utils/message');

const getUserById = catchAsync(async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, UserNotFound);
    }
    res.send(user);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const getAllUsers = catchAsync(async (req, res) => {
  try {
    const filter = pick(req.query, [
      'search',
      'isEmailVerified',
      'accountType',
      'currentSubscriptionPlan',
      'cardBrand',
      'isEmailVerified',
      'isNetTermsApprovedByAdmin',
      'accountStatus',
    ]);
    const caseInsensitiveFilter = {
      role: 'user',
      isAccountDeleted: false,
    };

    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    const aggregateQuery = [
      { $match: caseInsensitiveFilter },
      {
        $lookup: {
          from: 'subscriptions',
          localField: 'currentSubscriptionPlan',
          foreignField: '_id',
          as: 'currentSubscriptionPlan',
        },
      },
      { $unwind: '$currentSubscriptionPlan' },
      {
        $addFields: {
          id: '$_id',
          'currentSubscriptionPlan.id': '$currentSubscriptionPlan._id',
        },
      },
    ];

    if (filter.search) {
      aggregateQuery.push({
        $match: {
          $or: [
            { fullName: { $regex: new RegExp(filter.search, 'i') } },
            { phoneNumber: { $regex: new RegExp(filter.search, 'i') } },
            { 'currentSubscriptionPlan.name': { $regex: new RegExp(filter.search, 'i') } },
            { 'stripe.cardBrand': { $regex: new RegExp(filter.search, 'i') } },
          ],
        },
      });
    }

    if (filter.isEmailVerified) {
      aggregateQuery.push({
        $match: {
          isEmailVerified: { $eq: filter.isEmailVerified === 'true' },
        },
      });
    }

    if (filter.accountType) {
      aggregateQuery.push({
        $match: {
          accountType: { $eq: filter.accountType },
        },
      });
    }

    if (filter.currentSubscriptionPlan) {
      aggregateQuery.push({
        $match: {
          'currentSubscriptionPlan.name': { $eq: filter.currentSubscriptionPlan },
        },
      });
    }

    if (filter.cardBrand) {
      if (filter.cardBrand === 'none') {
        aggregateQuery.push({
          $match: {
            'stripe.cardBrand': { $exists: false },
          },
        });
      } else if (filter.cardBrand !== 'none') {
        aggregateQuery.push({
          $match: {
            'stripe.cardBrand': { $eq: filter.cardBrand },
          },
        });
      }
    }

    if (filter.isNetTermsApprovedByAdmin) {
      aggregateQuery.push({
        $match: {
          isNetTermsApprovedByAdmin: { $eq: filter.isNetTermsApprovedByAdmin },
        },
      });
    }

    if (filter.accountStatus) {
      if (filter.accountStatus === 'pending') {
        aggregateQuery.push({
          $match: {
            isEmailVerified: { $eq: false },
          },
        });
      } else if (filter.accountStatus === 'verified') {
        aggregateQuery.push({
          $match: {
            isEmailVerified: { $eq: true },
          },
        });
      } else if (filter.accountStatus === 'net terms') {
        aggregateQuery.push({
          $match: {
            isNetTermsApprovedByAdmin: { $eq: IsNetTermsApprovedByAdminTypes.pending },
          },
        });
      }
    }

    const result = await userService.queryUsersAggregated(caseInsensitiveFilter, options, aggregateQuery);

    res.send(result);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const emailUniqueCheck = catchAsync(async (req, res) => {
  try {
    await userService.emailUniqueCheck(req.query.email);
    res.status(httpStatus.OK).send({ message: EmailIsUnique });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const approveNetUser = catchAsync(async (req, res) => {
  try {
    await userService.approveNetUser(req.params.userId);
    res.status(httpStatus.OK).send({ message: NetUserApproved });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const toggleUserAccess = catchAsync(async (req, res) => {
  try {
    const user = await userService.toggleUserAccess(req.params.userId);
    res
      .status(httpStatus.OK)
      .send({ message: user.isAccountEnabled ? messages.AccountActivated : messages.AccountDeactivated });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const deleteUser = catchAsync(async (req, res) => {
  try {
    const { userId } = req.params;

    /**
     * Fetching User
     */
    const user = await userService.getUserById(userId);

    /**
     * Delete User (completely)
     */
    await userService.deleteUser(userId);

    /**
     * Delete Jobsites (completely)
     */
    await jobsiteService.deleteJobsitesByUserId(userId);

    /**
     * Delete Scheduled Tests (completely)
     */
    await scheduledTestService.deleteScheduledTestsByUserId(userId);

    /**
     * Delete Reports (completely)
     */
    await reportService.deleteReportsByUserId(userId);

    /**
     * Delete Backflow Tests (completely)
     */
    await backflowService.deleteBackflowTestsByUserId(userId);

    /**
     * Notify user using email
     */
    const emailObj = {
      subject: 'One Flow - Updates to your account',
      subject2: `Hi, ${user.firstName}!`,
      message: 'There’s been a change to your  Oneflow Backflow Account.',
      details: messages.AccountDeleted,
      isAccountEnabled: false,
      loginLink: `${process.env.FRONTEND_URL}/login`,
    };
    await notifyUserService.userManagementNotify(user.email, emailObj);

    res.status(httpStatus.OK).send({ message: messages.UserAccountDeleted });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const changePassword = catchAsync(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    await userService.changeUserPassword(req.user._id, currentPassword, newPassword);

    res.status(httpStatus.OK).send({ message: messages.PasswordChanged });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const updateContactInfo = catchAsync(async (req, res) => {
  try {
    await userService.updateContactInfo(req.user._id, req.body);

    res.status(httpStatus.OK).send({ message: messages.ResourceUpdatedSuccessfully });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const updateStripeAndAttatchStripeCustomerIdAndPmId = catchAsync(async (req, res) => {
  try {
    const { stripeCustomerId, paymentMethodId } = req.body.stripe;
    await userService.updateStripeAndAttatchStripeCustomerIdAndPmId(req.user._id, req.body);

    /**
     * Attatch Stripe Customer Id & Payment Method Id
     */
    await stripeService.attatchPaymentMethodToCustomer(stripeCustomerId, paymentMethodId);

    res.status(httpStatus.OK).send({ message: messages.ResourceUpdatedSuccessfully });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const updateCreditPointForUser = catchAsync(async (req, res) => {
  try {
    const { userId, creditPoint } = req.body;
    await userService.updateCreditPointByUserId(userId, creditPoint);

    /**
     * Notify user using database Notification
     */
    const NOTIFICATION_TITLE_STATUS = 'GOOD NEWS!';
    const bodyTextStatus = `Your account has been credited with ${creditPoint} points ($${creditPoint} in credit). They'll automatically be used in the next test you schedule.`;
    await notificationService.createNotificationForUser(
      NOTIFICATION_STATE_TYPES.USER_CREDITED_POINTS,
      userId,
      NOTIFICATION_TITLE_STATUS,
      bodyTextStatus,
      {
        redirectUrl: `${process.env.FRONTEND_URL}/account`,
      }
    );

    res.status(httpStatus.OK).send({ message: messages.ResourceUpdatedSuccessfully });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

module.exports = {
  getUserById,
  getAllUsers,
  emailUniqueCheck,
  approveNetUser,
  toggleUserAccess,
  deleteUser,
  changePassword,
  updateContactInfo,
  updateStripeAndAttatchStripeCustomerIdAndPmId,
  updateCreditPointForUser,
};
