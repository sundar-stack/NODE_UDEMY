const userModel = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const JWT = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signInToken = (userId) => {
  return JWT.sign({ JWTUserID: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createSendToken = (res, user, statusCode) => {
  const token = signInToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ), ///expires in 1 day // 24 = hours;60=mins;60=secs;1000=milliseconds
    httpOnly: true,
  };

  if (process.env.ENVIRONMENT === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  return res.status(statusCode).json({
    status: 'success',
    token,
    data: user,
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

  createSendToken(res, user, 201);
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

  ////create and send the token
  createSendToken(res, user, 200);
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

  // console.log('token', token);

  //// VERIFICATION OF THE TOKEN
  const decoded = await JWT.verify(token, process.env.JWT_SECRET);
  // console.log(decoded);

  /// CHECK IF THE USER STILL EXISTS

  const currentUser = await userModel.findById(decoded.JWTUserID);
  // console.log('currentUser', currentUser);

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
  const randomToken = await user.createPasswordResetToken();
  // console.log(randomToken);

  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/${randomToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error while sending a email to user', 500)
    );
  }
  ////send it to user's email
  //  next()
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  ///check the user based on forgotPassword Token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await userModel.findOne({
    resetPasswordToken: hashToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  // console.log("user??????????",user);

  ///if the token has not expired , and there is user , set the new password
  if (!user) {
    return next(new AppError('Token is Invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  ///Update changedPasswordAt property for the user

  ///Log the user in ,send JWT
  createSendToken(res, user, 200);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  //// Get user from the collection
  ////findById will not work as intended
  const user = await userModel.findById(req.user._id).select('+password');
  console.log('user>>>>>?????????????>>>>>>>>>', user);

  //// check if posted password is correct with db password
  const decodedPassword = await user.correctPassword(
    req.body.currentPassword,
    user.password
  );
  console.log(decodedPassword);
  if (!decodedPassword) {
    return next(new AppError('Your current password is wrong!', 401));
  }

  ////check enter password is same as old password
  if (req.body.password === req.body.currentPassword) {
    return next(
      new AppError(
        'You have entered your new password same as old password ! Please enter a different password.',
        401
      )
    );
  }

  /// If so, Update Password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  console.log('Npassword>>>>>>>>>>>>>>>>>', user.password);
  await user.save();

  /// Log user in, send JWT
  createSendToken(res, user, 200);
});

exports.checkAuth = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: 'You are authorized!',
  });
});
