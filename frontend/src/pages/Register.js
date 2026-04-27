import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiUserPlus } from 'react-icons/fi';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'citizen',
        phone: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            phone: formData.phone,
            address: formData.address,
        });

        if (result.success) {
            toast.success('Registration successful! Welcome to URBANSENSE.');
            navigate('/dashboard');
        } else {
            toast.error(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card register-card">
                <div className="auth-header">
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">
                        Join URBANSENSE to make your city smarter
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FiUser /> Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <FiMail /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FiLock /> Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <FiLock /> Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-control"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FiUser /> Role
                            </label>
                            <select
                                name="role"
                                className="form-control"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="citizen">Citizen</option>
                                <option value="authority">Authority</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                <FiPhone /> Phone (Optional)
                            </label>
                            <input
                                type="text"
                                name="phone"
                                className="form-control"
                                placeholder="Your phone number"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>
                            <FiMapPin /> Address (Optional)
                        </label>
                        <input
                            type="text"
                            name="address"
                            className="form-control"
                            placeholder="Your address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg auth-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner" style={{ width: 20, height: 20 }}></span>
                        ) : (
                            <>
                                <FiUserPlus /> Create Account
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;