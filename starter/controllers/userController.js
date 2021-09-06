const userModel = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

///multer configuration for storing any data

///cb is a callback function similar to next function
//first argument will be error and second parameter will be the path

// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('NOT AN IMAGE! PLEASE UPLOAD ONLY IMAGES', 400), true);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.compressUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const filterObj = (obj, ...rest) => {
  const newObj = {};
  Object.keys(obj).forEach((value) => {
    if (rest.includes(value)) newObj[value] = obj[value];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await userModel.find();

  res.status(200).json({
    status: 'success',
    count: users.length,
    data: users,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  // console.log('---------', req.file);
  //console.log(req.body);

  //// check if the user has added password fields
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  /////filter out unwanted field names that are not allowed to be updated
  const filterBody = filterObj(req.body, 'userName', 'email');
  // console.log(filterBody);
  if (req.file) filterBody.photo = req.file.filename;

  ////update userdocument
  const user = await userModel.findByIdAndUpdate(req.user._id, filterBody, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  // console.log(user);

  res.status(200).json({
    status: 'success',
    docs: user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
