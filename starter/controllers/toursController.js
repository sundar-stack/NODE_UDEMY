const toursModel = require('../model/toursModel');
const ApiFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'tourName,difficulty,ratingsAverage,price,summary';
  next();
};

//sudnar

exports.addTour = async (req, res) => {
  const body = req.body;
  try {
    const addTourModel = await toursModel.create(body);
    res.status(201).json({
      status: 'success',
      data: { addTourModel },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const getTour = await toursModel.findById(req.params.id);
    /// alternate method :- model.findOne({ _id : req.params.id })
    res.status(201).json({
      status: 'success',
      data: getTour,
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updateTour = await toursModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(201).json({
      status: 'success',
      data: updateTour,
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await toursModel.findByIdAndDelete(req.params.id);
    res.status(201).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};
