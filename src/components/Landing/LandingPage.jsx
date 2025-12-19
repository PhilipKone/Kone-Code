import React, { useState } from 'react';

const LandingPage = ({ onEnter }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Inland styles for the landing page
    const styles = {
        container: {
            height: '100vh',
            width: '100vw',
            backgroundColor: '#050505',
            color: '#e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Roboto Mono", monospace',
            userSelect: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 9999, // Ensure it sits on top if needed
        },
        logo: {
            fontSize: '3rem',
            letterSpacing: '5px',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
            borderBottom: '2px solid #333',
            paddingBottom: '10px'
        },
        subtitle: {
            fontSize: '0.9rem',
            letterSpacing: '3px',
            color: '#666',
            marginBottom: '4rem',
            textTransform: 'uppercase'
        },
        button: {
            backgroundColor: 'transparent',
            border: '1px solid #333',
            color: isHovered ? '#fff' : '#888',
            padding: '15px 40px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            letterSpacing: '2px',
            boxShadow: isHovered ? '0 0 15px rgba(255, 255, 255, 0.1)' : 'none',
            borderColor: isHovered ? '#fff' : '#333'
        },
        footer: {
            position: 'absolute',
            bottom: '20px',
            fontSize: '0.7rem',
            color: '#333'
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.logo}>KONE CODE DIVISION</h1>
            <p style={styles.subtitle}>// RESTRICTED ENVIRONMENT //</p>

            <button
                style={styles.button}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onEnter}
            >
                INITIALIZE WORKSPACE
            </button>

            <div style={styles.footer}>SYS.VER.0.9.1 // KONE CORP</div>
        </div>
    );
};

export default LandingPage;
