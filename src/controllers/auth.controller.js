const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, notifyUserService } = require('../services');
const {
  UserRegisteredMessage,
  RsetPasswordEmailSent,
  ResetPasswordSuccess,
  UserCreatedMessage,
  EmailVerificationSent,
  AccountAlreadyVerified,
  AccountVerifiedByAdmin,
} = require('../utils/message');

const register = catchAsync(async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);

    /**
     * Notify User
     */
    const emailObj = {
      subject: 'One Flow - Verify Your Account',
      subject2: `Hi, ${user.firstName}!`,
      message:
        'You’re almost done. We need you to verify your account before continuing. Click on the link below to get started.',
      verificationLink: `${process.env.FRONTEND_URL}/account-verification?token=${verifyEmailToken}`,
    };
    await notifyUserService.userNotificationAboutVerificationEmail(user.email, emailObj);

    res.status(httpStatus.CREATED).send({ message: UserRegisteredMessage });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const registerAdmin = catchAsync(async (req, res) => {
  try {
    const user = await userService.createAdmin(req.body);

    res.status(httpStatus.CREATED).send(user);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const newCustomerRegistrationByAdmin = catchAsync(async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);

    /**
     * Notify User
     */
    const emailObj = {
      subject: 'One Flow - Verify Your Account',
      subject2: `Hi, ${user.firstName}!`,
      message:
        'You’re almost done. We need you to verify your account before continuing. Click on the link below to get started.',
      verificationLink: `${process.env.FRONTEND_URL}/account-verification?token=${verifyEmailToken}`,
    };
    await notifyUserService.userNotificationAboutVerificationEmail(user.email, emailObj);

    res.status(httpStatus.CREATED).send({ message: UserCreatedMessage });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const login = catchAsync(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUserWithEmailAndPassword(email, password);
    const tokens = await tokenService.generateAuthTokens(user);
    res.send({ user, tokens });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const refreshTokens = catchAsync(async (req, res) => {
  try {
    const tokens = await authService.refreshAuth(req.body.refreshToken);
    res.send({ ...tokens });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const forgotPassword = catchAsync(async (req, res) => {
  try {
    const { resetPasswordToken, user } = await tokenService.generateResetPasswordToken(req.query.email);

    /**
     * Notify User
     */
    const emailObj = {
      subject: 'One Flow - Reset Account Password',
      subject2: `Hi, ${user.fullName}!`,
      message:
        'To reset your password, click on this link If you did not request any password resets, then ignore this email.',
      resetPasswordUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`,
    };
    await notifyUserService.userNotificationAboutResetPasswordEmail(req.query.email, emailObj);

    res.status(httpStatus.OK).send({ message: RsetPasswordEmailSent });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const resetPassword = catchAsync(async (req, res) => {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.status(httpStatus.OK).send({ message: ResetPasswordSuccess });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  try {
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);

    /**
     * Notify User
     */
    const emailObj = {
      subject: 'One Flow - Verify Your Account',
      subject2: `Hi, ${req.user.firstName}!`,
      message:
        'You’re almost done. We need you to verify your account before continuing. Click on the link below to get started.',
      verificationLink: `${process.env.FRONTEND_URL}/account-verification?token=${verifyEmailToken}`,
    };
    await notifyUserService.userNotificationAboutVerificationEmail(req.user.email, emailObj);

    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const verifyEmail = catchAsync(async (req, res) => {
  try {
    const message = await authService.verifyEmail(req.query.token);
    res.status(httpStatus.OK).send({ message });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const adminResendVerificationEmail = catchAsync(async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await userService.getUserById(userId);

    if (user.isEmailVerified) {
      res.status(httpStatus.BAD_REQUEST).send({ message: AccountAlreadyVerified });
      return;
    }

    const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
    /**
     * Notify User
     */
    const emailObj = {
      subject: 'One Flow - Verify Your Account',
      subject2: `Hi, ${user.firstName}!`,
      message:
        'You’re almost done. We need you to verify your account before continuing. Click on the link below to get started.',
      verificationLink: `${process.env.FRONTEND_URL}/account-verification?token=${verifyEmailToken}`,
    };
    await notifyUserService.userNotificationAboutVerificationEmail(user.email, emailObj);

    res.status(httpStatus.OK).send({ message: EmailVerificationSent });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

const verifyAccountByAdmin = catchAsync(async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await userService.getUserById(userId);

    if (user.isEmailVerified) {
      res.status(httpStatus.BAD_REQUEST).send({ message: AccountAlreadyVerified });
      return;
    }

    user.isEmailVerified = true;
    await userService.updateUserById(userId, { isEmailVerified: true });

    res.status(httpStatus.OK).send({ message: AccountVerifiedByAdmin });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send({ error: error.message });
  }
});

module.exports = {
  register,
  registerAdmin,
  login,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  newCustomerRegistrationByAdmin,
  adminResendVerificationEmail,
  verifyAccountByAdmin,
};
