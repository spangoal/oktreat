const express = require('express');
const router = express.Router({ mergeParams: true });
const timeSlotController = require('../controllers/timeSlotController');
const authController = require('../controllers/authController');

router
  .route('/')
  .get(authController.protect, timeSlotController.getAllTimeSlot)
  .post(
    authController.protect,
    authController.restrictTo('coach', 'admin'),
    timeSlotController.createTimeSlot
  );

router
  .route('/:id')
  .patch(
    authController.protect,
    authController.restrictTo('coach', 'admin'),
    timeSlotController.updateTimeSlot
  )
  .delete(
    authController.protect,
    authController.restrictTo('coach', 'admin'),
    timeSlotController.deleteTimeSlot
  );

module.exports = router;
