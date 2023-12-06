const express = require('express');
const router = express.Router();
const subscriptionPlanController = require('../controllers/subscriptionPlanController');
const authController = require('../controllers/authController');

router
  .route('/')
  .get(
    authController.protect,
    subscriptionPlanController.getAllSubscriptionPlan
  )
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    subscriptionPlanController.createSubscriptionPlan
  );

router
  .route('/:id')
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    subscriptionPlanController.updateSubscriptionPlan
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    subscriptionPlanController.deleteSubscriptionPlan
  );

module.exports = router;
