const express = require('express');
const router = express.Router();
const {
    getStats,
    getPriorityComplaints,
    recalculatePriorities,
    getComparison,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, getStats);
router.get('/complaints', protect, getPriorityComplaints);
router.post(
    '/recalculate',
    protect,
    authorize('authority', 'admin'),
    recalculatePriorities
);
router.get('/comparison', protect, getComparison);

module.exports = router;