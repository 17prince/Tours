const express = require('express');

const authController = require(`./../Controllers/authController`);
const viewController = require(`./../Controllers/viewController`);
const bookingController = require('../Controllers/bookingController');

const routes = express.Router();

// check if the user is logged in to render user photo and name
routes.use(viewController.alert);

routes.get('/', authController.isLogged, viewController.getOverview);
routes.get('/tour/:tourname', authController.isLogged, viewController.getTour);
routes.get('/login', authController.isLogged, viewController.getLoginForm);
routes.get('/signup', authController.isLogged, viewController.getSignInForm);
routes.get('/me', authController.protect, viewController.getAccount);
routes.get('/my-tours', authController.protect, viewController.getMyTour);
// routes.post(
//   '/update-user-data',
//   authController.protect,
//   viewController.updateUserData
// );

module.exports = routes;
