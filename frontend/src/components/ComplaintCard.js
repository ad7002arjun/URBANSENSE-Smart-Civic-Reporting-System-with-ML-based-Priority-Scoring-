import React from 'react';
import PriorityBadge from './PriorityBadge';
import {
    FiMapPin,
    FiClock,
    FiThumbsUp,
    FiTag,
    FiUser,
} from 'react-icons/fi';
import './ComplaintCard.css';

const ComplaintCard = ({ complaint, onUpvote, onStatusChange, showActions }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getCategoryLabel = (cat) => {
        const labels = {
            pothole: '🕳️ Pothole',
            garbage: '🗑️ Garbage',
            streetlight: '💡 Streetlight',
            water_leak: '💧 Water Leak',
            sewage: '🚿 Sewage',
            road_damage: '🛣️ Road Damage',
            illegal_construction: '🏗️ Illegal Construction',
            noise_pollution: '🔊 Noise Pollution',
            air_pollution: '🌫️ Air Pollution',
            other: '📋 Other',
        };
        return labels[cat] || cat;
    };

    const getStatusStyle = (status) => {
        const styles = {
            pending: { color: '#fdcb6e', bg: 'rgba(253, 203, 110, 0.1)' },
            in_progress: { color: '#74b9ff', bg: 'rgba(116, 185, 255, 0.1)' },
            resolved: { color: '#00b894', bg: 'rgba(0, 184, 148, 0.1)' },
            rejected: { color: '#e74c3c', bg: 'rgba(231, 76, 60, 0.1)' },
        };
        return styles[status] || styles.pending;
    };

    const statusStyle = getStatusStyle(complaint.status);

    return (
        <div className="complaint-card">
            {/* Header */}
            <div className="complaint-card-header">
                <div className="complaint-card-title-row">
                    <h3 className="complaint-card-title">{complaint.title}</h3>
                    <PriorityBadge score={complaint.priorityScore} />
                </div>
                <div className="complaint-card-meta">
                    <span className="meta-item">
                        <FiTag />
                        {getCategoryLabel(complaint.category)}
                    </span>
                    <span
                        className="status-badge"
                        style={{
                            color: statusStyle.color,
                            background: statusStyle.bg,
                            border: `1px solid ${statusStyle.color}`,
                        }}
                    >
                        {complaint.status.replace('_', ' ').toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Image */}
            {complaint.image && (
                <div className="complaint-card-image">
                    <img
                        src={`http://localhost:5000/uploads/${complaint.image}`}
                        alt="Complaint"
                        loading="lazy"
                    />
                </div>
            )}

            {/* Description */}
            <p className="complaint-card-desc">{complaint.description}</p>

            {/* Score Breakdown */}
            <div className="score-breakdown">
                <div className="score-item">
                    <span className="score-label">Severity</span>
                    <div className="score-bar">
                        <div
                            className="score-fill severity"
                            style={{
                                width: `${complaint.severityScore}%`,
                            }}
                        ></div>
                    </div>
                    <span className="score-value">
                        {complaint.severityScore}
                    </span>
                </div>
                <div className="score-item">
                    <span className="score-label">Frequency</span>
                    <div className="score-bar">
                        <div
                            className="score-fill frequency"
                            style={{
                                width: `${complaint.frequencyScore}%`,
                            }}
                        ></div>
                    </div>
                    <span className="score-value">
                        {complaint.frequencyScore}
                    </span>
                </div>
                <div className="score-item">
                    <span className="score-label">Credibility</span>
                    <div className="score-bar">
                        <div
                            className="score-fill credibility"
                            style={{
                                width: `${complaint.credibilityScore}%`,
                            }}
                        ></div>
                    </div>
                    <span className="score-value">
                        {complaint.credibilityScore}
                    </span>
                </div>
                <div className="score-item">
                    <span className="score-label">Historical</span>
                    <div className="score-bar">
                        <div
                            className="score-fill historical"
                            style={{
                                width: `${complaint.historicalScore}%`,
                            }}
                        ></div>
                    </div>
                    <span className="score-value">
                        {complaint.historicalScore}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="complaint-card-footer">
                <div className="footer-left">
                    <span className="meta-item">
                        <FiMapPin />
                        {complaint.location?.address || 'N/A'}
                    </span>
                    <span className="meta-item">
                        <FiClock />
                        {formatDate(complaint.createdAt)}
                    </span>
                    {complaint.user && (
                        <span className="meta-item">
                            <FiUser />
                            {complaint.user.name || 'Anonymous'}
                        </span>
                    )}
                </div>
                <div className="footer-right">
                    {onUpvote && (
                        <button
                            className="btn-upvote"
                            onClick={() => onUpvote(complaint._id)}
                        >
                            <FiThumbsUp />
                            {complaint.upvotes}
                        </button>
                    )}
                    {showActions && onStatusChange && (
                        <div className="status-actions">
                            {complaint.status === 'pending' && (
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() =>
                                        onStatusChange(
                                            complaint._id,
                                            'in_progress'
                                        )
                                    }
                                >
                                    Start Progress
                                </button>
                            )}
                            {complaint.status === 'in_progress' && (
                                <>
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() =>
                                            onStatusChange(
                                                complaint._id,
                                                'resolved'
                                            )
                                        }
                                    >
                                        Resolve
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() =>
                                            onStatusChange(
                                                complaint._id,
                                                'rejected'
                                            )
                                        }
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComplaintCard;