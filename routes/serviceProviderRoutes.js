var express = require("express");
var router = express.Router();
const serviceProviderController = require("../controllers/serviceProviderController");

router.post("/signup", serviceProviderController.signup);
router.post("/login", serviceProviderController.login);
router.patch("/update", serviceProviderController.protect, serviceProviderController.update);
router.post("/socialLogin", serviceProviderController.socialLogin);
router.post("/forgotPassword", serviceProviderController.forgotPassword);
router.patch("/resetPassword/:token", serviceProviderController.resetPassword);
router.patch(
  "/changePassword",
  serviceProviderController.protect,
  serviceProviderController.changePassword
);

router.get("/profile", serviceProviderController.protect, serviceProviderController.profile);
router.patch("/updateUDID", serviceProviderController.protect, serviceProviderController.updateUDID);

router.delete(
  "/deleteDeviceToken",
  serviceProviderController.protect,
  serviceProviderController.deleteDeviceToken
);

router.delete(
  "/deleteAccount",
  serviceProviderController.protect,
  serviceProviderController.deleteAccount
);

router.route("/").get( serviceProviderController.getAllUser);
router.route("/:id").get( serviceProviderController.getUser);

module.exports = router;
