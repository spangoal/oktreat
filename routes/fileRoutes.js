const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const fileController = require('../controllers/fileController');
const { uploadSingle } = require('./../utils/multer');

router.route('/upload').post(uploadSingle, fileController.uploadFile);
router.route('/delete').delete(fileController.deleteFile);

module.exports = router;
