const express = require('express');

const userController = require(`./../Controllers/userController`);
const authController = require(`./../Controllers/authController`);

const routes = express.Router();

// USER ROUTES

routes.post('/signup', authController.singup);
routes.post('/login', authController.login);
routes.get('/logout', authController.logout);

routes.post('/forgotpassword', authController.forgetPassword);
routes.patch('/resetpassword/:token', authController.resetPassword);

// To protect all the routes after this middleware
routes.use(authController.protect);

routes.patch('/updatemypassword', authController.updatePassword);

// update current user data
routes.patch(
  '/updateme',
  userController.uploadUserImage,
  userController.resizeUserImage,
  userController.updateMe
);
// delete user account
routes.delete('/deleteme', userController.deleteMe);
// get current user data
routes.get('/getme', userController.getme, userController.getUser);

// For admin use only
routes.use(authController.restrictTo('admin'));

routes
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
routes
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = routes;
