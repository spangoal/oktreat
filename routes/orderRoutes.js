const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(authController.protect, orderController.getAllOrder)
  .post(authController.protect, orderController.createOrder);

router
  .route("/:id")
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    orderController.updateOrder
  );

router.route("/all").get(authController.protect, orderController.getAllOrderAdmin);

module.exports = router;
