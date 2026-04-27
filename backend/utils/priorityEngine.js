// ============================================
// PRIORITY SCORING ENGINE
// P = αS + βF + γC + δH
// ============================================
// α (alpha) = 0.40 → Severity Weight
// β (beta)  = 0.25 → Frequency Weight
// γ (gamma) = 0.20 → Credibility Weight
// δ (delta) = 0.15 → Historical Weight
// ============================================

const Complaint = require('../models/Complaint');
const User = require('../models/User');
const PriorityLog = require('../models/PriorityLog');

const WEIGHTS = {
    alpha: 0.40,  // Severity
    beta: 0.25,   // Frequency
    gamma: 0.20,  // Credibility
    delta: 0.15,  // Historical
};

// Severity mapping from ML output
const SEVERITY_MAP = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
    pending: 30,
};

// Category base severity (fallback when ML unavailable)
const CATEGORY_SEVERITY = {
    sewage: 85,
    water_leak: 80,
    pothole: 70,
    road_damage: 70,
    illegal_construction: 65,
    garbage: 60,
    streetlight: 55,
    air_pollution: 50,
    noise_pollution: 40,
    other: 30,
};

/**
 * Calculate Severity Score (S)
 * Based on ML classification + category baseline
 */
function calculateSeverity(complaint) {
    let mlScore = SEVERITY_MAP[complaint.mlSeverity] || 30;
    let categoryScore = CATEGORY_SEVERITY[complaint.category] || 30;

    // Weight ML result by its confidence
    const confidence = complaint.mlConfidence || 0;

    // Blend ML score and category score based on confidence
    const severityScore = Math.round(
        mlScore * confidence + categoryScore * (1 - confidence)
    );

    // Boost for upvotes
    const upvoteBoost = Math.min(10, complaint.upvotes * 2);

    return Math.min(100, severityScore + upvoteBoost);
}

/**
 * Calculate Frequency Score (F)
 * Based on nearby complaints in same category within 500m radius
 */
async function calculateFrequency(complaint) {
    const RADIUS_KM = 0.5;
    const LAT_DIFF = RADIUS_KM / 111;
    const LON_DIFF =
        RADIUS_KM /
        (111 * Math.cos((complaint.location.latitude * Math.PI) / 180));

    const nearbyCount = await Complaint.countDocuments({
        _id: { $ne: complaint._id },
        category: complaint.category,
        'location.latitude': {
            $gte: complaint.location.latitude - LAT_DIFF,
            $lte: complaint.location.latitude + LAT_DIFF,
        },
        'location.longitude': {
            $gte: complaint.location.longitude - LON_DIFF,
            $lte: complaint.location.longitude + LON_DIFF,
        },
        createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
    });

    // Normalize: 0 nearby = 10, 10+ nearby = 100
    const frequencyScore = Math.min(100, 10 + nearbyCount * 9);
    return frequencyScore;
}

/**
 * Calculate Credibility Score (C)
 * Based on user's track record
 */
async function calculateCredibility(userId) {
    const user = await User.findById(userId);
    if (!user) return 50;

    return user.credibilityScore || 50;
}

/**
 * Calculate Historical Score (H)
 * Based on past complaint patterns in the area/category
 */
async function calculateHistorical(complaint) {
    const sixMonthsAgo = new Date(
        Date.now() - 180 * 24 * 60 * 60 * 1000
    );

    // Count past complaints in same category
    const pastComplaints = await Complaint.find({
        category: complaint.category,
        createdAt: { $gte: sixMonthsAgo },
        status: { $in: ['resolved', 'rejected'] },
    });

    const totalPast = pastComplaints.length;
    const resolvedPast = pastComplaints.filter(
        (c) => c.status === 'resolved'
    ).length;

    if (totalPast === 0) return 50;

    // Higher score if this category historically has valid complaints
    const validRatio = resolvedPast / totalPast;
    const historicalScore = Math.round(30 + validRatio * 70);

    return Math.min(100, historicalScore);
}

/**
 * MAIN: Calculate Priority Score
 * P = αS + βF + γC + δH
 */
async function calculatePriorityScore(complaint) {
    const S = calculateSeverity(complaint);
    const F = await calculateFrequency(complaint);
    const C = await calculateCredibility(complaint.user);
    const H = await calculateHistorical(complaint);

    const P =
        WEIGHTS.alpha * S +
        WEIGHTS.beta * F +
        WEIGHTS.gamma * C +
        WEIGHTS.delta * H;

    const priorityScore = Math.round(Math.min(100, Math.max(0, P)));

    // Log the calculation
    await PriorityLog.create({
        complaint: complaint._id,
        previousScore: complaint.priorityScore || 0,
        newScore: priorityScore,
        severityComponent: S,
        frequencyComponent: F,
        credibilityComponent: C,
        historicalComponent: H,
        reason: 'Priority calculation',
    });

    return {
        priorityScore,
        severityScore: S,
        frequencyScore: F,
        credibilityScore: C,
        historicalScore: H,
    };
}

/**
 * Recalculate priorities for all pending complaints
 */
async function recalculateAllPriorities() {
    const complaints = await Complaint.find({
        status: { $in: ['pending', 'in_progress'] },
    });

    for (const complaint of complaints) {
        const scores = await calculatePriorityScore(complaint);
        complaint.priorityScore = scores.priorityScore;
        complaint.severityScore = scores.severityScore;
        complaint.frequencyScore = scores.frequencyScore;
        complaint.credibilityScore = scores.credibilityScore;
        complaint.historicalScore = scores.historicalScore;
        await complaint.save();
    }

    return complaints.length;
}

module.exports = {
    calculatePriorityScore,
    recalculateAllPriorities,
    WEIGHTS,
    SEVERITY_MAP,
    CATEGORY_SEVERITY,
};