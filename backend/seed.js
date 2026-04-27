const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Complaint = require('./models/Complaint');
const PriorityLog = require('./models/PriorityLog');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');
};

const seedData = async () => {
    try {
        await connectDB();

        // Clear ALL existing data
        await User.deleteMany({});
        await Complaint.deleteMany({});
        await PriorityLog.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create Users
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const users = await User.create([
            {
                name: 'Rahul Sharma',
                email: 'citizen@test.com',
                password: hashedPassword,
                role: 'citizen',
                credibilityScore: 75,
                totalComplaints: 8,
                resolvedComplaints: 6,
                falseComplaints: 0,
                phone: '9876543210',
                address: 'Andheri, Mumbai',
            },
            {
                name: 'Priya Patel',
                email: 'citizen2@test.com',
                password: hashedPassword,
                role: 'citizen',
                credibilityScore: 90,
                totalComplaints: 12,
                resolvedComplaints: 11,
                falseComplaints: 0,
                phone: '9876543211',
                address: 'Bandra, Mumbai',
            },
            {
                name: 'Amit Kumar',
                email: 'citizen3@test.com',
                password: hashedPassword,
                role: 'citizen',
                credibilityScore: 35,
                totalComplaints: 15,
                resolvedComplaints: 4,
                falseComplaints: 6,
                phone: '9876543212',
                address: 'Goregaon, Mumbai',
            },
            {
                name: 'Neha Gupta',
                email: 'citizen4@test.com',
                password: hashedPassword,
                role: 'citizen',
                credibilityScore: 60,
                totalComplaints: 5,
                resolvedComplaints: 3,
                falseComplaints: 1,
                phone: '9876543214',
                address: 'Dadar, Mumbai',
            },
            {
                name: 'Authority Admin',
                email: 'authority@test.com',
                password: hashedPassword,
                role: 'authority',
                credibilityScore: 95,
                phone: '9876543213',
                address: 'BMC Office, Mumbai',
            },
            {
                name: 'Super Admin',
                email: 'admin@test.com',
                password: hashedPassword,
                role: 'admin',
                credibilityScore: 100,
            },
        ]);

        console.log(`✅ Created ${users.length} users`);

        // ============================================
        // KEY: Complaints with DIFFERENT timestamps
        // FCFS = ordered by time (1st submitted → 1st served)
        // Priority = ordered by score (highest score → 1st served)
        //
        // We intentionally make LOW severity complaints EARLIER
        // and HIGH severity complaints LATER
        // So FCFS would process low-priority first (BAD!)
        // But Priority system processes high-priority first (GOOD!)
        // ============================================

        const now = new Date();

        const complaints = [
            // === SUBMITTED FIRST (oldest) — BUT LOW PRIORITY ===
            {
                title: 'Minor streetlight flickering on lane 4',
                description: 'One streetlight flickers occasionally on a small residential lane. Not a major issue but somewhat annoying at night.',
                category: 'streetlight',
                location: {
                    address: 'Lane 4, Khar West, Mumbai',
                    latitude: 19.0715,
                    longitude: 72.8310,
                },
                user: users[2]._id, // Low credibility user
                mlSeverity: 'low',
                mlConfidence: 0.72,
                severityScore: 22,
                frequencyScore: 10,
                credibilityScore: 35,
                historicalScore: 40,
                priorityScore: 24,
                status: 'pending',
                upvotes: 0,
                createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            },
            {
                title: 'Small noise from nearby shop at night',
                description: 'A shop plays music slightly loud after 10 PM. Not extremely disturbing but wanted to report.',
                category: 'noise_pollution',
                location: {
                    address: 'Market Road, Goregaon, Mumbai',
                    latitude: 19.1663,
                    longitude: 72.8490,
                },
                user: users[2]._id, // Low credibility user
                mlSeverity: 'low',
                mlConfidence: 0.65,
                severityScore: 18,
                frequencyScore: 12,
                credibilityScore: 35,
                historicalScore: 35,
                priorityScore: 22,
                status: 'pending',
                upvotes: 0,
                createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
            },
            {
                title: 'Small garbage pile near park entrance',
                description: 'Some garbage has accumulated near the park gate. Not blocking the path but looks untidy.',
                category: 'garbage',
                location: {
                    address: 'Joggers Park, Bandra, Mumbai',
                    latitude: 19.0540,
                    longitude: 72.8200,
                },
                user: users[3]._id, // Medium credibility
                mlSeverity: 'low',
                mlConfidence: 0.68,
                severityScore: 30,
                frequencyScore: 15,
                credibilityScore: 60,
                historicalScore: 45,
                priorityScore: 34,
                status: 'pending',
                upvotes: 1,
                createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
            },

            // === SUBMITTED IN MIDDLE — MEDIUM PRIORITY ===
            {
                title: 'Pothole forming on service road',
                description: 'A medium-sized pothole is developing on the service road. Could become dangerous if not fixed soon.',
                category: 'pothole',
                location: {
                    address: 'Service Road, Andheri East, Mumbai',
                    latitude: 19.1190,
                    longitude: 72.8700,
                },
                user: users[0]._id, // Good credibility
                mlSeverity: 'medium',
                mlConfidence: 0.75,
                severityScore: 52,
                frequencyScore: 35,
                credibilityScore: 75,
                historicalScore: 55,
                priorityScore: 54,
                status: 'pending',
                upvotes: 3,
                createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            },
            {
                title: 'Air quality deteriorating near factory zone',
                description: 'Visible smog and bad air quality near the industrial area. Residents complaining of breathing issues.',
                category: 'air_pollution',
                location: {
                    address: 'MIDC, Chembur, Mumbai',
                    latitude: 19.0522,
                    longitude: 72.8994,
                },
                user: users[1]._id, // High credibility
                mlSeverity: 'medium',
                mlConfidence: 0.78,
                severityScore: 58,
                frequencyScore: 40,
                credibilityScore: 90,
                historicalScore: 60,
                priorityScore: 62,
                status: 'pending',
                upvotes: 5,
                createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
            },
            {
                title: 'Road surface cracking on main road',
                description: 'The road surface is cracking in multiple places. Not yet potholes but will become dangerous soon.',
                category: 'road_damage',
                location: {
                    address: 'LBS Marg, Kurla, Mumbai',
                    latitude: 19.0726,
                    longitude: 72.8794,
                },
                user: users[3]._id,
                mlSeverity: 'medium',
                mlConfidence: 0.71,
                severityScore: 48,
                frequencyScore: 30,
                credibilityScore: 60,
                historicalScore: 50,
                priorityScore: 47,
                status: 'pending',
                upvotes: 2,
                createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            },

            // === SUBMITTED RECENTLY — BUT HIGH PRIORITY ===
            {
                title: 'Dangerous deep pothole on highway causing accidents',
                description: 'Extremely dangerous pothole on Western Express Highway. Already 3 bike accidents this week. Immediate repair needed before someone dies.',
                category: 'pothole',
                location: {
                    address: 'Western Express Highway, Andheri, Mumbai',
                    latitude: 19.1136,
                    longitude: 72.8697,
                },
                user: users[1]._id, // HIGH credibility user
                mlSeverity: 'critical',
                mlConfidence: 0.93,
                severityScore: 95,
                frequencyScore: 75,
                credibilityScore: 90,
                historicalScore: 80,
                priorityScore: 88,
                status: 'pending',
                upvotes: 22,
                createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (RECENT)
            },
            {
                title: 'Major sewage overflow flooding entire street',
                description: 'Sewage pipe burst and raw sewage is flooding MG Road for 2 days. Extreme health hazard. Children falling sick. Shops forced to close. EMERGENCY.',
                category: 'sewage',
                location: {
                    address: 'MG Road, Fort, Mumbai',
                    latitude: 18.9322,
                    longitude: 72.8347,
                },
                user: users[0]._id, // Good credibility
                mlSeverity: 'critical',
                mlConfidence: 0.96,
                severityScore: 98,
                frequencyScore: 85,
                credibilityScore: 75,
                historicalScore: 90,
                priorityScore: 90,
                status: 'pending',
                upvotes: 35,
                createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (MORE RECENT)
            },
            {
                title: 'Water pipeline burst — entire colony without water',
                description: 'Major water main burst in Bandra. 500+ families without water for 24 hours. Water wasting continuously. Senior citizens and children suffering.',
                category: 'water_leak',
                location: {
                    address: 'Bandra West, Mumbai',
                    latitude: 19.0596,
                    longitude: 72.8295,
                },
                user: users[1]._id, // HIGH credibility
                mlSeverity: 'high',
                mlConfidence: 0.89,
                severityScore: 88,
                frequencyScore: 60,
                credibilityScore: 90,
                historicalScore: 75,
                priorityScore: 81,
                status: 'pending',
                upvotes: 18,
                createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (MOST RECENT)
            },

            // === MOST RECENT — BUT LOW PRIORITY ===
            {
                title: 'Garbage bin overflowing slightly',
                description: 'The community garbage bin is slightly overflowing. Collection was missed once.',
                category: 'garbage',
                location: {
                    address: 'Versova, Andheri West, Mumbai',
                    latitude: 19.1340,
                    longitude: 72.8170,
                },
                user: users[2]._id, // LOW credibility
                mlSeverity: 'low',
                mlConfidence: 0.60,
                severityScore: 25,
                frequencyScore: 18,
                credibilityScore: 35,
                historicalScore: 40,
                priorityScore: 27,
                status: 'pending',
                upvotes: 0,
                createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago (NEWEST!)
            },

            // === SOME RESOLVED/IN-PROGRESS FOR VARIETY ===
            {
                title: 'Illegal construction near school — RESOLVED',
                description: 'Unauthorized construction was demolised after complaint.',
                category: 'illegal_construction',
                location: {
                    address: 'Malad West, Mumbai',
                    latitude: 19.1860,
                    longitude: 72.8485,
                },
                user: users[1]._id,
                mlSeverity: 'medium',
                mlConfidence: 0.70,
                severityScore: 60,
                frequencyScore: 25,
                credibilityScore: 90,
                historicalScore: 55,
                priorityScore: 58,
                status: 'resolved',
                resolvedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
                resolutionNote: 'Construction demolished by BMC team',
                upvotes: 8,
                createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            },
            {
                title: 'Garbage dump near school — IN PROGRESS',
                description: 'Large garbage dump near primary school. BMC team dispatched.',
                category: 'garbage',
                location: {
                    address: 'Dadar East, Mumbai',
                    latitude: 19.0178,
                    longitude: 72.8478,
                },
                user: users[0]._id,
                mlSeverity: 'high',
                mlConfidence: 0.82,
                severityScore: 72,
                frequencyScore: 55,
                credibilityScore: 75,
                historicalScore: 65,
                priorityScore: 68,
                status: 'in_progress',
                assignedTo: 'BMC Ward D Sanitation Team',
                upvotes: 14,
                createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
            },
        ];

        const createdComplaints = await Complaint.create(complaints);
        console.log(`✅ Created ${createdComplaints.length} complaints`);

        // Print comparison to show the difference
        console.log('\n' + '='.repeat(65));
        console.log('📊 FCFS vs PRIORITY COMPARISON (Pending Complaints)');
        console.log('='.repeat(65));

        const pending = createdComplaints
            .filter(c => c.status === 'pending')
            .sort((a, b) => a.createdAt - b.createdAt);

        console.log('\n🔴 FCFS ORDER (First Come First Served):');
        console.log('-'.repeat(65));
        pending.forEach((c, i) => {
            const days = Math.round((now - c.createdAt) / (24 * 60 * 60 * 1000));
            console.log(
                `   ${i + 1}. [P:${String(c.priorityScore).padStart(2)}] [S:${String(c.severityScore).padStart(2)}] ${c.title.substring(0, 45).padEnd(45)} (${days}d ago)`
            );
        });

        const byPriority = [...pending].sort((a, b) => b.priorityScore - a.priorityScore);

        console.log('\n🟢 PRIORITY ORDER (By Score - Our System):');
        console.log('-'.repeat(65));
        byPriority.forEach((c, i) => {
            const days = Math.round((now - c.createdAt) / (24 * 60 * 60 * 1000));
            console.log(
                `   ${i + 1}. [P:${String(c.priorityScore).padStart(2)}] [S:${String(c.severityScore).padStart(2)}] ${c.title.substring(0, 45).padEnd(45)} (${days}d ago)`
            );
        });

        // Calculate improvement
        const fcfsTop5Severity = pending.slice(0, 5).reduce((s, c) => s + c.severityScore, 0);
        const prioTop5Severity = byPriority.slice(0, 5).reduce((s, c) => s + c.severityScore, 0);
        const improvement = Math.round(((prioTop5Severity - fcfsTop5Severity) / fcfsTop5Severity) * 100);

        console.log('\n📈 RESULT:');
        console.log(`   FCFS Top 5 Avg Severity:     ${Math.round(fcfsTop5Severity / 5)}`);
        console.log(`   Priority Top 5 Avg Severity: ${Math.round(prioTop5Severity / 5)}`);
        console.log(`   🚀 Improvement:              +${improvement}%`);
        console.log('='.repeat(65));

        console.log('\n🎉 Seed data created successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Citizen:    citizen@test.com / 123456');
        console.log('   Citizen2:   citizen2@test.com / 123456');
        console.log('   Citizen3:   citizen3@test.com / 123456');
        console.log('   Citizen4:   citizen4@test.com / 123456');
        console.log('   Authority:  authority@test.com / 123456');
        console.log('   Admin:      admin@test.com / 123456');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};

seedData();