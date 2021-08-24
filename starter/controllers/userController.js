const userModel = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...rest) => {
  const newObj = {};
  Object.keys(obj).forEach((value) => {
    if (rest.includes(value)) newObj[value] = obj[value];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await userModel.find()

  res.status(200).json({
    status: 'success',
    count: users.length,
    data: users,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
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
  console.log(filterBody);

  ////update userdocument
  const user = await userModel.findByIdAndUpdate(req.user._id, filterBody, {
    new: true,
    runValidators: true,
  });
  console.log(user);

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
