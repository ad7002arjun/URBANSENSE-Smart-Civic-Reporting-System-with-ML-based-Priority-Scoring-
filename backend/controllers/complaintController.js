const Complaint = require('../models/Complaint');
const User = require('../models/User');
const axios = require('axios');
const {
    calculatePriorityScore,
} = require('../utils/priorityEngine');

// @desc    Submit a new complaint
// @route   POST /api/complaints
exports.createComplaint = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            address,
            latitude,
            longitude,
        } = req.body;

        // Build complaint object
        const complaintData = {
            title,
            description,
            category,
            location: {
                address,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
            },
            user: req.user._id,
        };

        // Handle image upload
        if (req.file) {
            complaintData.image = req.file.filename;
        }

        // Create complaint
        const complaint = await Complaint.create(complaintData);

        // Call ML service for severity detection
        if (req.file) {
            try {
                const mlResponse = await axios.post(
                    `${process.env.ML_SERVICE_URL}/predict`,
                    {
                        image_path: req.file.path,
                        category: category,
                    },
                    { timeout: 10000 }
                );

                if (mlResponse.data && mlResponse.data.severity) {
                    complaint.mlSeverity = mlResponse.data.severity;
                    complaint.mlConfidence =
                        mlResponse.data.confidence || 0.5;
                }
            } catch (mlError) {
                console.log(
                    'ML Service unavailable, using category-based severity'
                );
                // Fallback severity based on category
                complaint.mlSeverity = getCategorySeverity(category);
                complaint.mlConfidence = 0.3;
            }
        } else {
            complaint.mlSeverity = getCategorySeverity(category);
            complaint.mlConfidence = 0.3;
        }

        // Calculate priority score
        const scores = await calculatePriorityScore(complaint);
        complaint.priorityScore = scores.priorityScore;
        complaint.severityScore = scores.severityScore;
        complaint.frequencyScore = scores.frequencyScore;
        complaint.credibilityScore = scores.credibilityScore;
        complaint.historicalScore = scores.historicalScore;

        await complaint.save();

        // Update user's total complaints
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { totalComplaints: 1 },
        });

        // Populate user info
        await complaint.populate('user', 'name email credibilityScore');

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            data: complaint,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Helper: Get severity from category (fallback)
function getCategorySeverity(category) {
    const map = {
        sewage: 'high',
        water_leak: 'high',
        pothole: 'medium',
        road_damage: 'medium',
        illegal_construction: 'medium',
        garbage: 'medium',
        streetlight: 'low',
        air_pollution: 'medium',
        noise_pollution: 'low',
        other: 'low',
    };
    return map[category] || 'medium';
}

// @desc    Get all complaints (with filters)
// @route   GET /api/complaints
exports.getComplaints = async (req, res) => {
    try {
        const {
            category,
            status,
            sort,
            page = 1,
            limit = 20,
        } = req.query;

        const query = {};
        if (category) query.category = category;
        if (status) query.status = status;

        let sortOption = { priorityScore: -1 };
        if (sort === 'newest') sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'priority') sortOption = { priorityScore: -1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const complaints = await Complaint.find(query)
            .populate('user', 'name email credibilityScore')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Complaint.countDocuments(query);

        res.status(200).json({
            success: true,
            count: complaints.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: complaints,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
exports.getComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(
            req.params.id
        ).populate('user', 'name email credibilityScore');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found',
            });
        }

        res.status(200).json({
            success: true,
            data: complaint,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get logged-in user's complaints
// @route   GET /api/complaints/my
exports.getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({
            user: req.user._id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update complaint status (authority)
// @route   PUT /api/complaints/:id/status
exports.updateStatus = async (req, res) => {
    try {
        const { status, resolutionNote, assignedTo } = req.body;

        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found',
            });
        }

        complaint.status = status;
        if (resolutionNote) complaint.resolutionNote = resolutionNote;
        if (assignedTo) complaint.assignedTo = assignedTo;
        if (status === 'resolved') complaint.resolvedAt = new Date();

        await complaint.save();

        // Update user credibility
        if (status === 'resolved') {
            const user = await User.findById(complaint.user);
            user.resolvedComplaints += 1;
            user.updateCredibility();
            await user.save();
        } else if (status === 'rejected') {
            const user = await User.findById(complaint.user);
            user.falseComplaints += 1;
            user.updateCredibility();
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: `Complaint status updated to ${status}`,
            data: complaint,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Upvote a complaint
// @route   PUT /api/complaints/:id/upvote
exports.upvoteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found',
            });
        }

        // Check if already upvoted
        if (complaint.upvotedBy.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'Already upvoted this complaint',
            });
        }

        complaint.upvotes += 1;
        complaint.upvotedBy.push(req.user._id);

        // Recalculate priority
        const scores = await calculatePriorityScore(complaint);
        complaint.priorityScore = scores.priorityScore;
        complaint.severityScore = scores.severityScore;

        await complaint.save();

        res.status(200).json({
            success: true,
            message: 'Complaint upvoted',
            data: complaint,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};