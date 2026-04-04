import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Keyboard layout flex values
const keyboardRows: number[][] = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6],
    [2.2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.5],
    [1.5, 1.5, 1.5, 6, 1.5, 1.5, 1.5, 1.5]
];

const HeroAnimation: React.FC = () => {
    const [activeKeys, setActiveKeys] = useState<string[]>([]);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const interval = setInterval(() => {
            const keys: string[] = Array.from({length: 4}).map(() => (
                Math.floor(Math.random() * 5) + '-' + Math.floor(Math.random() * 12)
            ));
            setActiveKeys(keys);
        }, 150);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // PREMIUM FORWARD POSITION
    const handYOffset: number = isMobile ? 305 : 265;

    // Premium Tapered 4-Finger Heights (Index, Middle, Ring, Pinky)
    const fingerHeights: number[] = [52, 62, 58, 48];

    return (
        <div style={{
            position: 'relative', width: '100%', maxWidth: '600px', aspectRatio: '4/3',
            background: '#2B3152', borderRadius: '24px', overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', margin: '0 auto'
        }}>
            <svg viewBox="0 25 600 440" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="monitorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#4A5B8A" /><stop offset="100%" stopColor="#2E3960" />
                    </linearGradient>
                    <linearGradient id="handGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FDFDFD" /><stop offset="100%" stopColor="#DDE6EF" />
                    </linearGradient>
                    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#A8C4CB" stopOpacity="0.9" /><stop offset="100%" stopColor="#6C8A94" stopOpacity="0.7" />
                    </linearGradient>
                </defs>

                {/* --- MONITOR --- */}
                <rect x="70" y="50" width="460" height="230" rx="16" fill="#3D4B78" opacity="0.6" />
                <rect x="80" y="60" width="440" height="210" rx="12" fill="url(#monitorGrad)" />

                {/* --- CODE LINES (High Fidelity) --- */}
                <g transform="translate(100, 85)">
                    <motion.rect x="0" y="0" width="120" height="7" rx="3.5" fill="#FF6B9E" initial={{ width: 0 }} animate={{ width: [0, 120, 0] }} transition={{ duration: 4, repeat: Infinity }} />
                    <motion.rect x="0" y="18" width="230" height="7" rx="3.5" fill="#FF6B9E" initial={{ width: 0 }} animate={{ width: [0, 230, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }} />
                    <g transform="translate(0, 36)">
                        <motion.rect x="0" y="0" width="45" height="7" rx="3.5" fill="#06D6A0" initial={{ width: 0 }} animate={{ width: [0, 45, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} />
                        <motion.rect x="55" y="0" width="110" height="7" rx="3.5" fill="#FFD166" initial={{ width: 0 }} animate={{ width: [0, 110, 0] }} transition={{ duration: 4.5, repeat: Infinity, delay: 1.2 }} />
                    </g>
                    <g transform="translate(0, 54)">
                        <motion.rect x="0" y="0" width="90" height="7" rx="3.5" fill="#06D6A0" initial={{ width: 0 }} animate={{ width: [0, 90, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1.5 }} />
                        <motion.rect x="100" y="0" width="120" height="7" rx="3.5" fill="#FF6B9E" initial={{ width: 0 }} animate={{ width: [0, 120, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 1.7 }} />
                    </g>
                    <motion.rect x="0" y="72" width="160" height="7" rx="3.5" fill="#FFD166" initial={{ width: 0 }} animate={{ width: [0, 160, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 2 }} />
                </g>

                {/* --- THE ORIGINAL PREMIUM HTML KEYBOARD --- */}
                <foreignObject x="50" y="235" width="500" height="200">
                    <div style={{
                        width: '100%', height: '100%', display: 'flex', justifyContent: 'center',
                        perspective: '1000px', padding: '10px'
                    }}>
                        <div style={{
                            width: '420px', height: '140px', background: 'linear-gradient(180deg, #354266 0%, #1A223E 100%)',
                            borderRadius: '16px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px',
                            transform: 'rotateX(50deg)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                            borderBottom: '6px solid #0D1225'
                        }}>
                            {keyboardRows.map((row, rIndex) => (
                                <div key={rIndex} style={{ display: 'flex', gap: '4px', flex: 1 }}>
                                    {row.map((flex, cIndex) => {
                                        const keyId = rIndex + '-' + cIndex;
                                        const active = activeKeys.includes(keyId);
                                        return (
                                            <div key={cIndex} style={{
                                                flex, background: active ? '#06D6A0' : 'linear-gradient(180deg, #4A5B8A 0%, #344062 100%)',
                                                borderRadius: '4px', borderBottom: active ? '1px solid transparent' : '3px solid #1C2341',
                                                boxShadow: active ? '0 0 10px #06D6A0' : 'none', transition: 'all 0.1s'
                                            }} />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </foreignObject>

                {/* --- RESTORED STABLE HANDS WITH SENSOR DOTS --- */}
                <g>
                    {/* Left Hand */}
                    <motion.g animate={{ y: [0, -5, 5, 0], x: [0, 2, -2, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
                        <g transform={`translate(150, ${handYOffset})`}>
                            <ellipse cx="60" cy="115" rx="55" ry="12" fill="#121628" opacity="0.3" />
                            <path d="M 15 55 C 15 40 40 40 40 40 L 90 40 C 90 40 115 40 115 65 C 115 105 100 135 75 145 C 50 155 25 135 10 105 C -5 65 15 55 15 55 Z" fill="url(#handGrad)" />
                            
                            {[22, 44, 66, 88].map((x, i) => (
                                <motion.g 
                                    key={i} 
                                    style={{ transformOrigin: 'bottom center' }}
                                    transform={`rotate(${(-15 + (i * 10))}, ${x + 9}, 50)`}
                                    animate={{ y: [0, -4, 4, 0], scaleY: [1, 1.1, 0.9, 1] }}
                                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                                >
                                    <rect x={x} y={50 - fingerHeights[i]} width={18} height={fingerHeights[i]} rx={9} fill="#FDFDFD" />
                                    {/* Perfect Sensor Dot near Tip */}
                                    <circle cx={x + 9} cy={50 - fingerHeights[i] + 10} r="2.5" fill="#1A223E" opacity="0.8" />
                                </motion.g>
                            ))}
                            
                            <circle cx="45" cy="100" r="6" fill="#1A223E" opacity="0.8" />
                            <circle cx="75" cy="115" r="5" fill="#1A223E" opacity="0.8" />
                        </g>
                    </motion.g>

                    {/* Right Hand */}
                    <motion.g animate={{ y: [0, -5, 5, 0], x: [0, -2, 2, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}>
                        <g transform={`translate(320, ${handYOffset + 10})`}>
                            <ellipse cx="60" cy="110" rx="55" ry="12" fill="#121628" opacity="0.3" />
                            <path d="M 105 55 C 105 40 80 40 80 40 L 30 40 C 30 40 5 40 5 65 C 5 105 20 135 45 145 C 70 155 95 135 110 105 C 125 65 105 55 105 55 Z" fill="url(#handGrad)" />
                            
                            {[14, 36, 58, 80].map((x, i) => (
                                <motion.g 
                                    key={i} 
                                    style={{ transformOrigin: 'bottom center' }}
                                    transform={`rotate(${(-15 + (i * 10))}, ${x + 9}, 50)`}
                                    animate={{ y: [0, -4, 4, 0], scaleY: [1, 1.1, 0.9, 1] }}
                                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                                >
                                    <rect x={x} y={50 - fingerHeights[i]} width={18} height={fingerHeights[i]} rx={9} fill="#FDFDFD" />
                                    <circle cx={x + 9} cy={50 - fingerHeights[i] + 10} r="2.5" fill="#1A223E" opacity="0.8" />
                                </motion.g>
                            ))}
                            
                            <circle cx="75" cy="100" r="6" fill="#1A223E" opacity="0.8" />
                            <circle cx="45" cy="115" r="5" fill="#1A223E" opacity="0.8" />
                        </g>
                    </motion.g>
                </g>

                {/* --- LOGO BADGE --- */}
                <g transform="translate(430, 160)">
                    <rect x="0" y="0" width="100" height="65" rx="14" fill="url(#badgeGrad)" />
                    <g transform="translate(30, 12.5) scale(0.2)">
                        <circle cx="100" cy="100" r="95" fill="#2E3960" opacity="0.8" />
                        <path d="M 70 75 L 45 100 M 70 125 L 45 100" stroke="white" strokeWidth="14" fill="none" />
                        <path d="M 130 75 L 155 100 M 130 125 L 155 100" stroke="white" strokeWidth="14" fill="none" />
                        <path d="M 100 55 C 100 55 120 75 120 95 C 120 108 111 118 100 122 C 89 118 80 108 80 95 C 80 75 100 55 100 55 Z" fill="white" />
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default HeroAnimation;
