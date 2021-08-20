const userModel = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const JWT = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signInToken = (userId) => {
  return JWT.sign({ JWTUserID: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await userModel.create({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = signInToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
    data: user,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  ///BODY
  const { email, password } = req.body;

  ////check if username and password exists
  if (!email || !password) {
    return next(new AppError('Please enter email/password', 400));
  }

  ////check if user is there and password is correct or invalid
  const user = await userModel.findOne({ email: email }).select('+password'); //we have disabled password field in model but here we need password for verififcation so we are using select +
  console.log(user);
  const decryptPass = await user.correctPassword(password, user.password);
  console.log(decryptPass);

  if (!user || !decryptPass) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signInToken(user._id);

  ////create and send the token
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  /////GETTING TOKEN AND CHECK IF IT'S THERE
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // console.log(token);

  if (!token) {
    return next(
      new AppError(
        'Authorization Failed! You are not logged in Please Login to get access'
      ),
      401
    );
  }

  //// VERIFICATION OF THE TOKEN

  const decoded = await JWT.verify(token, process.env.JWT_SECRET);
  console.log(decoded);

  
  /// CHECK IF THE USER STILL EXISTS

  // const freshUser = userModel.findById(decoded.JWTUserID)
  
  /// CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
  next();
});
