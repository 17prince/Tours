const express = require('express');

const bookingController = require(`./../Controllers/bookingController`);
const authController = require(`./../Controllers/authController`);

const routes = express.Router();

routes.use(authController.protect);

routes.get(
  '/checkout-session/:tourId',

  bookingController.getCheckoutSession
);

routes.use(authController.restrictTo('admin', 'lead-guide'));

routes.route('/').get(bookingController.getAllBookings);
// .post(bookingController.createBookingCheckout);

routes
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = routes;
