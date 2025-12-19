import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaExternalLinkAlt, FaBookOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CourseModal = ({ course, onClose }) => {
    if (!course) return null;

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(5px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
        >
            <motion.div
                className="modal-content glass-card"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    position: 'relative',
                    padding: '2rem',
                    background: '#1e1e1e',
                    border: '1px solid #333',
                    borderRadius: '12px'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                    }}
                >
                    <FaTimes />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>{course.icon}</span>
                    <div>
                        <h3 style={{ margin: 0, color: '#fff' }}>{course.title}</h3>
                        <span className="level text-accent small uppercase" style={{ letterSpacing: '1px' }}>{course.level}</span>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem', color: '#ccc', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{course.desc}</p>
                    {course.longDesc && <p style={{ fontSize: '0.95rem', color: '#aaa' }}>{course.longDesc}</p>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'transparent',
                            border: '1px solid #555',
                            color: '#ccc',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                    <Link
                        to="/ide"
                        className="btn-primary"
                        style={{
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '4px',
                            background: '#0ea5e9',
                            color: 'white',
                            border: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        <FaCode /> Launch IDE
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CourseModal;
