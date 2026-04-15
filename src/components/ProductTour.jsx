import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiChevronRight, 
    FiChevronLeft, 
    FiX, 
    FiCheck 
} from 'react-icons/fi';

const tourSteps = [
    {
        title: "Welcome to Kone Code!",
        description: "Your premium, cloud-powered IDE for Python and Web development. Let's take a quick tour of the key features.",
        target: "none", // Center overlay
        position: "center"
    },
    {
        title: "Project Explorer",
        description: "Manage your files and folders here. Right-click any item to rename or delete it.",
        target: "explorer-tab",
        position: "right"
    },
    {
        title: "Power Editor",
        description: "Write your code with full IntelliSense and auto-save. Your work is automatically synced to the cloud.",
        target: "monaco-editor",
        position: "center"
    },
    {
        title: "Global Run",
        description: "Execute your code instantly. Support for Python scripts and Web previews (HTML/JS).",
        target: "run-button",
        position: "left"
    },
    {
        title: "Help & Resources",
        description: "Need help? Access documentation, feedback, and more from the Help menu anytime.",
        target: "help-button",
        position: "left"
    }
];

const ProductTour = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(0);
            return;
        }

        const updateTarget = () => {
            const step = tourSteps[currentStep];
            if (step.target === "none") {
                setTargetRect(null);
                return;
            }

            const element = document.getElementById(step.target);
            if (element) {
                setTargetRect(element.getBoundingClientRect());
            }
        };

        updateTarget();
        window.addEventListener('resize', updateTarget);
        return () => window.removeEventListener('resize', updateTarget);
    }, [currentStep, isOpen]);

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    if (!isOpen) return null;

    const step = tourSteps[currentStep];

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            pointerEvents: 'none'
        }}>
            {/* Backdrop with Spotlight */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(2px)',
                    clipPath: targetRect ? `polygon(
                        0% 0%, 0% 100%, 
                        ${targetRect.left}px 100%, 
                        ${targetRect.left}px ${targetRect.top}px, 
                        ${targetRect.right}px ${targetRect.top}px, 
                        ${targetRect.right}px ${targetRect.bottom}px, 
                        ${targetRect.left}px ${targetRect.bottom}px, 
                        ${targetRect.left}px 100%, 
                        100% 100%, 100% 0%
                    )` : 'none',
                    pointerEvents: 'auto'
                }}
                className="tour-backdrop"
                onClick={onClose}
            />

            {/* Tour Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    style={{
                        position: 'absolute',
                        ...(step.position === 'center' ? {
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                        } : {
                            top: targetRect ? (step.position === 'bottom' ? targetRect.bottom + 20 : targetRect.top) : '50%',
                            left: targetRect ? (step.position === 'right' ? targetRect.right + 20 : (step.position === 'left' ? targetRect.left - 340 : targetRect.left)) : '50%',
                        }),
                        width: '320px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        background: 'rgba(23, 23, 23, 0.85)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                        pointerEvents: 'auto',
                        zIndex: 10001
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ 
                            fontSize: '12px', 
                            fontWeight: '600', 
                            color: '#3b82f6', 
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            Kone Guide • Step {currentStep + 1} of {tourSteps.length}
                        </span>
                        <button onClick={onClose} style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.4)',
                            cursor: 'pointer'
                        }}>
                            <FiX />
                        </button>
                    </div>

                    <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>{step.title}</h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                        {step.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button 
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255, 255, 255, 0.5)',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            Skip
                        </button>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {currentStep > 0 && (
                                <button onClick={handleBack} style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#fff',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <FiChevronLeft /> Back
                                </button>
                            )}
                            <button onClick={handleNext} style={{
                                background: '#3b82f6',
                                border: 'none',
                                color: '#fff',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}>
                                {currentStep === tourSteps.length - 1 ? (
                                    <>Finish <FiCheck /></>
                                ) : (
                                    <>Next <FiChevronRight /></>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ProductTour;
