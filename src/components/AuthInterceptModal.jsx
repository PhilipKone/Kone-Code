import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaRocket, FaUserSecret, FaTimes } from 'react-icons/fa';

const AuthInterceptModal = ({ isOpen, onClose, onContinueAsGuest }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    backdropFilter: 'blur(8px)'
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card"
                        style={{
                            maxWidth: '450px',
                            width: '90%',
                            padding: '2.5rem',
                            textAlign: 'center',
                            position: 'relative',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'none',
                                border: 'none',
                                color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer'
                            }}
                        >
                            <FaTimes size={20} />
                        </button>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                                <FaRocket />
                            </div>
                            <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Ready to Code?</h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                                Login to save your progress and sync your projects across all Kone Academy tools.
                            </p>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            <a
                                href="https://consult.koneacademy.io/#/login"
                                className="btn-primary"
                                style={{
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem'
                                }}
                            >
                                <FaUserCircle size={20} />
                                LOGIN / SIGNUP
                            </a>

                            <button
                                onClick={onContinueAsGuest}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'rgba(255,255,255,0.6)',
                                    padding: '0.85rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                            >
                                <FaUserSecret size={18} />
                                CONTINUE AS GUEST
                            </button>
                        </div>

                        <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                            Guest mode does not support cloud saving.
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthInterceptModal;
