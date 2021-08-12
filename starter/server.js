//server
const dotenv = require('dotenv');
const app = require('./index');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const DB = process.env.PASSWORD.replace('<password>', process.env.NODE_ENV);

mongoose.connect(
  DB,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('DB CONNECTED SUCCESFULLY');
    }
  }
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server started on ${PORT}.....`);
});
