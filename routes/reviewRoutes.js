const express = require('express');

const reviewController = require(`./../Controllers/reviewController`);
const authController = require(`./../Controllers/authController`);

const routes = express.Router({ mergeParams: true });

routes.use(authController.protect);

routes
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

routes
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = routes;
