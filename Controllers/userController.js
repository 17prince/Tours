const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');

const catchAsync = require(`./../utiles/catchAsync`);
const AppError = require(`./../utiles/appError`);
const factory = require('./factoryHandler');

// multer storing file in a better way
// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/img/users');
//   },
//   filename: function (req, file, cb) {
//     // filename:  user-324h234j42lk332-time(13345334243).format(jpg, jpeg, png)
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();

// filting file: only image formate are allowed
const multerFileFilter = (req, file, cb) => {
  // accepting file
  if (file.mimetype.split('/')[0] === 'image') {
    cb(null, true);
  } else {
    // rejecting file
    cb(
      new AppError(
        'Please provide a valid image with extention like .jpeg, .jpg, .png',
        400
      ),
      false
    );
  }
};

// multer user image upload
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFileFilter,
});

exports.uploadUserImage = upload.single('photo');

// Resizing user profile image
exports.resizeUserImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...fieldsToFilter) => {
  const newObj = {};
  Object.keys(obj).forEach((ele) => {
    if (fieldsToFilter.includes(ele)) newObj[ele] = obj[ele];
  });
  return newObj;
};

exports.getme = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Update current user data
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Create error if the user post the password data
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'You can not update password from this route. Please use /updatemypassword to update password',
        400
      )
    );
  }
  // 2. Filter the req.body
  const filteredBody = filterObj(req.body, 'name', 'email');
  // updating user photo
  if (req.file) filteredBody.photo = req.file.filename;
  // 3. update the current user data
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Delete user account(inactive)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route is not yet defined.',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// Do not update password this handler
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
