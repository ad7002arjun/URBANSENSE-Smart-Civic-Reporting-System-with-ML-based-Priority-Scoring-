import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { complaintsAPI } from '../utils/api';
import MapPicker from '../components/MapPicker';
import {
    FiSend,
    FiImage,
    FiMapPin,
    FiAlertTriangle,
    FiFileText,
    FiTag,
} from 'react-icons/fi';
import './SubmitComplaint.css';

const SubmitComplaint = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        address: '',
        latitude: '',
        longitude: '',
        image: null,
    });

    const categories = [
        { value: 'pothole', label: '🕳️ Pothole' },
        { value: 'garbage', label: '🗑️ Garbage / Waste' },
        { value: 'streetlight', label: '💡 Streetlight Issue' },
        { value: 'water_leak', label: '💧 Water Leak' },
        { value: 'sewage', label: '🚿 Sewage Problem' },
        { value: 'road_damage', label: '🛣️ Road Damage' },
        { value: 'illegal_construction', label: '🏗️ Illegal Construction' },
        { value: 'noise_pollution', label: '🔊 Noise Pollution' },
        { value: 'air_pollution', label: '🌫️ Air Pollution' },
        { value: 'other', label: '📋 Other' },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleLocationSelect = (location) => {
        setFormData({
            ...formData,
            latitude: location.latitude.toFixed(6),
            longitude: location.longitude.toFixed(6),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category) {
            toast.error('Please select a category');
            return;
        }

        if (!formData.latitude || !formData.longitude) {
            toast.error('Please select a location on the map');
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('address', formData.address);
            submitData.append('latitude', formData.latitude);
            submitData.append('longitude', formData.longitude);

            if (formData.image) {
                submitData.append('image', formData.image);
            }

            const response = await complaintsAPI.create(submitData);

            if (response.data.success) {
                toast.success(
                    `Complaint submitted! Priority Score: ${response.data.data.priorityScore}`
                );
                navigate('/my-complaints');
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to submit complaint'
            );
        }

        setLoading(false);
    };

    return (
        <div className="submit-page">
            <div className="submit-header">
                <h1 className="page-title">
                    <FiAlertTriangle /> Report a Civic Issue
                </h1>
                <p className="page-subtitle">
                    Submit your complaint with image and location. Our ML engine
                    will analyze severity and calculate priority automatically.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="submit-form">
                <div className="submit-grid">
                    {/* Left Column - Form Fields */}
                    <div className="submit-left">
                        <div className="form-group">
                            <label>
                                <FiFileText /> Complaint Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                className="form-control"
                                placeholder="Brief title of the issue"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                maxLength={200}
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <FiTag /> Category
                            </label>
                            <select
                                name="category"
                                className="form-control"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                <FiFileText /> Description
                            </label>
                            <textarea
                                name="description"
                                className="form-control"
                                placeholder="Describe the issue in detail..."
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={5}
                                maxLength={2000}
                            ></textarea>
                            <span className="char-count">
                                {formData.description.length}/2000
                            </span>
                        </div>

                        <div className="form-group">
                            <label>
                                <FiMapPin /> Location Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                className="form-control"
                                placeholder="Street address or landmark"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Latitude</label>
                                <input
                                    type="number"
                                    name="latitude"
                                    className="form-control"
                                    placeholder="Click map"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    step="any"
                                    required
                                    readOnly
                                />
                            </div>
                            <div className="form-group">
                                <label>Longitude</label>
                                <input
                                    type="number"
                                    name="longitude"
                                    className="form-control"
                                    placeholder="Click map"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    step="any"
                                    required
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Image & Map */}
                    <div className="submit-right">
                        {/* Image Upload */}
                        <div className="form-group">
                            <label>
                                <FiImage /> Upload Image
                            </label>
                            <div className="image-upload-area">
                                {imagePreview ? (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                        <button
                                            type="button"
                                            className="remove-image"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setFormData({
                                                    ...formData,
                                                    image: null,
                                                });
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <label className="upload-placeholder">
                                        <FiImage size={40} />
                                        <span>Click to upload image</span>
                                        <span className="upload-hint">
                                            JPG, PNG, GIF (Max 5MB)
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            hidden
                                        />
                                    </label>
                                )}
                            </div>
                            <p className="ml-note">
                                🧠 Our CNN model will analyze image severity
                                automatically
                            </p>
                        </div>

                        {/* Map */}
                        <div className="form-group">
                            <label>
                                <FiMapPin /> Pin Location on Map
                            </label>
                            <MapPicker onLocationSelect={handleLocationSelect} />
                            <p className="map-hint">
                                Click on the map to set complaint location
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-lg submit-btn"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span
                                className="spinner"
                                style={{ width: 20, height: 20 }}
                            ></span>
                            Processing & Calculating Priority...
                        </>
                    ) : (
                        <>
                            <FiSend /> Submit Complaint
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SubmitComplaint;