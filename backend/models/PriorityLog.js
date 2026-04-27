const mongoose = require('mongoose');

const priorityLogSchema = new mongoose.Schema(
    {
        complaint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Complaint',
            required: true,
        },
        previousScore: {
            type: Number,
            default: 0,
        },
        newScore: {
            type: Number,
            required: true,
        },
        severityComponent: Number,
        frequencyComponent: Number,
        credibilityComponent: Number,
        historicalComponent: Number,
        reason: {
            type: String,
            default: 'Initial calculation',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('PriorityLog', priorityLogSchema);