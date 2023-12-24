const express = require('express');
const router = express.Router();
const userRouter = require('./userRoutes');
const serviceProviderRoutes = require('./serviceProviderRoutes');
const coachRoutes = require('./coachRoutes');
const fileRoutes = require('./fileRoutes');
const subscriptionPlanRoutes = require('./subscriptionPlanRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const groupCategoryRoutes = require('./groupCategoryRoutes');
const servicesRoutes = require('./servicesRoutes');
const ratingRoutes = require('./ratingRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const videoRoutes = require('./videoRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const notificationRoutes = require('./notificationRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const lens = require('./lens');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Appointment' });
});

router.use('/api/v1/users', userRouter);
router.use('/api/v1/service/providers', serviceProviderRoutes);
router.use('/api/v1/coaches', coachRoutes);
router.use('/api/v1/file', fileRoutes);
router.use('/api/v1/subscriptionPlans', subscriptionPlanRoutes);
router.use('/api/v1/subscription', subscriptionRoutes);
router.use('/api/v1/groupCategories', groupCategoryRoutes);
router.use('/api/v1/services', servicesRoutes);
router.use('/api/v1/ratings', ratingRoutes);
router.use('/api/v1/products', productRoutes);
router.use('/api/v1/orders', orderRoutes);
router.use('/api/v1/videos', videoRoutes);
router.use('/api/v1/appointments', appointmentRoutes);
router.use('/api/v1/notifications', notificationRoutes);
router.use('/api/v1/dashboard', dashboardRoutes);
router.use('/api/v1/lens', lens);

module.exports = router;
