import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaApple, FaAndroid, FaShare, FaEllipsisV, FaPlusSquare, FaMobileAlt } from 'react-icons/fa';

const InstallPWAModal = ({ isOpen, onClose }) => {
    const [platform, setPlatform] = useState('ios'); // 'ios' | 'android'

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 30000,
                    backdropFilter: 'blur(10px)'
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        style={{
                            width: '90%',
                            maxWidth: '500px',
                            backgroundColor: '#1e1e1e',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <FaMobileAlt color="#007acc" />
                                Install Kone Code IDE
                            </h3>
                            <button 
                                onClick={onClose}
                                style={{
                                    position: 'absolute',
                                    top: '1.25rem',
                                    right: '1.25rem',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.5rem' }}>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                For the best experience, add Kone Code to your home screen. It will run in full-screen mode just like a native app.
                            </p>

                            {/* Platform Toggle */}
                            <div style={{ 
                                display: 'flex', 
                                backgroundColor: 'rgba(255,255,255,0.05)', 
                                padding: '4px', 
                                borderRadius: '12px',
                                marginBottom: '2rem'
                            }}>
                                <button 
                                    onClick={() => setPlatform('ios')}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.85rem',
                                        backgroundColor: platform === 'ios' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: platform === 'ios' ? 'white' : 'rgba(255,255,255,0.4)',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FaApple color={platform === 'ios' ? '#fff' : 'currentColor'} />
                                    iOS (Safari)
                                </button>
                                <button 
                                    onClick={() => setPlatform('android')}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.85rem',
                                        backgroundColor: platform === 'android' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: platform === 'android' ? 'white' : 'rgba(255,255,255,0.4)',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FaAndroid color={platform === 'android' ? '#3DDC84' : 'currentColor'} />
                                    Android (Chrome)
                                </button>
                            </div>

                            {/* Steps */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {platform === 'ios' ? (
                                    <>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0,122,204,0.2)', color: '#007acc', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>1</div>
                                            <p style={{ margin: 0, color: 'white', fontSize: '0.9rem' }}>
                                                <>Open Safari and tap the <FaShare color="#007aff" style={{ margin: '0 2px', verticalAlign: 'middle' }} /> <strong>Share</strong> icon in the toolbar.</>
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0,122,204,0.2)', color: '#007acc', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>2</div>
                                            <p style={{ margin: 0, color: 'white', fontSize: '0.9rem' }}>
                                                <>Scroll down and tap <FaPlusSquare style={{ margin: '0 2px', verticalAlign: 'middle' }} /> <strong>"Add to Home Screen"</strong>.</>
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0,122,204,0.2)', color: '#007acc', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>1</div>
                                            <p style={{ margin: 0, color: 'white', fontSize: '0.9rem' }}>
                                                <>Open Chrome and tap the <FaEllipsisV style={{ margin: '0 2px', verticalAlign: 'middle' }} /> <strong>Menu</strong> (three dots) icon.</>
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0,122,204,0.2)', color: '#007acc', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>2</div>
                                            <p style={{ margin: 0, color: 'white', fontSize: '0.9rem' }}>
                                                <>Tap <strong>"Install App"</strong> (or "Add to Home Screen").</>
                                            </p>
                                        </div>
                                    </>
                                )}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0,122,204,0.2)', color: '#007acc', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>3</div>
                                    <p style={{ margin: 0, color: 'white', fontSize: '0.9rem' }}>
                                        <>Confirm the name and tap <strong>Add</strong> or <strong>Install</strong>.</>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                            <button 
                                onClick={onClose}
                                style={{
                                    padding: '0.75rem 2.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#007acc',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Got it!
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default InstallPWAModal;
