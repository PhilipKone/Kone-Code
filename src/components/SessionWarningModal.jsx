import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';

const SessionWarningModal = ({ isOpen, onStay, onLogout, timeoutSeconds }) => {
    const [timeLeft, setTimeLeft] = useState(timeoutSeconds);

    useEffect(() => {
        if (!isOpen) {
            setTimeLeft(timeoutSeconds);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, timeoutSeconds, onLogout]);

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
                    zIndex: 9999,
                    backdropFilter: 'blur(12px)'
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="glass-card"
                        style={{
                            maxWidth: '400px',
                            width: '90%',
                            padding: '2.5rem',
                            textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                        }}
                    >
                        <div style={{ 
                            fontSize: '3rem', 
                            marginBottom: '1rem', 
                            color: '#ff4d4d',
                            filter: 'drop-shadow(0 0 10px rgba(255,77,77,0.3))'
                        }}>
                            <FaClock />
                        </div>
                        
                        <h2 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Session Expiring</h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                            You have been inactive for a while. For your security, you will be logged out in:
                        </p>

                        <div style={{ 
                            fontSize: '2.5rem', 
                            fontWeight: '700', 
                            color: 'white', 
                            marginBottom: '2rem',
                            fontFamily: 'monospace'
                        }}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>

                        <div className="d-flex flex-column gap-3">
                            <button
                                onClick={onStay}
                                className="btn-primary"
                                style={{
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    fontWeight: '600'
                                }}
                            >
                                <FaShieldAlt /> STAY LOGGED IN
                            </button>
                            
                            <button
                                onClick={onLogout}
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
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,77,77,0.1)'; e.currentTarget.style.color = '#ff4d4d'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                            >
                                <FaSignOutAlt /> LOGOUT NOW
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SessionWarningModal;
