const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanizite = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require(`./utiles/appError`);
const globalErrorHandler = require(`./Controllers/errorController`);
// MY ROUTES
const viewRoutes = require(`./routes/viewRoutes`);
const reviewRoutes = require(`./routes/reviewRoutes`);
const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require(`./routes/bookingRoutes`);
const bookingController = require('./Controllers/bookingController');

const app = express();

// enabling proxy trust for heroku
app.enable('trust proxy');

// Serving static files

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
// GLOBAL MIDDLEWARE
// setting cross-origin-requests for other domain to access this api
app.use(cors());
// This sets a key in the headers: Access-Control-Allow-Origin * .
// if we want to give access to perticular domain like: api.natours.com, front-end: natours.com
// then,
// app.use(cors({
//   origin: 'https://www.natour.com/'
// }))
// but these are limited for only for GET and POST request(simple request)

// PRE FLIGHT PHASE - for non standard headers
// opptions: is just like normal  http request like GET, POST , DELETE etc.
app.options('*', cors());
// and for perticular route
// app.options('/api/v1/tours/:id', cors());

// Set HTTP security header
app.use(helmet());

// Development logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limiting request
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requrest from this IP. Please try again in an hour.',
});
app.use('/api', limiter);

// adding webhook for payments
app.post(
  '/webhook-checkout',
  express.raw({
    type: 'application/json',
  }),
  bookingController.webhookCheckout
);

// body parser to read the req.body
app.use(express.json({ limit: '10kb' }));

// urlencoded parser
// app.use(express.urlencoded({ limit: '10kb' }));

// cookie parser to read the cookie
app.use(cookieParser());
// Data sanitization to protect against NoSQL query injection
app.use(mongoSanizite());

// Data sanitize against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'maxGroupSize',
    ],
  })
);

// compress all responses
app.use(compression());

// Test middleware
app.use((req, res, next) => {
  res.requestTime = new Date().toISOString();
  next();
});

// ROUTER MIDDLEWARE
app.use('/', viewRoutes);
app.use('/api/v1/tours/', tourRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/bookings', bookingRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can not find ${req.originalUrl} on this server.`, 404));
});

// GOBAL ERROR HANGLLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
