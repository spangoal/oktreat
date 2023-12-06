const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authController = require('../controllers/authController');

router
  .route('/')
  .get(authController.protect, groupController.getAllGroup)
  .post(
    authController.protect,
    authController.restrictTo('coach'),
    groupController.createGroup
  );

router
  .route('/:id')
  .get(authController.protect, groupController.getGroup)
  .delete(
    authController.protect,
    authController.restrictTo('coach'),
    groupController.deleteGroup
  );

router.route('/:groupId/join').post(authController.protect, groupController.joinGroup);

module.exports = router;
