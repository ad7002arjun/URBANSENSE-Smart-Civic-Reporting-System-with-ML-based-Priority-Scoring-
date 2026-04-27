import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiArrowRight,
    FiShield,
    FiBarChart2,
    FiCpu,
    FiUsers,
    FiTrendingUp,
    FiMap,
} from 'react-icons/fi';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: <FiCpu />,
            title: 'ML-Powered Severity',
            desc: 'CNN (MobileNetV2) classifies issue severity from uploaded images using Transfer Learning.',
        },
        {
            icon: <FiBarChart2 />,
            title: 'Priority Scoring Engine',
            desc: 'P = αS + βF + γC + δH — Dynamic scoring based on Severity, Frequency, Credibility & History.',
        },
        {
            icon: <FiShield />,
            title: 'Confidence-Aware',
            desc: 'ML confidence levels adjust priority calculations for more accurate results.',
        },
        {
            icon: <FiMap />,
            title: 'Geospatial Analysis',
            desc: 'Nearby complaint frequency detection using coordinate-based proximity search.',
        },
        {
            icon: <FiUsers />,
            title: 'User Credibility',
            desc: 'Dynamic trust scores based on complaint resolution history.',
        },
        {
            icon: <FiTrendingUp />,
            title: 'Smart Dashboard',
            desc: 'Authority dashboard with priority-sorted complaints and FCFS comparison analysis.',
        },
    ];

    const techStack = [
        { name: 'MongoDB', icon: '🍃', desc: 'NoSQL Database' },
        { name: 'Express.js', icon: '⚡', desc: 'Backend Framework' },
        { name: 'React.js', icon: '⚛️', desc: 'Frontend UI' },
        { name: 'Node.js', icon: '🟢', desc: 'Server Runtime' },
        { name: 'TensorFlow', icon: '🧠', desc: 'ML Framework' },
        { name: 'MobileNetV2', icon: '📱', desc: 'CNN Model' },
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">🏙️ Smart City · SDG 11</div>
                    <h1 className="hero-title">
                        URBAN<span className="highlight">SENSE</span>
                    </h1>
                    <p className="hero-subtitle">
                        Smart Civic Reporting System with Confidence-Aware 
                        Priority Scoring
                    </p>
                    <p className="hero-desc">
                        An intelligent urban complaint management platform that uses
                        Machine Learning and a weighted priority model to ensure
                        critical civic issues are resolved first — not just whoever
                        reports first.
                    </p>
                    <div className="hero-formula">
                        <span className="formula-label">Priority Model:</span>
                        <span className="formula">
                            P = αS + βF + γC + δH
                        </span>
                    </div>
                    <div className="hero-buttons">
                        {isAuthenticated ? (
                            <>
                                <Link to="/submit" className="btn btn-primary btn-lg">
                                    Report an Issue <FiArrowRight />
                                </Link>
                                <Link to="/dashboard" className="btn btn-outline btn-lg">
                                    View Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Get Started <FiArrowRight />
                                </Link>
                                <Link to="/login" className="btn btn-outline btn-lg">
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="visual-card">
                        <div className="visual-priority critical">
                            <span className="dot"></span> CRITICAL — Sewage Overflow
                            <span className="score">P: 92</span>
                        </div>
                        <div className="visual-priority high">
                            <span className="dot"></span> HIGH — Pothole on Main Rd
                            <span className="score">P: 71</span>
                        </div>
                        <div className="visual-priority medium">
                            <span className="dot"></span> MEDIUM — Garbage Pile
                            <span className="score">P: 48</span>
                        </div>
                        <div className="visual-priority low">
                            <span className="dot"></span> LOW — Streetlight Flicker
                            <span className="score">P: 23</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title">How It Works</h2>
                <p className="section-subtitle">
                    Unlike FCFS systems, URBANSENSE dynamically ranks complaints
                </p>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div
                            className="feature-card fade-in-up"
                            key={index}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="tech-section">
                <h2 className="section-title">Tech Stack</h2>
                <div className="tech-grid">
                    {techStack.map((tech, index) => (
                        <div className="tech-card" key={index}>
                            <span className="tech-icon">{tech.icon}</span>
                            <span className="tech-name">{tech.name}</span>
                            <span className="tech-desc">{tech.desc}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* SDG Section */}
            <section className="sdg-section">
                <div className="sdg-content">
                    <h2>Aligned with UN SDG 11</h2>
                    <p>
                        Sustainable Cities and Communities — Making cities inclusive,
                        safe, resilient and sustainable through smart technology
                        and data-driven governance.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Home;