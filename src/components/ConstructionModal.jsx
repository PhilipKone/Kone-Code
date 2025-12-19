import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaTools } from 'react-icons/fa';

const ConstructionModal = ({ onClose }) => {
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
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
                zIndex: 1100, // Higher than CourseModal if needed, though we might verify
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
        >
            <motion.div
                className="modal-content glass-card"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '400px',
                    width: '100%',
                    position: 'relative',
                    padding: '2.5rem 2rem',
                    background: '#1e1e1e',
                    border: '1px solid #eab308', // Amber border for "Warning/Construction"
                    boxShadow: '0 0 20px rgba(234, 179, 8, 0.1)',
                    borderRadius: '16px',
                    textAlign: 'center'
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
                        color: '#666',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        transition: 'color 0.2s'
                    }}
                >
                    <FaTimes />
                </button>

                <motion.div
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 10 }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    style={{ color: '#eab308', fontSize: '3.5rem', marginBottom: '1.5rem', display: 'inline-block' }}
                >
                    <FaTools />
                </motion.div>

                <h2 style={{ color: '#fff', margin: '0 0 1rem', fontSize: '1.8rem' }}>Under Development</h2>

                <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '2rem' }}>
                    The <strong>Kone Code IDE</strong> is currently being built. <br />
                    We're working hard to bring you a world-class coding experience.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={onClose}
                        className="btn-primary"
                        style={{
                            background: '#eab308', // Amber button
                            color: '#000',
                            border: 'none',
                            padding: '0.8rem 2rem',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Got it
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ConstructionModal;
