import React from 'react';

function MissionPlanner({
    active,
    missionPath,
    executingMission,
    addMissionPoint,
    executeMission,
    clearMission
}) {
    if (!active) return null;

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Mission Planner</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Click on the grid to plan a path</p>

            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <button
                    onClick={executeMission}
                    disabled={missionPath.length < 2 || executingMission}
                    style={{
                        padding: '1rem 2rem',
                        background: 'var(--accent-blue)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        marginRight: '1rem',
                        opacity: missionPath.length < 2 ? 0.5 : 1
                    }}
                >
                    🚀 Execute Mission
                </button>
                <button
                    onClick={clearMission}
                    style={{
                        padding: '1rem 2rem',
                        background: '#f8f9fa',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        cursor: 'pointer'
                    }}
                >
                    🗑️ Clear
                </button>
            </div>

            <svg
                width="600"
                height="400"
                style={{
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    cursor: 'crosshair',
                    display: 'block',
                    margin: '0 auto'
                }}
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    addMissionPoint(x, y);
                }}
            >
                {/* Grid */}
                {[...Array(12)].map((_, i) => (
                    <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="400" stroke="#ddd" strokeWidth="1" />
                ))}
                {[...Array(8)].map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} stroke="#ddd" strokeWidth="1" />
                ))}

                {/* Path */}
                {missionPath.map((point, idx) => (
                    <g key={idx}>
                        <circle cx={point.x} cy={point.y} r="8" fill="var(--accent-blue)" />
                        {idx > 0 && (
                            <line
                                x1={missionPath[idx - 1].x}
                                y1={missionPath[idx - 1].y}
                                x2={point.x}
                                y2={point.y}
                                stroke="var(--accent-blue)"
                                strokeWidth="3"
                                markerEnd="url(#arrowhead)"
                            />
                        )}
                    </g>
                ))}

                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="var(--accent-blue)" />
                    </marker>
                </defs>
            </svg>
        </div>
    );
}

export default MissionPlanner;

