const express = require("express");
const router = express.Router({ mergeParams: true });
const videoController = require("../controllers/videoController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(authController.protect, videoController.getAllVideo)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    videoController.createVideo
  );

router
  .route("/:id")
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    videoController.updateVideo
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    videoController.deleteVideo
  );

module.exports = router;
