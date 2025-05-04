const express = require('express');
const { getAdminMetrics } = require('../controllers/metrics.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

//router.get('/', protect, restrictTo('admin_global', 'support'), getAdminMetrics);
router.get('/', getAdminMetrics);

module.exports = router;
