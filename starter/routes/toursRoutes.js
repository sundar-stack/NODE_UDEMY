const express = require('express');

const router = express.Router();

const toursController = require('../controllers/toursController');
const practiceController = require('../controllers/practiceController');
const authController = require('../controllers/authController');


router
  .route('/')
  .get(authController.protect,authController.restrictTo('admin','researcher'),toursController.getAllTours)
  .post(toursController.addTour);

//aliasing routes for special filtering
router.route('/top-5-cheap').get(toursController.aliasTopTours,toursController.getAllTours)

router.route('/getStats').get(toursController.getTourStats)
router.get('/monthlyTours/:year',toursController.monthlyTours)
  
router.get('/practice',practiceController.practiceGetAllTours)


router
  .route('/:id')
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(authController.protect,authController.restrictTo('admin','researcher'),toursController.deleteTour);

module.exports = router;
