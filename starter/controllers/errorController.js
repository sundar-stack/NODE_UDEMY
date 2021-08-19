const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `INVALID ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleFieldErrorDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate field value : ${value} please enter another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // console.log(err);
  const message = Object.values(err.errors).map(el => el.message)
  
  return new AppError(message.join('. '), 400);
};

const sendErrDev = (err, res) => {
  res.status(err.statusCode).send({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sendErrProd = (err, res) => {
  ///OPERATIONAL ERROR
  // console.log(err);
  if (err.isOperational) {
    res.status(err.statusCode).send({
      status: err.status,
      message: err.message,
    });
    ////LIKE ANY PROGRAMING ERROR
  } else {
    console.log('ERROR', err);

    //2.send message to client
    res.status(500).json({
      status: 'error',
      message: 'something went very wrong !',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.isOperational = err.isOperational || true;

  if (process.env.ENVIRONMENT === 'development') {
    sendErrDev(err, res);
  } else if (process.env.ENVIRONMENT === 'production') {
    let error = Object.create(err); ////Object.create() method creates a new object, using an existing object as the prototype of the newly created object.
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    if (error.code === 11000) error = handleFieldErrorDB(error);

    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrProd(error, res);
  }
};
