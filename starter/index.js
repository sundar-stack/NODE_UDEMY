const express = require('express');
const morgan = require('morgan');

const app = express();

/// middleware => which stays in between the request and the response
app.use(morgan('dev'));
app.use(express.json());
//

app.use((req, res, next) => {
  req.time = new Date().toISOString();
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'succesfully running' });
});

const toursRouter = require('./routes/toursRoutes');
const usersRouter = require('./routes/userRoutes');

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);

//unhandled routes if the requestURL is incorrect

app.all('*', (req, res, next) => {
  // res.status(404).send({
  //   status: 'fail',
  //   message: `Cannot find ${req.originalUrl} from the server!`,
  // });

  const err = new Error();
  err.message = `Cannot find ${req.originalUrl} from the server!`;
  err.status = 'Fail';
  err.statusCode = 404;

/////IF THE NEXT FUNCTION RECEIVES AN ARGUMENT NO MATTER WHAT IT IS EXPRESS WILL AUTOMATICALLY KNOW THAT THERE IS AN ERROR;
///WHENEVER WE PASS ANYTHING IN NEXT FUNCTION IT WILL TAKE IT AS A ERROR

  next(err);
});

app.use((err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).send({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
