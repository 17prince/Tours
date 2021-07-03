const mongoose = require('mongoose');

// const User = require('./userModel');
const Tour = require('./tourModel');

const reviewsSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
      maxlength: 200,
    },
    rating: {
      type: Number,
      max: 5,
    },
    createAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belongs to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belongs to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Preventing duplicate reviews and with same user on a tour
reviewsSchema.index({ tour: 1, user: 1 }, { unique: true });

// Query middleware
// TO populate user and tour data on review
reviewsSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Mongodb Statics

// Calculating average rating for new tour
reviewsSchema.statics.calcAverageRatings = async function (tourId) {
  const statics = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (statics.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: statics[0].nRating,
      ratingsAverage: statics[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// set aveage rating of a tour
reviewsSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
// updating and deleteing tour rating using query middleware
reviewsSchema.pre(/^findOneAnd/, async function (next) {
  // here this is query object by doing so we are adding r property to the query object
  this.r = await this.findOne();

  next();
});

reviewsSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewsSchema);

module.exports = Review;
