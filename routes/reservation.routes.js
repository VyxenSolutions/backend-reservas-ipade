const express = require('express');
const { createReservation, confirmFromQR, getMyReservations } = require('../controllers/reservation.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', protect, createReservation);
router.get('/confirm', protect, confirmFromQR);
router.get('/mine', protect, getMyReservations);

module.exports = router;
