const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const messages = require('../utils/message');

const verifyCallback = (req, resolve, reject, requiredRights, routeRole) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  if (routeRole === 'admin' && user.role !== routeRole) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, messages.UnauthorizedAccess));
  }
  if (!user.isAccountEnabled) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, messages.AccountDeactivated));
  }
  if (user.isAccountDeleted) {
    return reject(new ApiError(httpStatus.BAD_REQUEST, messages.AccountDeleted));
  }

  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const auth =
  (routeRole = 'user', requiredRights = []) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights, routeRole))(
        req,
        res,
        next
      );
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
