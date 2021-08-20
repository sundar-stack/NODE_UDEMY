//server
const dotenv = require('dotenv').config({ path: './config.env' });

///To catch unhandled exceptions error
process.on('uncaughtException', (err) => {
  console.log('UNHANDLED REJECTION! SHUTTING DOWN');
  console.log(err.name, '<|>', err.message);
  process.exit(1);
});

const app = require('./index');
const mongoose = require('mongoose');

//  console.log(process.env);

const DB = process.env.PASSWORD.replace('<password>', process.env.NODE_ENV);

mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('DB CONNECTED SUCCESFULLY'));

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`server started on ${PORT}.....`);
});

//////handling unhandle rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! SHUTTING DOWN');
  console.log(err.name, '<|>', err.message);
  server.close(() => {
    process.exit(1);
  });
});
