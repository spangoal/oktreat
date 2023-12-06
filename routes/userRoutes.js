var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.patch("/update", authController.protect, authController.update);
router.post("/socialLogin", authController.socialLogin);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch(
  "/changePassword",
  authController.protect,
  authController.changePassword
);

router.get("/profile", authController.protect, authController.profile);
router.patch("/updateUDID", authController.protect, authController.updateUDID);

router.delete(
  "/deleteDeviceToken",
  authController.protect,
  authController.deleteDeviceToken
);

router.delete(
  "/deleteAccount",
  authController.protect,
  authController.deleteAccount
);

router.route("/").get(authController.protect, userController.getAllUser);
router.route("/:id").get(authController.protect, userController.getUser);

module.exports = router;
