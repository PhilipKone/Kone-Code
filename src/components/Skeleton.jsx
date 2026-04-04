import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type, height, width, borderRadius = '8px', className = '' }) => {
    const styles = {
        height: height || '20px',
        width: width || '100%',
        borderRadius: borderRadius,
    };

    if (type === 'editor') {
        return (
            <div className={`skeleton-editor shimmer ${className}`}>
                <div className="skeleton-line medium mb-2" />
                <div className="skeleton-line small mb-4" />
                <div className="skeleton-line long mb-2" />
                <div className="skeleton-line medium mb-2" />
                <div className="skeleton-line small" />
            </div>
        );
    }

    return (
        <div 
            className={`skeleton-base shimmer ${className}`} 
            style={styles} 
        />
    );
};

export default Skeleton;
