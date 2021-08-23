const userModel = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const JWT = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signInToken = (userId) => {
  return JWT.sign({ JWTUserID: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await userModel.create(
    //   {
    //   userName: req.body.userName,
    //   email: req.body.email,
    //   password: req.body.password,
    //   confirmPassword: req.body.confirmPassword,
    // }
    req.body
  );

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
  console.log('user', user);
  const decryptPass = await user.correctPassword(password, user.password);
  console.log('decryptPass', decryptPass);

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

  const currentUser = await userModel.findById(decoded.JWTUserID);
  // console.log(currentUser);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does not exist', 400)
    );
  }

  /// CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED

  // const passwordChanged = await currentUser.passwordChanged(decoded.iat)
  // console.log(passwordChanged);

  if (await currentUser.passwordChanged(decoded.iat)) {
    return next(
      new AppError('User Recently changed password!,PLease LOGIN again', 401)
    );
  }

  ///GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...rest) => {
  return (req, res, next) => {
    console.log(rest);
    if (!rest.includes(req.user.role)) {
      return next(
        new AppError('You dont have permission to perform this action!', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  ///get user on posted email
  const user = await userModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with tht email address', 404));
  }

  ///generate a random reset token
   const randomToken = await user.createPasswordResetToken()
   console.log(randomToken);

  await user.save({ validateBeforeSave : false })

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/${randomToken}`
 
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
 
  try{
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });
  
    res.status(200).json({
      status:'success',
      message:'Token sent to email'
    })
  
  }catch(err){
    user.resetPasswordToken = undefined 
    user.resetPasswordExpires = undefined
    await user.save({ validateBeforeSave : false })
    return next(new AppError("There was an error while sending a email to user",500))
  }
  ////send it to user's email 
  //  next()
});

exports.resetPassword = catchAsync(async (req, res, next) => {});
