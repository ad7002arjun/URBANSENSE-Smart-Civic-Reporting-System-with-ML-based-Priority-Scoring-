import React, { useState, useEffect } from 'react';
import { complaintsAPI } from '../utils/api';
import { toast } from 'react-toastify';
import ComplaintCard from '../components/ComplaintCard';
import { FiList, FiFilter } from 'react-icons/fi';
import './MyComplaints.css';

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await complaintsAPI.getMy();
            if (response.data.success) {
                setComplaints(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch complaints');
        }
        setLoading(false);
    };

    const handleUpvote = async (id) => {
        try {
            await complaintsAPI.upvote(id);
            toast.success('Upvoted!');
            fetchComplaints();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to upvote'
            );
        }
    };

    const filteredComplaints =
        filter === 'all'
            ? complaints
            : complaints.filter((c) => c.status === filter);

    const statusCounts = {
        all: complaints.length,
        pending: complaints.filter((c) => c.status === 'pending').length,
        in_progress: complaints.filter((c) => c.status === 'in_progress').length,
        resolved: complaints.filter((c) => c.status === 'resolved').length,
        rejected: complaints.filter((c) => c.status === 'rejected').length,
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="my-complaints-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <FiList /> My Complaints
                    </h1>
                    <p className="page-subtitle">
                        Track all your reported civic issues and their priority scores
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <FiFilter />
                {Object.entries(statusCounts).map(([key, count]) => (
                    <button
                        key={key}
                        className={`filter-tab ${filter === key ? 'active' : ''}`}
                        onClick={() => setFilter(key)}
                    >
                        {key.replace('_', ' ').toUpperCase()}
                        <span className="tab-count">{count}</span>
                    </button>
                ))}
            </div>

            {/* Complaints List */}
            {filteredComplaints.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <h3>No complaints found</h3>
                    <p>
                        {filter === 'all'
                            ? "You haven't submitted any complaints yet."
                            : `No ${filter.replace('_', ' ')} complaints.`}
                    </p>
                </div>
            ) : (
                <div className="complaints-list">
                    {filteredComplaints.map((complaint) => (
                        <ComplaintCard
                            key={complaint._id}
                            complaint={complaint}
                            onUpvote={handleUpvote}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyComplaints;