const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authController = require('../controllers/authController');

router
  .route('/dataCount')
  .get(authController.protect, dashboardController.getDataCount)
 

module.exports = router;
