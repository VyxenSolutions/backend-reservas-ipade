const express = require('express');
const { createReservation, confirmReservation, getMyReservations } = require('../controllers/reservation.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', protect, createReservation);
router.get('/confirm', confirmReservation);
router.get('/mine', protect, getMyReservations);

module.exports = router;
