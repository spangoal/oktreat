const express = require("express");
const router = express.Router({ mergeParams: true });
const appointmentController = require("../controllers/appointmentController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(authController.protect, appointmentController.getAllAppointmentCoach)
  .post(authController.protect, appointmentController.createAppointment);

router
  .route("/:id")
  .patch(
    authController.protect,
    authController.restrictTo("coach", "admin"),
    appointmentController.updateAppointment
  )
  .delete(
    authController.protect,
    authController.restrictTo("coach", "admin"),
    appointmentController.deleteAppointment
  );

module.exports = router;
