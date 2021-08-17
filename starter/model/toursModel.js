const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const toursSchema = new Schema({
  tourName: {
    type: String,
    unique: true,
    required: [true, 'A tour must have a name'],
    trim: true, //trim is used to remove the white space from the data,+
    //validators
    maxLength: [40, 'A tour name must have less or equal than 40 characters'],
    minLength: [10, 'A tour name must have more or equal then 10 characters'],
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
      //validators
    enum:{
      values:["easy","medium","difficult"],
      message:" Difficulty should be one of these options: easy , medium , difficult "
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
      //validators
    min:[1,'Ratings must be above 1.0'],
    max:[5,'Ratings must be below 5.0'],
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
    required: [true, 'A tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  secretTour: {
    type: Boolean,
    default: false,
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
    select: false, //select:false permanently hides the field in the api response
  },
  priceDiscount:{
    type:Number,
      ///custom validators => validate the function 
    validate:{
      validator:function(value){
        // console.log(value,this.price); 
        return value < this.price ///only false will trigger the validation error
      },
      message:`Discount of ({VALUE}) should not be more than price`
    }
  }
});

///DOCUMENT MIDDLEWARE => this middleware will run before save() and create()
///PRE before mongo method executes
///POST AFTER mongo method executes
toursSchema.pre('save', function (next) {
  this.slug = this.tourName;
  next();
});

// toursSchema.pre('save', function (next) {
//   console.log('waiting for the confirmation');
//   next();
// });

// toursSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE
//by setting this there will no docs if secret tour is set to true
toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

///aggregate Middleware
toursSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

toursSchema.post(/^find/, function (docs, next) {
  console.log(`query took ${Date.now() - this.start} milliseconds to execute!`);
  // console.log(docs);
  next();
});

module.exports = mongoose.model('Tours', toursSchema);
