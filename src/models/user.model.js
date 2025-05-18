const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate, aggregatedPaginate } = require('./plugins');
const { roles } = require('../config/roles');
const { USER_ACCOUNT_TYPES, PAYMENT_TERMS_TYPES } = require('../utils/constants');
const constants = require('../utils/constants');

const userSchema = mongoose.Schema(
  {
    accountType: {
      type: String,
      trim: true,
      enum: Object.keys(USER_ACCOUNT_TYPES),
      required: false,
    },
    firstName: {
      type: String,
      required: false,
      trim: true,
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
    },
    companyName: {
      type: String,
      required: false,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      trim: true,
      // minlength: 8,
      // validate(value) {
      //   if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
      //     throw new Error('Password must contain at least one letter and one number');
      //   }
      // },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isAccountEnabled: {
      type: Boolean,
      default: true,
    },
    isAccountDeleted: {
      type: Boolean,
      default: false,
    },
    isNetPaymentTermRequired: {
      type: Boolean,
      default: false,
    },
    netPaymentTerm: {
      fullName: {
        type: String,
        required: false,
        trim: true,
        default: '',
      },
      roleOrJobTitle: {
        type: String,
        required: false,
        trim: true,
        default: '',
      },
      phoneNumber: {
        type: String,
        required: false,
        trim: true,
        default: '',
      },
      email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
        default: '',
      },
      paymentTerms: {
        type: String,
        trim: true,
        enum: Object.keys(PAYMENT_TERMS_TYPES).concat(''),
        required: false,
        default: '',
      },
    },
    profilePicture: {
      type: String,
      required: false,
    },
    isTermsAndConditionsAccepted: {
      type: Boolean,
    },
    isNetTermsApprovedByAdmin: {
      type: String,
      enum: Object.values(constants.IsNetTermsApprovedByAdminTypes),
    },

    /**
     * Subscription related fields
     */
    currentSubscriptionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    subscriptionsTracking: [
      {
        subscribedPlan: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subscription',
        },
        subscriptionStartedDate: {
          type: Date,
        },
      },
    ],

    /**
     * Stripe
     */
    stripe: {
      stripeCustomerId: String,
      paymentMethodId: String,
      cardBrand: String,
      cardExpMonth: String,
      cardExpYear: String,
      cardLast4: String,
      country: String,
      zipCode: String,
    },
    creditPoint: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);
userSchema.plugin(aggregatedPaginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  user.fullName = `${user.firstName} ${user.lastName}`;

  next();
});

/**
 * Check if the user's email is verified
 * @returns {boolean}
 */
userSchema.methods.isEmailVerifiedCheck = function () {
  return this.isEmailVerified;
};

/**
 * Check if the user's account is enabled
 * @returns {boolean}
 */
userSchema.methods.isAccountActive = function () {
  return this.isAccountEnabled;
};

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
