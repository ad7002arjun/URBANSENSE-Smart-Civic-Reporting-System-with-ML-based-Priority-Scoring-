import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiMenu,
    FiX,
    FiHome,
    FiPlusCircle,
    FiList,
    FiBarChart2,
    FiLogOut,
    FiUser,
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMobileOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🏙️</span>
                    <span className="logo-text">
                        URBAN<span className="logo-highlight">SENSE</span>
                    </span>
                </Link>

                {/* Desktop Nav Links */}
                <div className={`navbar-links ${mobileOpen ? 'active' : ''}`}>
                    <Link
                        to="/"
                        className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        onClick={() => setMobileOpen(false)}
                    >
                        <FiHome /> Home
                    </Link>

                    {isAuthenticated && (
                        <>
                            <Link
                                to="/submit"
                                className={`nav-link ${
                                    isActive('/submit') ? 'active' : ''
                                }`}
                                onClick={() => setMobileOpen(false)}
                            >
                                <FiPlusCircle /> Report Issue
                            </Link>
                            <Link
                                to="/my-complaints"
                                className={`nav-link ${
                                    isActive('/my-complaints')
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() => setMobileOpen(false)}
                            >
                                <FiList /> My Complaints
                            </Link>
                            <Link
                                to="/dashboard"
                                className={`nav-link ${
                                    isActive('/dashboard') ? 'active' : ''
                                }`}
                                onClick={() => setMobileOpen(false)}
                            >
                                <FiBarChart2 /> Dashboard
                            </Link>
                        </>
                    )}

                    {/* Auth Section */}
                    <div className="nav-auth">
                        {isAuthenticated ? (
                            <div className="nav-user-section">
                                <div className="nav-user-info">
                                    <FiUser />
                                    <span>{user?.name}</span>
                                    <span className="user-role-badge">
                                        {user?.role}
                                    </span>
                                </div>
                                <button
                                    className="btn-logout"
                                    onClick={handleLogout}
                                >
                                    <FiLogOut /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="nav-auth-buttons">
                                <Link
                                    to="/login"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="navbar-toggle"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;