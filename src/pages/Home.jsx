import React, { useState } from 'react';
import '../App.css';
import { FaBars, FaTimes, FaGithub, FaDiscord, FaLinkedin, FaFacebook, FaInstagram, FaSlack, FaYoutube, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthInterceptModal from '../components/AuthInterceptModal';
import HeroAnimation from '../components/HeroAnimation';

function Home() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleLaunchIDE = (e) => {
        if (e) e.preventDefault();

        if (currentUser) {
            navigate('/ide');
        } else {
            setShowAuthModal(true);
        }
    };

    return (
        <div className="app-container">
            <AnimatePresence>
                <AuthInterceptModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    onContinueAsGuest={() => {
                        sessionStorage.setItem('kone_code_guest', 'true');
                        navigate('/ide');
                    }}
                />
            </AnimatePresence>

            {/* Navigation */}
            <nav className="navbar">
                <div className="logo">
                    <img src="/logo-circle-blue.svg" alt="Logo" style={{ height: '35px', marginRight: '10px', verticalAlign: 'middle' }} />
                    Kone Code
                </div>

                <div className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </div>

                <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <div className="action-buttons" style={{ display: 'flex', gap: '1rem' }}>
                        <a href="https://consult.koneacademy.io/#/login" className="btn-login" onClick={() => setIsMenuOpen(false)}>Login</a>
                        <a href="https://consult.koneacademy.io/#/docs?category=code" target="_blank" rel="noopener noreferrer" className="btn-login" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setIsMenuOpen(false)}>Docs</a>
                        <a href="https://www.koneacademy.io/" className="btn-hub" onClick={() => setIsMenuOpen(false)}>Back to Hub</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">MASTER THE <br /> <span className="text-gradient">DIGITAL REALM</span></h1>
                    <p className="hero-subtitle">
                        Advanced software development and training for the next generation of developers.<br />
                        <span className="text-white">Code the future the right way.</span>
                    </p>
                    <button
                        onClick={handleLaunchIDE}
                        className="btn-primary"
                        style={{ border: 'none', cursor: 'pointer' }}
                    >
                        LAUNCH IDE
                    </button>
                </div>
                <div className="hero-animation-wrapper">
                    <HeroAnimation />
                </div>
            </header>

            {/* About Section */}
            <section id="about" className="courses-section" style={{ paddingBottom: '0' }}>
                <h2 className="section-title">About Kone Code</h2>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        <strong>Kone Code</strong> is the dedicated software engineering division of Kone Academy.
                        We provide custom software solution and world-class training in modern programming languages, system architecture, and development workflows.
                        Our mission is to bridge the gap between theoretical computer science and practical, industry-standard software development.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <a href="https://consult.koneacademy.io/#/training" className="btn-secondary-outline" style={{
                            padding: '0.8rem 2rem',
                            borderRadius: '50px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            EXPLORE ALL COURSES AT TRAINING HUB &rarr;
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} Kone Code Division. All Rights Reserved.</p>
                <p className="footer-sub">Part of the Kone Academy Network</p>
                <div style={{ marginTop: '0.5rem', fontSize: '1.2rem' }}>
                    <div className="social-icons" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <a href="https://x.com/koneacademy" target="_blank" rel="noreferrer" aria-label="X"><FaXTwitter /></a>
                        <a href="https://www.tiktok.com/@koneacademy?_r=1&_t=ZM-931L3z5lu71" target="_blank" rel="noreferrer" aria-label="TikTok"><FaTiktok /></a>
                        <a href="https://github.com/PhilipKone/Kone-Code.git" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
                        <a href="https://discord.gg/Ab4SCxPgUK" target="_blank" rel="noreferrer" aria-label="Discord"><FaDiscord /></a>
                        <a href="https://www.linkedin.com/company/konecodeacdemy/?viewAsMember=true" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
                        <a href="https://www.facebook.com/profile.php?id=61584327765846" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebook /></a>
                        <a href="https://www.instagram.com/koneacademy?igsh=bnlnaTZ5YmNsMXJ1&utm_source=qr" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
                        <a href="https://join.slack.com/t/koneacademy/shared_invite/zt-3te5lrqpj-d3gixasFIoSerlBnoQ1UMg" target="_blank" rel="noreferrer" aria-label="Slack"><FaSlack /></a>
                        <a href="https://youtube.com/@koneacademy?si=zqEGBiiu0NRdNk6p" target="_blank" rel="noreferrer" aria-label="YouTube"><FaYoutube /></a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;
