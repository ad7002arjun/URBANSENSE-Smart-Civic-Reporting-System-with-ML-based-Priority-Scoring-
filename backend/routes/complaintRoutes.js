const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getComplaints,
    getComplaint,
    getMyComplaints,
    updateStatus,
    upvoteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router
    .route('/')
    .get(protect, getComplaints)
    .post(protect, upload.single('image'), createComplaint);

router.get('/my', protect, getMyComplaints);
router.get('/:id', protect, getComplaint);
router.put(
    '/:id/status',
    protect,
    authorize('authority', 'admin'),
    updateStatus
);
router.put('/:id/upvote', protect, upvoteComplaint);

module.exports = router;