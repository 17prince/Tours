const mongoose = require('mongoose');
const validator = require('validator');

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: [30, 'Maximum length of name can be 30'],
    minlength: [3, 'Minimum length of name should 5'],
    required: [true, 'Name can not be empty'],
  },

  email: {
    type: String,
    required: [true, 'Email is requried'],
    unique: [true, 'This email is in use, please try another valid email'],
    lowercase: true,
    validate: [validator.isEmail, 'Please use a valid email'],
  },

  photo: {
    type: String,
    default: 'default.jpg',
  },

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    maxlength: [20, 'Maximum length of password can be 20'],
    minlength: [8, 'Minimum length of password can be 8'],
    select: false,
  },

  confirmPassword: {
    type: String,
    required: [true, 'Please Confirm Password'],
    validate: {
      validator: function (ele) {
        return ele === this.password;
      },
      message: 'Password does not match',
    },
  },

  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  changedPasswordAt: Date,
  passwordResetExpires: Date,
  passwordResetToken: String,
});

// Mongo hook(middleware)

// // set changedPasswordAt to current time when user reset the password and got new token
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.changedPasswordAt = Date.now() - 1000;
  next();
});

// For password encryption
userSchema.pre('save', async function (next) {
  // runs if the password is modified.
  if (!this.isModified('password')) return next();

  // encrypt the passowrd
  this.password = await bcrypt.hash(this.password, 12);

  // remove confirmpassword field
  this.confirmPassword = undefined;
  next();
});

// query middleware (to inactive or delete the current user )
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

// To check password during longin
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// if the user changes the password
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.changedPasswordAt) {
    const changedTimeStamp = parseInt(
      this.changedPasswordAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimeStamp;
  }
  // It means password does not changed
  return false;
};

// Sending and storing token for reset password
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
