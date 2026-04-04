import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = ({ onFinished }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onFinished) setTimeout(onFinished, 500);
        }, 2200);

        return () => clearTimeout(timer);
    }, [onFinished]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: '#0a0c10',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 99999,
                    }}
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.08, 1],
                            opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            width: '120px',
                            height: '120px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <img 
                            src="/logo-circle-blue.svg" 
                            alt="Kone Code" 
                            style={{ 
                                width: '100%', 
                                height: 'auto',
                                filter: 'drop-shadow(0 0 20px rgba(88, 166, 255, 0.3))'
                            }} 
                        />
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        style={{
                            marginTop: '2rem',
                            letterSpacing: '0.3em',
                            fontSize: '0.7rem',
                            color: '#58a6ff',
                            textTransform: 'uppercase',
                            fontWeight: 600
                        }}
                    >
                        Initializing IDE
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;
