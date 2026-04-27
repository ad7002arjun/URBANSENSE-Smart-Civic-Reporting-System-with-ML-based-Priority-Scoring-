import React from 'react';

const PriorityBadge = ({ score }) => {
    let label, color, bgColor;

    if (score >= 75) {
        label = 'CRITICAL';
        color = '#e74c3c';
        bgColor = 'rgba(231, 76, 60, 0.15)';
    } else if (score >= 50) {
        label = 'HIGH';
        color = '#fd79a8';
        bgColor = 'rgba(253, 121, 168, 0.15)';
    } else if (score >= 25) {
        label = 'MEDIUM';
        color = '#fdcb6e';
        bgColor = 'rgba(253, 203, 110, 0.15)';
    } else {
        label = 'LOW';
        color = '#00b894';
        bgColor = 'rgba(0, 184, 148, 0.15)';
    }

    const style = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '700',
        color: color,
        background: bgColor,
        border: `1px solid ${color}`,
        letterSpacing: '0.5px',
    };

    const dotStyle = {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
        animation: score >= 75 ? 'pulse 1.5s infinite' : 'none',
    };

    return (
        <span style={style}>
            <span style={dotStyle}></span>
            {label} ({score})
        </span>
    );
};

export default PriorityBadge;