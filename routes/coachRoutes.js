const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');
const authController = require('../controllers/authController');
const timeSlotRoutes = require('./timeSlotRoutes');
const coachAppointmentRoutes = require('./coachAppointmentRoutes');

router.use('/:coachID/timeSlots', timeSlotRoutes);
router.use('/:coachID/appointments', coachAppointmentRoutes);

router.route('/').get(authController.protect, coachController.getAllCoach);

router.route('/:id').get(authController.protect, coachController.getCoach);

module.exports = router;
