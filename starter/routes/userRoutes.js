const express = require('express')
const router = express.Router();

const userController = require('../controllers/userController')

//users route
router.route('/').get(userController.getAllUsers).post(userController.addUser);

router
  .route('/:id')
  .put(userController.updateUser)
  .patch(userController.modifyUser)
  .delete(userController.deleteUser);

module.exports = router