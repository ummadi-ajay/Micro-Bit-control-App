import { useState, useEffect } from 'react';

const Navbar = ({ isConnected, connect, disconnect, onShowSidebar }) => {
    const [isFloating, setIsFloating] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsFloating(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <style>{`
                .navbar-nexus {
                    background: ${isFloating ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)'};
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    padding: ${isFloating ? '0.75rem 2rem' : '1.2rem 2rem'};
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 2000;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .nav-brand-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                }

                .nav-brand-icon {
                    font-size: 1.8rem;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
                }

                .nav-brand-text {
                    display: flex;
                    flex-direction: column;
                }

                .nav-brand-name {
                    font-family: 'Outfit', sans-serif;
                    font-weight: 800;
                    font-size: 1.4rem;
                    color: #1d1d1f;
                    line-height: 1;
                    letter-spacing: -0.02em;
                }

                .nav-brand-name span {
                    color: var(--accent-blue);
                }

                .nav-brand-tag {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: var(--accent-purple);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-top: 2px;
                }

                .nav-actions-mw {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .btn-connect-nexus {
                    background: ${isConnected ? 'var(--accent-green)' : 'var(--accent-blue)'};
                    color: white;
                    border: none;
                    padding: 0.7rem 1.4rem;
                    border-radius: 50px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px ${isConnected ? 'rgba(52, 199, 89, 0.2)' : 'rgba(0, 113, 227, 0.2)'};
                    cursor: pointer;
                }

                .btn-connect-nexus:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.05);
                    box-shadow: 0 6px 16px ${isConnected ? 'rgba(52, 199, 89, 0.3)' : 'rgba(0, 113, 227, 0.3)'};
                }

                .btn-settings-nexus {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: #f5f5f7;
                    border: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 1.2rem;
                }

                .btn-settings-nexus:hover {
                    background: #e8e8ed;
                    transform: rotate(30deg);
                }


                @media (max-width: 600px) {
                    .navbar-nexus {
                        padding: 0.8rem 1.2rem;
                    }
                    .nav-brand-name {
                        font-size: 1.1rem;
                    }
                    .nav-brand-tag {
                        font-size: 0.55rem;
                    }
                    .btn-connect-nexus span {
                        display: none;
                    }
                    .btn-connect-nexus {
                        padding: 0.7rem;
                        width: 42px;
                        height: 42px;
                        justify-content: center;
                    }
                }
            `}</style>

            <nav className={`navbar-nexus ${isFloating ? 'floating' : ''}`}>
                <a href="/" className="nav-brand-container">
                    <span className="nav-brand-icon">🤖</span>
                    <div className="nav-brand-text">
                        <div className="nav-brand-name">Nexus<span>Control</span></div>
                        <div className="nav-brand-tag">Micro:bit Edition</div>
                    </div>
                </a>

                <div className="nav-actions-mw">
                    <button
                        onClick={isConnected ? disconnect : connect}
                        className="btn-connect-nexus"
                    >
                        <i className={`bi ${isConnected ? 'bi-bluetooth' : 'bi-cpu-fill'}`}></i>
                        <span>{isConnected ? 'Connected' : 'Connect Device'}</span>
                    </button>

                    <button onClick={onShowSidebar} className="btn-settings-nexus">
                        <i className="bi bi-gear-fill"></i>
                    </button>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
