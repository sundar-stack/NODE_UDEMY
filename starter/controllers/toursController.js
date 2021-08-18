const toursModel = require('../model/toursModel');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'tourName,difficulty,ratingsAverage,price,summary';
  next();
};

exports.addTour = catchAsync(async (req, res, next) => {
  const body = req.body;

  const addTourModel = await toursModel.create(body);
  res.status(201).json({
    status: 'success',
    data: { addTourModel },
  });
});

exports.getAllTours = catchAsync(async (req, res,next) => {
  const features = new ApiFeatures(toursModel.find(), req.query)
    .filter()
    .sort()
    .limitingFields()
    .paginate();
  const getTours = await features.query;
  
  //send the response
  res.status(201).json({
    status: 'success',
    count: getTours.length,
    data: getTours,
  });
});

exports.getTour = catchAsync(async (req, res,next) => {
  const getTour = await toursModel.findById(req.params.id);
  /// alternate method :- model.findOne({ _id : req.params.id })

  if(!getTour){
    return next(new AppError('THERE IS NO RECORD MATCHING THAT ID',404))
  }
  res.status(201).json({
    status: 'success',
    data: getTour,
  });
});

exports.updateTour = catchAsync(async (req, res,next) => {
  const updateTour = await toursModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if(!updateTour){
    return next(new AppError('THERE IS NO RECORD MATCHING THAT ID',404))
  }

  res.status(201).json({
    status: 'success',
    data: updateTour,
  });
});

exports.deleteTour = catchAsync(async (req, res,next) => {
  const tours =  await toursModel.findByIdAndDelete(req.params.id);

  if(!tours){
    return next(new AppError('THERE IS NO RECORD MATCHING THAT ID',404))
  }
  res.status(201).json({
    status: 'success',
    data: null,
  });
});

//AGGREFATION PIPELINING

exports.getTourStats = catchAsync(async (req, res,next) => {
  const stats = await toursModel.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        sum: { $sum: 1 },
        sumOfRatings: { $sum: '$ratingsAverage' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $avg: '$price' },
        minPrice: { $avg: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    {
      $match: { _id: { $ne: 'EASY' } },
    },
  ]);
  if(!stats){
    return next(new AppError('THERE IS NO RECORD MATCHING THAT ID',404))
  }
  res.status(201).json({
    status: 'success',
    count: stats.length,
    data: stats,
  });
});

exports.monthlyTours = catchAsync(async (req, res,next) => {
  const year = req.params.year * 1;

  ////show no of tours in a year
    const tours = await toursModel.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          sumOfMonthlyTours: { $sum: 1 },
          tours: { $push: '$tourName' }, ///we use push method to create a array in aggregate method
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          ///removes the field if we give it 0
          _id: 0,
        },
      },
      {
        $sort: { sumOfMonthlyTours: -1 }, ///sort -1 means descending order
      },
      // {
      //   $limit:2 ///limit gives only the no of docs that we want it acts like pagination
      // }
    ]);

    if(!tours){
      return next(new AppError('THERE IS NO RECORD MATCHING THAT ID',404))
    }

    res.status(201).json({
      status: 'success',
      count: tours.length,
      data: tours,
    });
  
});
