const httpStatus = require('http-status');
const { User, Subscription } = require('../models');
const ApiError = require('../utils/ApiError');
const { YourEmailAddressIsAlreadyInUse, UserNotFound, AccountActivated, AccountDeactivated } = require('../utils/message');
const constants = require('../utils/constants');
const messages = require('../utils/message');
const notifyUserService = require('./notifyUser.service');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, YourEmailAddressIsAlreadyInUse);
  }

  /**
   * Finding Free Subscription
   */
  const freeSubscription = await Subscription.findOne({ name: constants.SUBSCRIPTION_TYPES.free });

  return User.create({
    ...userBody,
    currentSubscriptionPlan: freeSubscription._id,
    subscriptionsTracking: [
      {
        subscribedPlan: freeSubscription._id,
        subscriptionStartedDate: new Date(),
      },
    ],
    isNetTermsApprovedByAdmin: userBody.isNetPaymentTermRequired
      ? constants.IsNetTermsApprovedByAdminTypes.pending
      : constants.IsNetTermsApprovedByAdminTypes.notApplicable,
  });
};

/**
 * Create admin
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createAdmin = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, YourEmailAddressIsAlreadyInUse);
  }

  let user = await User(userBody);
  user.role = 'admin';
  user.isEmailVerified = true;
  user.isAccountEnabled = true;

  user = await user.save();

  return user;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Query for users aggregated
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsersAggregated = async (filter, options, aggregateQuery) => {
  const users = await User.aggregatedPaginate(filter, options, aggregateQuery);
  return users;
};

/**
 * Get All Users
 * @returns {Promise<QueryResult>}
 */
const getAllUsers = async () => {
  const users = await User.find();
  return users;
};

/**
 * Get All Admin Users
 * @returns {Promise<QueryResult>}
 */
const getAllAdminUsers = async () => {
  const adminUsers = await User.find({ role: 'admin' });
  return adminUsers;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const user = await User.findById(id).populate('currentSubscriptionPlan');
  return user;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email }).populate('currentSubscriptionPlan');
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, UserNotFound);
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, YourEmailAddressIsAlreadyInUse);
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, UserNotFound);
  }
  await user.remove();
  return user;
};

/**
 * Email Unique Check
 * @param {String} email
 * @returns {Promise<User>}
 */
const emailUniqueCheck = async (email) => {
  if (await User.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, YourEmailAddressIsAlreadyInUse);
  }

  return true;
};

/**
 * Approve Net User
 * @param {String} userId
 * @returns {Promise<User>}
 */
const approveNetUser = async (userId) => {
  let user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, UserNotFound);
  }

  user.isNetTermsApprovedByAdmin = constants.IsNetTermsApprovedByAdminTypes.approved;
  user = await user.save();

  /**
   * Notify user using email
   */
  const emailObj = {
    subject: 'One Flow - You’ve been approved!',
    subject2: `Hi, ${user.firstName}!`,
    message: 'You’re net payment terms request has been approved. You can now schedule backflow tests.',
    loginLink: `${process.env.FRONTEND_URL}/login`,
  };
  await notifyUserService.userNetAccountApprovalNotify(user.email, emailObj);

  return true;
};

/**
 * Toggle User Access
 * @param {String} userId
 * @returns {Promise<User>}
 */
const toggleUserAccess = async (userId) => {
  let user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, UserNotFound);
  }

  user.isAccountEnabled = !user.isAccountEnabled;
  user = await user.save();

  /**
   * Notify user using email
   */
  const emailObj = {
    subject: 'One Flow - Updates to your account',
    subject2: `Hi, ${user.firstName}!`,
    message: 'There’s been a change to your  Oneflow Backflow Account.',
    details: user.isAccountEnabled ? AccountActivated : AccountDeactivated,
    isAccountEnabled: user.isAccountEnabled,
    loginLink: `${process.env.FRONTEND_URL}/login`,
  };
  await notifyUserService.userManagementNotify(user.email, emailObj);

  return user;
};

/**
 * Delete User
 * @param {String} userId
 * @returns {Promise<User>}
 */
const deleteUser = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, UserNotFound);
  }

  await user.deleteOne();
};

/**
 * Get User Count
 * @returns {Promise<Number>}
 */
const getUserCount = async () => {
  const totalCustomersCount = await User.countDocuments({ role: 'user' });
  return totalCustomersCount;
};

/**
 * Change user's password
 * @param {String} userId
 * @param {String} currentPassword
 * @param {String} newPassword
 * @returns {Promise<User>}
 */
const changeUserPassword = async (userId, currentPassword, newPassword) => {
  let user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.UserNotFound);
  }

  const isPasswordValid = await user.isPasswordMatch(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, messages.InvalidCurrentPassword);
  }

  user.password = newPassword;
  user = await user.save();

  return user;
};

/**
 * Update Contact Info
 * @param {String} userId
 * @param {Object} userObj
 * @returns {Promise<User>}
 */
const updateContactInfo = async (userId, userObj) => {
  let user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.UserNotFound);
  }

  Object.assign(user, userObj);
  user = await user.save();

  return user;
};

/**
 * Update Stripe And Attatch Stripe Customer Id And Pm Id
 * @param {String} userId
 * @param {Object} userObj
 * @returns {Promise<User>}
 */
const updateStripeAndAttatchStripeCustomerIdAndPmId = async (userId, userObj) => {
  let user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.UserNotFound);
  }

  Object.assign(user, userObj);
  user = await user.save();

  return user;
};

/**
 * Update Contact Info
 * @param {String} userId
 * @param {Number} creditPoint
 */
const updateCreditPointByUserId = async (userId, creditPoint) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.UserNotFound);
  }

  user.creditPoint = creditPoint;
  await user.save();
};

module.exports = {
  createUser,
  createAdmin,
  queryUsers,
  queryUsersAggregated,
  getUserById,
  getAllUsers,
  getAllAdminUsers,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  emailUniqueCheck,
  approveNetUser,
  toggleUserAccess,
  deleteUser,
  getUserCount,
  changeUserPassword,
  updateContactInfo,
  updateStripeAndAttatchStripeCustomerIdAndPmId,
  updateCreditPointByUserId,
};
