import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            toast.success('Login successful! Welcome back.');
            navigate('/dashboard');
        } else {
            toast.error(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">
                        Login to URBANSENSE to report and track civic issues
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
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

                    <div className="form-group">
                        <label>
                            <FiLock /> Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
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
                                <FiLogIn /> Login
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">
                            Sign Up
                        </Link>
                    </p>
                </div>

                {/* Demo Credentials */}
                <div className="demo-credentials">
                    <p className="demo-title">Demo Credentials:</p>
                    <div className="demo-item">
                        <strong>Citizen:</strong> citizen@test.com / 123456
                    </div>
                    <div className="demo-item">
                        <strong>Authority:</strong> authority@test.com / 123456
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;