const express = require('express');
const morgan = require('morgan');

const app = express();

/// middleware => which stays in between the request and the response
app.use(morgan('dev'));
app.use(express.json());
//
app.use((req, res, next) => {
  console.log('middleware');
  next();
});

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

module.exports = app;
