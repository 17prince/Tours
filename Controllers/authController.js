const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const AppError = require(`./../utiles/appError`);
const User = require(`./../models/userModel`);
const catchAsync = require(`./../utiles/catchAsync`);
const Email = require(`./../utiles/emails`);

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httponly: true,
    secure: req.secure || req.headers('x-forwarded-proto') === 'https',
  });

  // remove password field form response
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.singup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    changedPasswordAt: req.body.changedPasswordAt,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createAndSendToken(newUser, 200, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. check if the user and password is exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400)); // bad request
  }

  // 2. check if the user exist and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401)); //unauthentic access
  }

  // 3. if all good the send  token to the client
  createAndSendToken(user, 200, req, res);
});

// log out route
exports.logout = (req, res, next) => {
  // overwriting the cookie
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httponly: true,
  });

  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Taking token and check if the user is there

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('Yor are not logged in ! Please first login', 401)
    );
  }

  // 2. Token Verification
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if the user still exsit
  const freshUser = await User.findById(decode.id);

  if (!freshUser) {
    return next(
      new AppError('The user belonging this token does no longer exist', 401)
    );
  }

  // 4. check if the user change the password and new token was issued
  if (freshUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError('User recently changed password, please login again')
    );
  }

  // GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = freshUser;
  res.locals.user = freshUser;

  next();
});

// only for render page, is user logged in or not. no error should be return
exports.isLogged = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1. Token Verification
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2. Check if the user still exsit
      const freshUser = await User.findById(decode.id);

      if (!freshUser) {
        return next();
      }

      // 3. check if the user change the password and new token was issued
      if (freshUser.changedPasswordAfter(decode.iat)) {
        return next();
      }
      // Means there is logged user
      res.locals.user = freshUser;
      // console.log(res.locals.user);
      return next();
    } catch {
      return next();
    }
  }
  next();
};

// Restrict to normal user to perform admin task
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles [admin, lead-guide]  and role = 'user'

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to do this action', 401)
      );
    }
    next();
  };

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }

  // 2. Generate the random reset tokem
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send it to user's email
  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetpassword/${resetToken}`;
    // Sending Email to reset password
    await new Email(user, resetUrl).sendResetPassword();
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Reset your password. Valid for 10 minutes',
    //   message,
    // });

    res.status(200).json({
      status: 'success',
      message: 'Token send to email',
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'Opps...!! There was an error occured in sending the email. Please try again',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get the usre based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. Check if the token has expired or not, if not then reset the password
  if (!user) {
    return next(
      new AppError(
        'Your token has expired, please try again to reset your password',
        400
      )
    );
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  // 3. Update changedPassowordAt propertry for the user
  // this step is done into usermodel with the help of middleware
  // 4. Log the user in, send JWT
  createAndSendToken(user, 200, req, res);
});

// Update the password for logged user
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get User from Collection
  const user = await User.findById(req.user._id).select('+password');

  // 2. Verifiy the current password
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(
      new AppError(
        'Your current password does not match. Please try again',
        401
      )
    );
  }
  // 3. if all good then update the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // 4. log user in and send jwt
  createAndSendToken(user, 201, req, res);

  next();
});
