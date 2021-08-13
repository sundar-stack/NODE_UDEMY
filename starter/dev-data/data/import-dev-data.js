//server
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const toursModel = require('../../model/toursModel');

dotenv.config({ path: '../../config.env' });

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

const file = JSON.parse(fs.readFileSync('./tours-simple.json'), 'utf-8');

const exportAllTours = async () => {
  try {
    await toursModel.create(file);
    console.log('sucessfully imported');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteAllTours = async () => {
  try {
    await toursModel.deleteMany();
    console.log('Deleted Successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

console.log(process.argv[2]);

if (process.argv[2] === '--import') {
  exportAllTours();
} else if (process.argv[2] === '--delete') {
  deleteAllTours();
}
