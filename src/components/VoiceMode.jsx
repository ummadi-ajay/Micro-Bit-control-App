import React from 'react';

function VoiceMode({ active, voiceActive, lastVoiceCommand, toggleVoice }) {
    if (!active) return null;

    return (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>🎙️</div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Voice Command Center</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Say: "Forward", "Back", "Left", "Right", "Stop", "Horn"
            </p>

            <button
                onClick={toggleVoice}
                style={{
                    padding: '1.5rem 3rem',
                    fontSize: '1.2rem',
                    background: voiceActive ? 'var(--accent-red)' : 'var(--accent-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    marginBottom: '2rem'
                }}
            >
                {voiceActive ? '🛑 Stop Listening' : '🎤 Start Voice Control'}
            </button>

            {voiceActive && (
                <div style={{
                    padding: '1.5rem',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    display: 'inline-block',
                    animation: 'pulse 1.5s infinite'
                }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Listening...</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-blue)' }}>
                        {lastVoiceCommand || 'Speak now'}
                    </div>
                </div>
            )}
        </div>
    );
}

export default VoiceMode;

