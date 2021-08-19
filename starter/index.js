const express = require('express');
const morgan = require('morgan');

const toursRouter = require('./routes/toursRoutes');
const usersRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError')
const errorController  = require('./controllers/errorController');

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


app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);

//unhandled routes if the requestURL is incorrect
app.all('*', (req, res, next) => {
/////IF THE NEXT FUNCTION RECEIVES AN ARGUMENT NO MATTER WHAT IT IS EXPRESS WILL AUTOMATICALLY KNOW THAT THERE IS AN ERROR;
///WHENEVER WE PASS ANYTHING IN NEXT FUNCTION IT WILL TAKE IT AS A ERROR

  next(new AppError(`Cannot find ${req.originalUrl} from the server !`,404));
});

app.use(errorController);

module.exports = app;
