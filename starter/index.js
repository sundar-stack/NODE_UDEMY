const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const toursRouter = require('./routes/toursRoutes');
const usersRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

const app = express();

/// middleware => which stays in between the request and the response
////GLOBAL MIDDLEWARES

///Sets security http requests
app.use(helmet());

app.use(express.static(__dirname + '/public'));
app.use('/img', express.static('img'));

////Body parser for accessing the req.body object
app.use(express.json());

app.use(cors());

////limit the body data upto N size
// app.use(express.json({ limit: '10kb' }));

//Data Sanitize against NoSql query injection ///ex:-inserting some mongo query in the input fields
app.use(mongoSanitize());

//Data Sanitize against xss //ex:- like inserting html or js code in input fields xss converts the code into string
app.use(xss());

///Avoiding Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

////Development Logging
if (process.env.ENVIRONMENT === 'development') {
  app.use(morgan('dev'));
}

//// API LIMIT => rate limiter //limit  requests for same API
/// brutal attacks on server by sending 1000 of requests to hack passwords , so we are setting only N number of requests per particular IP address

const rateLimiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', rateLimiter);

////TEST MIDDLEWARE
app.use((req, res, next) => {
  req.time = new Date().toISOString();
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'succesfully running' });
});

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);

// unhandled routes if the requestURL is incorrect
app.all('*', (req, res, next) => {
  /////IF THE NEXT FUNCTION RECEIVES AN ARGUMENT NO MATTER WHAT IT IS EXPRESS WILL AUTOMATICALLY KNOW THAT THERE IS AN ERROR;
  ///WHENEVER WE PASS ANYTHING IN NEXT FUNCTION IT WILL TAKE IT AS A ERROR

  next(new AppError(`Cannot find ${req.originalUrl} from the server !`, 404));
});

app.use(errorController);

module.exports = app;
