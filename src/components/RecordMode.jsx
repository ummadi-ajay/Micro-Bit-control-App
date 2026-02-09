import React from 'react';

function RecordMode({
    active,
    recording,
    recordedSequence,
    savedSequences,
    startRecording,
    stopRecording,
    playSequence
}) {
    if (!active) return null;

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Record & Replay</h2>

            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <button
                    onClick={recording ? stopRecording : startRecording}
                    style={{
                        padding: '1rem 2rem',
                        fontSize: '1rem',
                        background: recording ? 'var(--accent-red)' : 'var(--accent-blue)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer'
                    }}
                >
                    {recording ? '⏹️ Stop Recording' : '⏺️ Start Recording'}
                </button>
                {recording && (
                    <div style={{ marginTop: '1rem', color: 'var(--accent-red)', fontWeight: '700' }}>
                        Recording... ({recordedSequence.length} commands)
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {savedSequences.map((seq, idx) => (
                    <div key={idx} style={{
                        padding: '1.5rem',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{seq.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            {seq.sequence.length} steps
                        </div>
                        <button
                            onClick={() => playSequence(seq.sequence)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                background: 'var(--accent-blue)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            ▶️ Play
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecordMode;

