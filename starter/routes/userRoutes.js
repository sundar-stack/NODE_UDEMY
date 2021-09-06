const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

//users route
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updateMyPassword
);
router.get('/getAllUsers', authController.protect, userController.getAllUsers);
router.delete('/deleteUser', authController.protect, userController.deleteUser);

router.patch(
  '/updateUser',
  authController.protect,
  userController.uploadUserPhoto,
  userController.compressUserPhoto,
  userController.updateUser
);

////test route
router.get('/auth', authController.protect, authController.checkAuth);

module.exports = router;
