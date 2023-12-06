const express = require("express");
const router = express.Router({ mergeParams: true });
const ratingController = require("../controllers/ratingController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(authController.protect, ratingController.getAllRating)
  .post(authController.protect, ratingController.createRating);

router
  .route("/:id")
  .patch(authController.protect, ratingController.updateRating)
  .delete(authController.protect, ratingController.deleteRating);

module.exports = router;
