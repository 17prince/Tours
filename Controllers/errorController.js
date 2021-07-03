const AppError = require(`./../utiles/appError`);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value`;

  return new AppError(message, 400);
};

const handelValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((ele) => ele.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const hadleJWTtokenError = () =>
  new AppError('Invalid token, please login again', 401);

const handleJWTExpiredError = () =>
  new AppError('Token expired, please login again', 401);

const sendErrorDev = (err, req, res) => {
  // 1. APIS
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // 2. RENDERED WEBSITE
  console.error('ERROR: ', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong !!',
    msg: err.message,
  });
};

const sendErrorPro = (err, req, res) => {
  // 1. APIS
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      // Operational, trusted error: send message to clinet
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // Programming error or other unknown error: don't show error to the clinet
    // 1) Log Error
    console.error('ERROR: ', err);

    //2) Send generic error
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }

  // 2. RENDERED WEBSITE
  if (err.isOperational) {
    // Operational, trusted error: send message to clinet
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong !!',
      msg: err.message,
    });
  }

  // Programming error or other unknown error: don't show error to the clinet
  // 1) Log Error
  console.error('ERROR: ', err);

  //2) Send generic error
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong !!',
    msg: 'Please try again later !!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;

    // Error for invalid id
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    // Error for duplicate fileds
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    // Error for validation
    if (error.name === 'ValidationError')
      error = handelValidationErrorDB(error);
    // JsonWebTokenError
    if (error.name === 'JsonWebTokenError') error = hadleJWTtokenError();
    // TokenExpiredError
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorPro(error, req, res);
  }
};
