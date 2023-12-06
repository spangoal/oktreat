const express = require('express');
const router = express.Router();
const groupCategoryController = require('../controllers/groupCategoryController');
const authController = require('../controllers/authController');

router
  .route('/')
  .get(authController.protect, groupCategoryController.getAllGroupCategory)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    groupCategoryController.createGroupCategory
  );

router
  .route('/:id')
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    groupCategoryController.updateGroupCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    groupCategoryController.deleteGroupCategory
  );

module.exports = router;
