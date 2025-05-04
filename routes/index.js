const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const reservationRoutes = require('./reservation.routes');
const courtRoutes = require('./court.routes');
const metricsRoutes = require('./metrics.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/reservations', reservationRoutes);
router.use('/courts', courtRoutes);
router.use('/admin/metrics', metricsRoutes);

module.exports = router;
