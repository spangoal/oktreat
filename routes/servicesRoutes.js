const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authController = require('../controllers/authController');

router
    .route('/')
    .get(authController.protect, serviceController.getAllServices)
    .post(authController.protect, serviceController.createServices);

router
    .route('/:id')
    .get(authController.protect, serviceController.getService)
    .delete(authController.protect, serviceController.deleteService);

module.exports = router;
