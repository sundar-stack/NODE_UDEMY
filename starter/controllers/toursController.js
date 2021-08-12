const toursModel = require('../model/toursModel');

exports.addTour = async (req, res) => {
  const body = req.body;

  // const newTourBody = new toursModel(body);
  // newTourBody.save({}, (err, docs) => {
  //   if (err) {
  //     res.status(400).json({
  //       status: 'Error',
  //       message: err,
  //     });
  //   } else {
  //     res.status(201).json({
  //       status: 'success',
  //       data: docs,
  //     });
  //   }
  // });

  try {
    const addTourModel = await toursModel.create(body);
    res.status(201).json({
      status: 'success',
      data: addTourModel,
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
    const getTours = await toursModel.find();
    res.status(201).json({
      status: 'success',
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
