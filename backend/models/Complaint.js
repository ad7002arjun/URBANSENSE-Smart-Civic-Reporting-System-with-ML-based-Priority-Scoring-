const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Complaint title is required'],
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: 2000,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: [
                'pothole',
                'garbage',
                'streetlight',
                'water_leak',
                'sewage',
                'road_damage',
                'illegal_construction',
                'noise_pollution',
                'air_pollution',
                'other',
            ],
        },
        image: {
            type: String,
            default: null,
        },
        location: {
            address: {
                type: String,
                required: [true, 'Location address is required'],
            },
            latitude: {
                type: Number,
                required: true,
                min: -90,
                max: 90,
            },
            longitude: {
                type: Number,
                required: true,
                min: -180,
                max: 180,
            },
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Priority Scoring Fields
        severityScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        frequencyScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        credibilityScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        historicalScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        priorityScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        mlSeverity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical', 'pending'],
            default: 'pending',
        },
        mlConfidence: {
            type: Number,
            default: 0,
            min: 0,
            max: 1,
        },

        status: {
            type: String,
            enum: ['pending', 'in_progress', 'resolved', 'rejected'],
            default: 'pending',
        },
        assignedTo: {
            type: String,
            default: null,
        },
        resolutionNote: {
            type: String,
            default: null,
        },
        resolvedAt: {
            type: Date,
            default: null,
        },
        upvotes: {
            type: Number,
            default: 0,
        },
        upvotedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index for geospatial queries (finding nearby complaints)
complaintSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
complaintSchema.index({ priorityScore: -1 });
complaintSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);