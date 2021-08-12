const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const toursSchema = new Schema({
  tourName: {
    type: String,
    unique: true,
    required: [true, 'A tour must have a name'],
    trim: true, //trim is used to remove the white space from the data
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    trim: true,
    required: [true, 'A tour must have a description'],
  },
  summary: {
    type: String,
    required: [true, 'Age Required'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String], //array of strings//array of images
  startDates: [Date], //array of dates
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Tours', toursSchema);
