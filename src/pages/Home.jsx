import React, { useState } from 'react';
import '../App.css';
import { FaBars, FaTimes, FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Home() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const courses = [
        {
            id: 'python',
            title: 'Python Masterclass',
            level: 'Beginner to Advanced',
            icon: '🐍',
            desc: 'Data structure, algorithms, and AI development basics.',
            status: 'Open'
        },
        {
            id: 'web',
            title: 'Full Stack Web',
            level: 'Intermediate',
            icon: '🌐',
            desc: 'React, Node.js, and modern UI/UX principles.',
            status: 'Waitlist'
        },
        {
            id: 'data',
            title: 'Data Science Core',
            level: 'Advanced',
            icon: '📊',
            desc: 'Pandas, NumPy, and predictive modeling foundations.',
            status: 'Open'
        }
    ];

    return (
        <div className="app-container">
            {/* Navigation */}
            <nav className="navbar">
                <div className="logo">
                    <img src="/Kone-Code/logo-circle-blue.svg" alt="Logo" style={{ height: '24px', marginRight: '10px', verticalAlign: 'middle' }} />
                    Kone Code
                </div>

                <div className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </div>

                <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <a href="#courses" onClick={() => setIsMenuOpen(false)}>Courses</a>
                    <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
                    <div className="action-buttons">
                        <a href="https://PhilipKone.github.io/Kone-Consult/#/login" className="btn-login" onClick={() => setIsMenuOpen(false)}>Student Login</a>
                        <a href="https://PhilipKone.github.io/Kone-Code-Academy/" className="btn-hub" onClick={() => setIsMenuOpen(false)}>Back to Hub</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">MASTER THE <br /> <span className="text-gradient">DIGITAL REALM</span></h1>
                    <p className="hero-subtitle">
                        Advanced software engineering training for the next generation of developers.<br />
                        <span className="text-white">Code the future the right way.</span>
                    </p>
                    <Link to="/ide" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>LAUNCH IDE</Link>
                </div>
            </header>

            {/* Courses Grid */}
            <section id="courses" className="courses-section">
                <h2 className="section-title">AVAILABLE MODULES</h2>
                <div className="grid">
                    {courses.map(course => (
                        <div key={course.id} className="card glass-card">
                            <div className="card-header">
                                <span className="icon" style={{ fontSize: '2rem' }}>{course.icon}</span>
                                <span className={`status ${course.status.toLowerCase()}`}>{course.status}</span>
                            </div>
                            <h3 className="mt-3">{course.title}</h3>
                            <p className="level text-accent small uppercase mb-2" style={{ letterSpacing: '1px' }}>{course.level}</p>
                            <p className="description text-secondary">{course.desc}</p>
                            <Link to="/ide" className="btn-card mt-3" style={{ textDecoration: 'none' }}>View Curriculum &rarr;</Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2025 Kone Code Division. All Rights Reserved.</p>
                <p className="footer-sub">Part of the Kone Academy Network</p>
                <div style={{ marginTop: '0.5rem', fontSize: '1.2rem' }}>
                    <a href="https://github.com/PhilipKone/Kone-Code.git" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <FaGithub /> GitHub
                    </a>
                </div>
            </footer>
        </div>
    );
}

export default Home;
