# 🏙️ URBANSENSE — Smart Civic Reporting System

> Confidence-Aware Priority Scoring for Urban Complaint Management

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![TensorFlow](https://img.shields.io/badge/ML-TensorFlow-orange)
![SDG 11](https://img.shields.io/badge/SDG-11-blue)

## 📋 About

URBANSENSE is a smart civic reporting system that dynamically ranks urban complaints using a **confidence-aware priority scoring mechanism** instead of traditional First-Come-First-Served (FCFS) approach.

### 🧮 Priority Scoring Model
P = αS + βF + γC + δH

| Parameter | Weight | Description |
|-----------|--------|-------------|
| **S** (Severity) | α = 0.40 | ML-based image classification using CNN |
| **F** (Frequency) | β = 0.25 | Nearby complaints in same category |
| **C** (Credibility) | γ = 0.20 | User trust score based on history |
| **H** (Historical) | δ = 0.15 | Past complaint patterns |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Leaflet Maps |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| ML Service | Python, Flask, TensorFlow |
| ML Model | MobileNetV2 (Transfer Learning) |
| Auth | JWT (JSON Web Tokens) |
| File Upload | Multer |
| Methodology | Agile (Scrum) |

## 🏗️ System Architecture
User → React Frontend (3000)
↓
Node.js Backend (5000) → MongoDB
↓
Flask ML Service (8000) → MobileNetV2 CNN
↓
Priority Engine: P = αS + βF + γC + δH
↓
Authority Dashboard (sorted by priority)

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Python (v3.9+)

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/URBANSENSE.git
cd URBANSENSE
cd backend
npm install
# Create .env file with:
# PORT=5000
# MONGODB_URI=mongodb://127.0.0.1:27017/urbansense
# JWT_SECRET=urbansense_secret_key_2024
# ML_SERVICE_URL=http://127.0.0.1:8000
node seed.js
npx nodemon server.js
cd frontend
npm install
npm start
cd ml-service
python -m venv venv
venv\Scripts\activate  # Windows
pip install flask flask-cors tensorflow Pillow numpy
python train_model.py
python app.py
📊 FCFS vs Priority Comparison
Metric	FCFS	Priority (Ours)	Improvement
Top 5 Avg Severity	36	78	+117%
Critical Issues First	❌	✅	—
ML-based Detection	❌	✅	—
User Credibility	❌	✅	—
👥 Login Credentials (Demo)
Role	Email	Password
Citizen	citizen@test.com	123456
Authority	authority@test.com	123456
Admin	admin@test.com	123456
URBANSENSE/
├── backend/          # Node.js + Express API
├── frontend/         # React.js Application
├── ml-service/       # Python Flask + TensorFlow
└── README.md
Aligned with UN SDG 11
Sustainable Cities and Communities — Making cities inclusive, safe, resilient and sustainable.

📄 License
This project is for academic purposes.