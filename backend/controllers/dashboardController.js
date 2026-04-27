const Complaint = require('../models/Complaint');
const User = require('../models/User');
const PriorityLog = require('../models/PriorityLog');
const {
    recalculateAllPriorities,
} = require('../utils/priorityEngine');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
exports.getStats = async (req, res) => {
    try {
        const totalComplaints = await Complaint.countDocuments();
        const pendingComplaints = await Complaint.countDocuments({
            status: 'pending',
        });
        const inProgressComplaints = await Complaint.countDocuments({
            status: 'in_progress',
        });
        const resolvedComplaints = await Complaint.countDocuments({
            status: 'resolved',
        });
        const rejectedComplaints = await Complaint.countDocuments({
            status: 'rejected',
        });
        const totalUsers = await User.countDocuments({
            role: 'citizen',
        });

        // Average resolution time (for resolved complaints)
        const resolvedOnes = await Complaint.find({
            status: 'resolved',
            resolvedAt: { $ne: null },
        });

        let avgResolutionHours = 0;
        if (resolvedOnes.length > 0) {
            const totalHours = resolvedOnes.reduce((sum, c) => {
                const hours =
                    (c.resolvedAt - c.createdAt) / (1000 * 60 * 60);
                return sum + hours;
            }, 0);
            avgResolutionHours = Math.round(
                totalHours / resolvedOnes.length
            );
        }

        // Category breakdown
        const categoryBreakdown = await Complaint.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgPriority: { $avg: '$priorityScore' },
                },
            },
            { $sort: { count: -1 } },
        ]);

        // Priority distribution
        const priorityDistribution = {
            critical: await Complaint.countDocuments({
                priorityScore: { $gte: 75 },
            }),
            high: await Complaint.countDocuments({
                priorityScore: { $gte: 50, $lt: 75 },
            }),
            medium: await Complaint.countDocuments({
                priorityScore: { $gte: 25, $lt: 50 },
            }),
            low: await Complaint.countDocuments({
                priorityScore: { $lt: 25 },
            }),
        };

        res.status(200).json({
            success: true,
            data: {
                totalComplaints,
                pendingComplaints,
                inProgressComplaints,
                resolvedComplaints,
                rejectedComplaints,
                totalUsers,
                avgResolutionHours,
                categoryBreakdown,
                priorityDistribution,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get priority-sorted complaints for dashboard
// @route   GET /api/dashboard/complaints
exports.getPriorityComplaints = async (req, res) => {
    try {
        const { status, category, page = 1, limit = 50 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const complaints = await Complaint.find(query)
            .populate('user', 'name email credibilityScore')
            .sort({ priorityScore: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Complaint.countDocuments(query);

        res.status(200).json({
            success: true,
            count: complaints.length,
            total,
            data: complaints,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Recalculate all priorities
// @route   POST /api/dashboard/recalculate
exports.recalculatePriorities = async (req, res) => {
    try {
        const count = await recalculateAllPriorities();

        res.status(200).json({
            success: true,
            message: `Recalculated priorities for ${count} complaints`,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    FCFS vs Priority comparison
// @route   GET /api/dashboard/comparison
exports.getComparison = async (req, res) => {
    try {
        // FCFS Order: sorted by creation time
        const fcfsOrder = await Complaint.find({
            status: { $in: ['pending', 'in_progress'] },
        })
            .sort({ createdAt: 1 })
            .select(
                'title category priorityScore severityScore createdAt'
            )
            .limit(20);

        // Priority Order: sorted by priority score
        const priorityOrder = await Complaint.find({
            status: { $in: ['pending', 'in_progress'] },
        })
            .sort({ priorityScore: -1 })
            .select(
                'title category priorityScore severityScore createdAt'
            )
            .limit(20);

        // Calculate efficiency metrics
        const fcfsSeveritySum = fcfsOrder
            .slice(0, 10)
            .reduce((sum, c) => sum + c.severityScore, 0);
        const prioritySeveritySum = priorityOrder
            .slice(0, 10)
            .reduce((sum, c) => sum + c.severityScore, 0);

        res.status(200).json({
            success: true,
            data: {
                fcfsOrder,
                priorityOrder,
                analysis: {
                    fcfsTop10AvgSeverity: Math.round(
                        fcfsSeveritySum /
                            Math.max(1, fcfsOrder.slice(0, 10).length)
                    ),
                    priorityTop10AvgSeverity: Math.round(
                        prioritySeveritySum /
                            Math.max(
                                1,
                                priorityOrder.slice(0, 10).length
                            )
                    ),
                    improvementPercent: Math.round(
                        ((prioritySeveritySum - fcfsSeveritySum) /
                            Math.max(1, fcfsSeveritySum)) *
                            100
                    ),
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};