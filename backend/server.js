const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'URBANSENSE API is running',
        timestamp: new Date().toISOString(),
    });
});

// Error handler
app.use(errorHandler);

// Create uploads directory if not exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║   🏙️  URBANSENSE API Server Running     ║
    ║   📡  Port: ${PORT}                        ║
    ║   🌍  Mode: ${process.env.NODE_ENV}              ║
    ╚══════════════════════════════════════════╝
    `);
});