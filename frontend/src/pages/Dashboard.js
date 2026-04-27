import React, { useState, useEffect } from 'react';
import { dashboardAPI, complaintsAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import ComplaintCard from '../components/ComplaintCard';
import {
    FiBarChart2,
    FiAlertCircle,
    FiCheckCircle,
    FiClock,
    FiUsers,
    FiRefreshCw,
    FiTrendingUp,
    FiXCircle,
} from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
    const { isAuthority } = useAuth();
    const [stats, setStats] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        fetchComplaints();
    }, [statusFilter, categoryFilter]);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, comparisonRes] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getComparison(),
            ]);

            if (statsRes.data.success) setStats(statsRes.data.data);
            if (comparisonRes.data.success) setComparison(comparisonRes.data.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        }
        setLoading(false);
    };

    const fetchComplaints = async () => {
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (categoryFilter) params.category = categoryFilter;

            const response = await dashboardAPI.getComplaints(params);
            if (response.data.success) {
                setComplaints(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch complaints');
        }
    };

    const handleRecalculate = async () => {
        try {
            const response = await dashboardAPI.recalculate();
            toast.success(response.data.message);
            fetchDashboardData();
            fetchComplaints();
        } catch (error) {
            toast.error('Failed to recalculate');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await complaintsAPI.updateStatus(id, {
                status,
                resolutionNote:
                    status === 'resolved'
                        ? 'Issue has been resolved by authority'
                        : status === 'rejected'
                        ? 'Complaint was found to be invalid'
                        : '',
            });
            toast.success(`Status updated to ${status}`);
            fetchComplaints();
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleUpvote = async (id) => {
        try {
            await complaintsAPI.upvote(id);
            toast.success('Upvoted!');
            fetchComplaints();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">
                        <FiBarChart2 /> Authority Dashboard
                    </h1>
                    <p className="page-subtitle">
                        Complaints sorted by priority score — Critical issues first
                    </p>
                </div>
                {isAuthority && (
                    <button
                        className="btn btn-secondary"
                        onClick={handleRecalculate}
                    >
                        <FiRefreshCw /> Recalculate Priorities
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="dashboard-tabs">
                <button
                    className={`dash-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button
                    className={`dash-tab ${activeTab === 'complaints' ? 'active' : ''}`}
                    onClick={() => setActiveTab('complaints')}
                >
                    📋 Priority Queue
                </button>
                <button
                    className={`dash-tab ${activeTab === 'comparison' ? 'active' : ''}`}
                    onClick={() => setActiveTab('comparison')}
                >
                    📈 FCFS vs Priority
                </button>
            </div>

            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === 'overview' && stats && (
                <div className="overview-section">
                    {/* Stat Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon total">
                                <FiBarChart2 />
                            </div>
                            <div className="stat-info">
                                <h3>{stats.totalComplaints}</h3>
                                <p>Total Complaints</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon pending">
                                <FiClock />
                            </div>
                            <div className="stat-info">
                                <h3>{stats.pendingComplaints}</h3>
                                <p>Pending</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon progress">
                                <FiAlertCircle />
                            </div>
                            <div className="stat-info">
                                <h3>{stats.inProgressComplaints}</h3>
                                <p>In Progress</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon resolved">
                                <FiCheckCircle />
                            </div>
                            <div className="stat-info">
                                <h3>{stats.resolvedComplaints}</h3>
                                <p>Resolved</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon rejected">
                                <FiXCircle />
                            </div>
                            <div className="stat-info">
                                <h3>{stats.rejectedComplaints}</h3>
                                <p>Rejected</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon users">
                                <FiUsers />
                            </div>
                            <div className="stat-info">
                                <h3>{stats.totalUsers}</h3>
                                <p>Citizens</p>
                            </div>
                        </div>
                    </div>

                    {/* Priority Distribution */}
                    <div className="card distribution-card">
                        <h3>Priority Distribution</h3>
                        <div className="distribution-bars">
                            <div className="dist-item">
                                <span className="dist-label critical-text">
                                    Critical (75-100)
                                </span>
                                <div className="dist-bar">
                                    <div
                                        className="dist-fill critical-bg"
                                        style={{
                                            width: `${
                                                stats.totalComplaints > 0
                                                    ? (stats.priorityDistribution.critical /
                                                          stats.totalComplaints) *
                                                      100
                                                    : 0
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                                <span className="dist-count">
                                    {stats.priorityDistribution.critical}
                                </span>
                            </div>
                            <div className="dist-item">
                                <span className="dist-label high-text">
                                    High (50-74)
                                </span>
                                <div className="dist-bar">
                                    <div
                                        className="dist-fill high-bg"
                                        style={{
                                            width: `${
                                                stats.totalComplaints > 0
                                                    ? (stats.priorityDistribution.high /
                                                          stats.totalComplaints) *
                                                      100
                                                    : 0
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                                <span className="dist-count">
                                    {stats.priorityDistribution.high}
                                </span>
                            </div>
                            <div className="dist-item">
                                <span className="dist-label medium-text">
                                    Medium (25-49)
                                </span>
                                <div className="dist-bar">
                                    <div
                                        className="dist-fill medium-bg"
                                        style={{
                                            width: `${
                                                stats.totalComplaints > 0
                                                    ? (stats.priorityDistribution.medium /
                                                          stats.totalComplaints) *
                                                      100
                                                    : 0
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                                <span className="dist-count">
                                    {stats.priorityDistribution.medium}
                                </span>
                            </div>
                            <div className="dist-item">
                                <span className="dist-label low-text">
                                    Low (0-24)
                                </span>
                                <div className="dist-bar">
                                    <div
                                        className="dist-fill low-bg"
                                        style={{
                                            width: `${
                                                stats.totalComplaints > 0
                                                    ? (stats.priorityDistribution.low /
                                                          stats.totalComplaints) *
                                                      100
                                                    : 0
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                                <span className="dist-count">
                                    {stats.priorityDistribution.low}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="card category-card">
                        <h3>Category Breakdown</h3>
                        <div className="category-list">
                            {stats.categoryBreakdown.map((cat, index) => (
                                <div className="category-item" key={index}>
                                    <span className="cat-name">
                                        {cat._id.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <span className="cat-count">{cat.count}</span>
                                    <span className="cat-avg">
                                        Avg Priority: {Math.round(cat.avgPriority)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== COMPLAINTS TAB ===== */}
            {activeTab === 'complaints' && (
                <div className="complaints-section">
                    {/* Filters */}
                    <div className="complaint-filters">
                        <select
                            className="form-control filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <select
                            className="form-control filter-select"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            <option value="pothole">Pothole</option>
                            <option value="garbage">Garbage</option>
                            <option value="streetlight">Streetlight</option>
                            <option value="water_leak">Water Leak</option>
                            <option value="sewage">Sewage</option>
                            <option value="road_damage">Road Damage</option>
                            <option value="illegal_construction">
                                Illegal Construction
                            </option>
                            <option value="noise_pollution">Noise Pollution</option>
                            <option value="air_pollution">Air Pollution</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="priority-queue-header">
                        <h3>
                            <FiTrendingUp /> Priority Queue ({complaints.length}{' '}
                            complaints)
                        </h3>
                        <p>Sorted by priority score — highest first</p>
                    </div>

                    {complaints.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📭</span>
                            <h3>No complaints found</h3>
                            <p>Try changing the filters</p>
                        </div>
                    ) : (
                        <div className="complaints-list">
                            {complaints.map((complaint, index) => (
                                <div key={complaint._id} className="queue-item">
                                    <div className="queue-rank">#{index + 1}</div>
                                    <div className="queue-complaint">
                                        <ComplaintCard
                                            complaint={complaint}
                                            onUpvote={handleUpvote}
                                            onStatusChange={
                                                isAuthority
                                                    ? handleStatusChange
                                                    : null
                                            }
                                            showActions={isAuthority}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ===== COMPARISON TAB ===== */}
            {activeTab === 'comparison' && comparison && (
                <div className="comparison-section">
                    <div className="comparison-header">
                        <h2>📈 FCFS vs Priority-Based Approach</h2>
                        <p>
                            Comparing traditional First-Come-First-Served with our
                            weighted priority scoring system
                        </p>
                    </div>

                    {/* Analysis Summary */}
                    <div className="analysis-cards">
                        <div className="analysis-card fcfs-card">
                            <h3>🔴 FCFS Approach</h3>
                            <div className="analysis-stat">
                                <span className="big-number">
                                    {comparison.analysis.fcfsTop10AvgSeverity}
                                </span>
                                <span className="stat-label">
                                    Avg Severity (Top 10)
                                </span>
                            </div>
                            <p className="analysis-desc">
                                Processes complaints in order of submission time.
                                Critical issues may wait behind minor ones.
                            </p>
                        </div>

                        <div className="analysis-card vs-card">
                            <div className="vs-circle">VS</div>
                            <div className="improvement">
                                <span className="improvement-value">
                                    +{comparison.analysis.improvementPercent}%
                                </span>
                                <span>Improvement</span>
                            </div>
                        </div>

                        <div className="analysis-card priority-card">
                            <h3>🟢 Priority Approach</h3>
                            <div className="analysis-stat">
                                <span className="big-number">
                                    {comparison.analysis.priorityTop10AvgSeverity}
                                </span>
                                <span className="stat-label">
                                    Avg Severity (Top 10)
                                </span>
                            </div>
                            <p className="analysis-desc">
                                Processes complaints by P = αS + βF + γC + δH.
                                Critical issues always handled first.
                            </p>
                        </div>
                    </div>

                    {/* Side by Side Comparison Tables */}
                    <div className="comparison-tables">
                        {/* FCFS Table */}
                        <div className="comp-table">
                            <h3 className="table-title fcfs-title">
                                🔴 FCFS Order (By Time)
                            </h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Severity</th>
                                            <th>Priority</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparison.fcfsOrder.map(
                                            (item, index) => (
                                                <tr key={item._id}>
                                                    <td>{index + 1}</td>
                                                    <td className="table-title-cell">
                                                        {item.title}
                                                    </td>
                                                    <td>
                                                        {item.category
                                                            .replace('_', ' ')
                                                            .toUpperCase()}
                                                    </td>
                                                    <td>
                                                        {item.severityScore}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`table-priority ${
                                                                item.priorityScore >=
                                                                75
                                                                    ? 'critical'
                                                                    : item.priorityScore >=
                                                                      50
                                                                    ? 'high'
                                                                    : item.priorityScore >=
                                                                      25
                                                                    ? 'medium'
                                                                    : 'low'
                                                            }`}
                                                        >
                                                            {item.priorityScore}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Priority Table */}
                        <div className="comp-table">
                            <h3 className="table-title priority-title">
                                🟢 Priority Order (By Score)
                            </h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Severity</th>
                                            <th>Priority</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparison.priorityOrder.map(
                                            (item, index) => (
                                                <tr key={item._id}>
                                                    <td>{index + 1}</td>
                                                    <td className="table-title-cell">
                                                        {item.title}
                                                    </td>
                                                    <td>
                                                        {item.category
                                                            .replace('_', ' ')
                                                            .toUpperCase()}
                                                    </td>
                                                    <td>
                                                        {item.severityScore}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`table-priority ${
                                                                item.priorityScore >=
                                                                75
                                                                    ? 'critical'
                                                                    : item.priorityScore >=
                                                                      50
                                                                    ? 'high'
                                                                    : item.priorityScore >=
                                                                      25
                                                                    ? 'medium'
                                                                    : 'low'
                                                            }`}
                                                        >
                                                            {item.priorityScore}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Formula Explanation */}
                    <div className="card formula-card">
                        <h3>🧮 Priority Scoring Formula</h3>
                        <div className="formula-display">
                            P = αS + βF + γC + δH
                        </div>
                        <div className="formula-params">
                            <div className="param">
                                <span className="param-symbol">α = 0.40</span>
                                <span className="param-name">
                                    Severity (ML-based)
                                </span>
                            </div>
                            <div className="param">
                                <span className="param-symbol">β = 0.25</span>
                                <span className="param-name">
                                    Frequency (Nearby)
                                </span>
                            </div>
                            <div className="param">
                                <span className="param-symbol">γ = 0.20</span>
                                <span className="param-name">
                                    Credibility (User Trust)
                                </span>
                            </div>
                            <div className="param">
                                <span className="param-symbol">δ = 0.15</span>
                                <span className="param-name">
                                    Historical (Past Data)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;