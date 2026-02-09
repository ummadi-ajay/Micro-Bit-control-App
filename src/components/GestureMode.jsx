import React from 'react';

function GestureMode({ active, gestureActive, setGestureActive, tiltData }) {
    if (!active) return null;

    return (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>📱</div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Gesture Control</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Tilt your device to steer the robot
            </p>

            <button
                onClick={() => setGestureActive(!gestureActive)}
                style={{
                    padding: '1.5rem 3rem',
                    fontSize: '1.2rem',
                    background: gestureActive ? 'var(--accent-red)' : 'var(--accent-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    marginBottom: '2rem'
                }}
            >
                {gestureActive ? '🛑 Stop Gesture' : '🚀 Activate Tilt Control'}
            </button>

            {gestureActive && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    maxWidth: '400px',
                    margin: '0 auto'
                }}>
                    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Forward/Back</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-blue)' }}>{tiltData.beta.toFixed(0)}°</div>
                    </div>
                    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Left/Right</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-purple)' }}>{tiltData.gamma.toFixed(0)}°</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GestureMode;

