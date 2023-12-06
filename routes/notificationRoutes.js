const express = require('express');
const router = express.Router();
const notificationController = require('./../controllers/notificationController');
const authController = require('../controllers/authController');

router
  .route('/me')
  .get(authController.protect, notificationController.getAllNotification);

router
  .route('/markRead/all')
  .post(authController.protect, notificationController.markReadAllNotification);

router
  .route('/markRead/:id')
  .post(authController.protect, notificationController.markReadNotification);

module.exports = router;
