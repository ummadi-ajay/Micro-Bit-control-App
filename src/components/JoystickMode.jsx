import React from 'react';

function JoystickMode({
    active,
    joystickRef,
    joystickDragging,
    joystickPos,
    handleJoystickMove,
    handleJoystickEnd
}) {
    if (!active) return null;

    return (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Virtual Joystick</h2>

            <div
                ref={joystickRef}
                style={{
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: '#f8f9fa',
                    margin: '0 auto',
                    position: 'relative',
                    border: '2px solid var(--border-color)',
                    cursor: 'grab'
                }}
                onMouseDown={(e) => {
                    joystickDragging.current = true;
                    handleJoystickMove(e.clientX, e.clientY);
                }}
                onMouseMove={(e) => {
                    if (joystickDragging.current) handleJoystickMove(e.clientX, e.clientY);
                }}
                onMouseUp={handleJoystickEnd}
                onMouseLeave={handleJoystickEnd}
                onTouchStart={(e) => {
                    joystickDragging.current = true;
                    const touch = e.touches[0];
                    handleJoystickMove(touch.clientX, touch.clientY);
                }}
                onTouchMove={(e) => {
                    if (joystickDragging.current) {
                        const touch = e.touches[0];
                        handleJoystickMove(touch.clientX, touch.clientY);
                    }
                }}
                onTouchEnd={handleJoystickEnd}
            >
                <div style={{
                    position: 'absolute',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'var(--accent-blue)',
                    top: '50%',
                    left: '50%',
                    transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
                    transition: joystickDragging.current ? 'none' : 'transform 0.2s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }} />
            </div>
        </div>
    );
}

export default JoystickMode;

