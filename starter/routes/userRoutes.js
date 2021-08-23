const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');

//users route
router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.post('/forgotPassword',authController.forgotPassword)
router.post('/resetPassword/:token',authController.resetPassword)

// router.route('/').get(userController.getAllUsers).post(userController.addUser);

// router
//   .route('/:id')
//   .put(userController.updateUser)
//   .patch(userController.modifyUser)
//   .delete(userController.deleteUser);

module.exports = router;
