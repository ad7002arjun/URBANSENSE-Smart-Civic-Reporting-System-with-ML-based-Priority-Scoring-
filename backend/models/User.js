const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['citizen', 'authority', 'admin'],
            default: 'citizen',
        },
        credibilityScore: {
            type: Number,
            default: 50,
            min: 0,
            max: 100,
        },
        totalComplaints: {
            type: Number,
            default: 0,
        },
        resolvedComplaints: {
            type: Number,
            default: 0,
        },
        falseComplaints: {
            type: Number,
            default: 0,
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Update credibility score
userSchema.methods.updateCredibility = function () {
    if (this.totalComplaints === 0) {
        this.credibilityScore = 50;
    } else {
        const resolvedRatio = this.resolvedComplaints / this.totalComplaints;
        const falseRatio = this.falseComplaints / this.totalComplaints;
        this.credibilityScore = Math.min(
            100,
            Math.max(0, Math.round(50 + resolvedRatio * 40 - falseRatio * 30))
        );
    }
    return this.credibilityScore;
};

module.exports = mongoose.model('User', userSchema);