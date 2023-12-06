const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(authController.protect, subscriptionController.getSubscription)
  .post(authController.protect, subscriptionController.createSubscription);

router
  .route("/all")
  .get(authController.protect, subscriptionController.getAllSubscription);

module.exports = router;
