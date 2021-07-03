const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require(`./userModel`);
const Review = require(`./reviewModel`);

//  Crreating Schema for our data model
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have name'],
      unique: true,
      trim: true,
      maxlength: [30, 'A tour must have maximun length of 30'],
      minlength: [10, 'A tour must have minimun length of 10'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A Tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have gourp size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have difficulty level'],
      //only for strings
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'A difficulty can have Easy, Medium and Difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A Tour must have minimun rating of 1'],
      max: [5, 'A Tour must have maximun ration of 5'],
      set: (val) => Math.round(val * 10) / 10, // 4.6666 to 5  and 4.666 *10 = 46.666 => 47 /10 = 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A Tour must have price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only point to current doc on NEW document creation
          return val < this.price; // 100 < 300 => true, but 340 < 300 => false
        },
        message: 'Discount price ({VALUE} should be below regular price)',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A Tour must have Summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      requried: [true, 'A Tour must have Image'],
    },
    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexs
// tourSchema.index({ price: 1 });  //single index
tourSchema.index({ price: 1, ratingsAverage: -1 }); //compound index
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// This is a virtual property which is not going to save into database.
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual property which shows the review field in a tour'
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Mongo middleware or Hooks
// 1. Document hooks: runs before .save() and .create() only

// *This is for embedding the guides in tours (DATA MODLE) but this is not the efficient way that's why
// we are going to implement this modelleing by child referencing

// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));

//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// eslint-disable-next-line prefer-arrow-callback
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// 2. Query Middleware
// For hiding secret Tours
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// For polulating guides data
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -changedPasswordAt',
  });
  next();
});

// eslint-disable-next-line prefer-arrow-callback
// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds.`);
//   // console.log(docs);
//   next();
// });

// 3. Aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

// Data model
const Tour = mongoose.model('Tour', tourSchema);

// const newtour = new Tour({
//   name: 'The Test Tour',
//   price: 347,
//   rating: 2.7,
// });

// newtour.save().then((doc) => {
//   console.log(doc);
// });
module.exports = Tour;
