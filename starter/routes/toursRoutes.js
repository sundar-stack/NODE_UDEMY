const express = require('express');

const router = express.Router();

const toursController = require('../controllers/toursController');
const practiceController = require('../controllers/practiceController');

router
  .route('/')
  .get(toursController.getAllTours)
  .post(toursController.addTour);

//aliasing routes for special filtering
router.route('/top-5-cheap').get(toursController.aliasTopTours,toursController.getAllTours)

router.route('/getStats').get(toursController.getTourStats)
router.get('/monthlyTours',toursController.monthlyTours)
  
router.get('/practice',practiceController.practiceGetAllTours)


router
  .route('/:id')
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(toursController.deleteTour);

module.exports = router;
