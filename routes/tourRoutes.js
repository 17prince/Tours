const express = require('express');

const tourController = require(`./../Controllers/tourController`);
const authController = require(`./../Controllers/authController`);

const reviewRoutes = require(`./reviewRoutes`);

const routes = express.Router();

// PARAM MIDDLEWARE
// routes.param('id', tourController.checkID);

routes.use('/:tourId/reviews', reviewRoutes);

// TOUR ROUTS
routes
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

routes.route('/tour-static').get(tourController.getTourStatic);

routes
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

// get all tour with in the radius
routes
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);

// get all distances from current location to tour location
routes.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

routes.route('/plan-expired').get(tourController.planExpired);

routes
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
routes
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImage,
    tourController.resizeTourImage,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// POST: tour/:tourId/review
// GET: tour/:tourId/review

module.exports = routes;
