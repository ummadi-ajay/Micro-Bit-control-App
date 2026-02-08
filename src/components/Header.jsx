const Header = ({ isConnected, connect, disconnect, onShowSidebar }) => {
    return (
        <header>
            <div className="brand">
                <span className="brand-icon">🤖</span>
                <h1>Nexus<span>Control</span> <span style={{ fontSize: '0.6rem', color: 'var(--accent-purple)', background: 'rgba(155, 81, 224, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>MICRO:BIT EDITION</span></h1>
            </div>
            <div className="nav-actions">
                <button
                    onClick={isConnected ? disconnect : connect}
                    className={`btn-connect ${isConnected ? 'online' : ''}`}
                >
                    <span className="label">{isConnected ? 'Live Connected' : 'Connect Device'}</span>
                </button>
                <button onClick={onShowSidebar} className="icon-setting">⚙️</button>
            </div>
        </header>
    );
};

export default Header;
