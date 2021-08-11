const express = require('express')
const router = express.Router();


const  toursController = require('../controllers/toursController')

router.param('id',toursController.checkId)
router.route('/').get(toursController.getAllTours).post(toursController.addTour);
router.route('/:id').get(toursController.getTour).patch(toursController.updateTour);

module.exports = router