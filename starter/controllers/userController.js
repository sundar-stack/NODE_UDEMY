const userModel = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  const user = await userModel.create(req.body);

  res.status(201).json({
    status: 'success',
    data: user,
  });
});
