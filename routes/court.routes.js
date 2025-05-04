const express = require('express');
const { createCourt, getCourts, toggleAvailability, getCourtAvailability } = require('../controllers/court.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

//router.post('/', protect, restrictTo('admin_global', 'devops'), createCourt);
router.post('/', createCourt);
router.get('/', protect, getCourts);
router.get('/:id/availability', protect, getCourtAvailability);
router.patch('/:id/availability', protect, restrictTo('admin_global', 'support'), toggleAvailability);

module.exports = router;
