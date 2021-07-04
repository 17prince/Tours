const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const AppError = require('../utiles/appError');
const Tour = require(`./../models/tourModel`);

const catchAsync = require(`./../utiles/catchAsync`);

exports.alert = (req, res, next) => {
  const { alert } = req.query;

  if (alert === 'booking') {
    res.locals.alert =
      "Your booking was successful ! Please check your email for a confromation. If your booking doesn't show up here immediatly, please come back later ";
  }

  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'self https://*cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js'
    )
    .render('overview', {
      title: 'All Tours',
      tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1. Get the data, for required tour(including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.tourname }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  // if no tour found
  if (!tour) {
    return next(new AppError('No tour found with this name.', 404));
  }

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'self https://*api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js'
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'self https://*cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js'
    )
    .render('login', {
      title: 'LOGIN',
    });
});

exports.getSignInForm = catchAsync(async (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'self https://*cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js'
    )
    .render('signup', {
      title: 'SIGN UP',
    });
});

exports.getAccount = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'self https://*cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js'
    )
    .render('account', {
      title: 'Your Account',
    });
};

exports.getMyTour = catchAsync(async (req, res, next) => {
  // 1. Find all the bookings
  const bookings = await Booking.find({ user: req.user._id });

  // 2. Find tours with the returned ids
  const tourIds = bookings.map((ele) => ele.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  if (tours.length == 0) {
    return res.status(200).render('notours', {
      title: 'No tours',
    });
  }

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'self https://*cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js'
    )
    .render('overview', {
      title: 'My Tours',
      tours,
    });
});

// update-user-data
// exports.updateUserData = catchAsync(async (req, res) => {
//   const updateUser = await User.findByIdAndUpdate(
//     req.user._id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   res
//     .status(200)
//     .set(
//       'Content-Security-Policy',
//       'self https://*cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js'
//     )
//     .render('account', {
//       title: 'Your Account',
//       user: updateUser,
//     });
// });
