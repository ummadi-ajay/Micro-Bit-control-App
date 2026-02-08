import { useState, useEffect } from 'react';

const Navbar = ({ isConnected, connect, disconnect, onShowSidebar }) => {
    const [isFloating, setIsFloating] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsFloating(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <style>{`
                /* Ultra-Premium Navbar 3.0 */
                :root {
                    --nav-glass-bg: rgba(255, 255, 255, 0.85);
                    --nav-glass-scrolled: rgba(255, 255, 255, 0.98);
                    --nav-border: 1px solid rgba(255, 255, 255, 0.4);
                    --primary-gradient: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
                    --text-gradient: linear-gradient(90deg, #0d6efd, #00d4ff);
                }

                .navbar-ultra {
                    background: var(--nav-glass-bg);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    padding-top: 1.2rem;
                    padding-bottom: 1.2rem;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1030;
                }

                .navbar-ultra::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: linear-gradient(90deg, #0d6efd, #00d4ff, #6610f2, #ff0055, #0d6efd);
                    background-size: 300% 100%;
                    animation: gradientMove 8s linear infinite;
                    opacity: 0;
                    transition: opacity 0.4s ease;
                }

                .navbar-ultra:hover::after,
                .navbar-ultra.floating::after {
                    opacity: 1;
                }

                @keyframes gradientMove {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 100% 0%; }
                }

                .navbar-ultra.floating {
                    padding-top: 0.7rem;
                    padding-bottom: 0.7rem;
                    background: var(--nav-glass-scrolled);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                }

                .navbar-brand span {
                    color: #000000;
                    font-weight: 800;
                    font-family: 'Outfit', sans-serif;
                    letter-spacing: -0.02em;
                    font-size: 1.6rem;
                }

                .nav-link {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    color: #555 !important;
                    font-weight: 600;
                    font-size: 0.95rem;
                    padding: 0.6rem 1.1rem !important;
                    border-radius: 50px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    position: relative;
                    overflow: hidden;
                }

                .nav-link:hover,
                .nav-link.active {
                    color: #0d6efd !important;
                    background: rgba(13, 110, 253, 0.04);
                }

                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: 5px;
                    left: 50%;
                    width: 0%;
                    height: 2px;
                    background: var(--primary-gradient);
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                    border-radius: 2px;
                }

                .nav-link:hover::after {
                    width: 20px;
                }

                .nav-link i {
                    font-size: 1.1em;
                    background: var(--primary-gradient);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    opacity: 0.7;
                    transition: all 0.3s;
                }

                .nav-link:hover i {
                    opacity: 1;
                    transform: scale(1.1);
                }

                .dropdown-menu {
                    border: none;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.12);
                    padding: 1rem;
                    margin-top: 20px !important;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(25px);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    min-width: 260px;
                }

                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(15px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .dropdown-item {
                    border-radius: 12px;
                    padding: 0.8rem 1rem;
                    font-weight: 500;
                    color: #4b5563;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.3s;
                    margin-bottom: 2px;
                }

                .dropdown-item i {
                    font-size: 1.2rem;
                    color: #9ca3af;
                    transition: all 0.3s;
                    background: #f3f4f6;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                }

                .dropdown-item:hover {
                    background: white;
                    color: #0d6efd;
                    transform: translateX(4px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }

                .dropdown-item:hover i {
                    color: white;
                    background: var(--primary-gradient);
                }

                .btn-shine {
                    position: relative;
                    background: var(--primary-gradient);
                    color: white !important;
                    font-weight: 700;
                    border-radius: 100px;
                    padding: 0.8rem 2.2rem !important;
                    overflow: hidden;
                    border: none;
                    box-shadow: 0 8px 20px rgba(13, 110, 253, 0.3);
                    transition: all 0.3s;
                    z-index: 1;
                }

                .btn-shine::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 200%;
                    height: 100%;
                    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                    transition: 0.6s;
                    z-index: -1;
                }

                .btn-shine:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px rgba(13, 110, 253, 0.4);
                }

                .btn-shine:hover::before {
                    left: 100%;
                }

                .btn-connect-mw {
                    background: ${isConnected ? '#34c759' : 'var(--primary-gradient)'};
                    border: none;
                    color: white;
                    padding: 0.8rem 1.5rem;
                    border-radius: 50px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px ${isConnected ? 'rgba(52, 199, 89, 0.3)' : 'rgba(13, 110, 253, 0.3)'};
                }

                .btn-connect-mw:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.1);
                }

                .menu-toggler {
                    border: none;
                    background: white;
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
                }

                .menu-toggler span {
                    display: block;
                    width: 22px;
                    height: 2px;
                    background: #333;
                    transition: all 0.3s ease;
                    border-radius: 4px;
                }

                @media (max-width: 991px) {
                    .navbar-collapse {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(255, 255, 255, 0.98);
                        backdrop-filter: blur(20px);
                        padding-top: 100px;
                        padding-bottom: 2rem;
                        padding-left: 2rem;
                        padding-right: 2rem;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: start;
                        gap: 1.5rem;
                        transform: translateY(-100%);
                        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                        height: 100vh;
                        overflow-y: auto;
                        z-index: 1020;
                    }

                    .navbar-collapse.show {
                        transform: translateY(0);
                    }
                    
                    .nav-item {
                        width: 100%;
                    }
                }
            `}</style>

            <nav className={`navbar navbar-expand-lg navbar-ultra ${isFloating ? 'floating' : ''}`} id="mainNav">
                <div className="container-fluid px-lg-5">
                    <a className="navbar-brand" href="/">
                        <span>MAKERWORKS</span>
                    </a>

                    <div className="d-flex align-items-center gap-3 order-lg-3">
                        <button
                            onClick={isConnected ? disconnect : connect}
                            className="btn-connect-mw d-none d-sm-flex"
                        >
                            <i className={`bi ${isConnected ? 'bi-bluetooth text-white' : 'bi-cpu'}`}></i>
                            <span>{isConnected ? 'Connected' : 'Connect'}</span>
                        </button>

                        <button onClick={onShowSidebar} className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <i className="bi bi-gear-fill text-dark"></i>
                        </button>

                        <button className="navbar-toggler menu-toggler d-lg-none" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarMain" aria-controls="navbarMain" aria-expanded="false"
                            aria-label="Toggle navigation">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>

                    <div className="collapse navbar-collapse justify-content-end mt-4 mt-lg-0" id="navbarMain">
                        <ul className="navbar-nav gap-1 align-items-lg-center">
                            <li className="nav-item">
                                <a className="nav-link" href="/about/">
                                    <i className="bi bi-info-circle-fill"></i> About
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/learn/">
                                    <i className="bi bi-book-half"></i> Learn
                                </a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link" href="/makers/">
                                    <i className="bi bi-people-fill"></i> Makers
                                </a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link" href="/projects/">
                                    <i className="bi bi-kanban-fill"></i> Projects
                                </a>
                            </li>

                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                                    aria-expanded="false">
                                    <i className="bi bi-mortarboard-fill"></i> Programs
                                </a>
                                <ul className="dropdown-menu">
                                    <li>
                                        <a className="dropdown-item" href="/programs/beginner/">
                                            <i className="bi bi-1-circle-fill"></i>
                                            <span>Beginner Level<br /><small className="text-muted fw-normal"
                                                style={{ fontSize: '0.75rem' }}>Start your journey</small></span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="dropdown-item" href="/programs/intermediate/">
                                            <i className="bi bi-2-circle-fill"></i>
                                            <span>Intermediate<br /><small className="text-muted fw-normal"
                                                style={{ fontSize: '0.75rem' }}>Level up skills</small></span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="dropdown-item" href="/programs/advanced/">
                                            <i className="bi bi-3-circle-fill"></i>
                                            <span>Advanced<br /><small className="text-muted fw-normal"
                                                style={{ fontSize: '0.75rem' }}>Mastery course</small></span>
                                        </a>
                                    </li>
                                </ul>
                            </li>

                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                                    aria-expanded="false">
                                    <i className="bi bi-trophy-fill"></i> Competitions
                                </a>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="/competetions/wro/"><i className="bi bi-robot"></i> WRO</a></li>
                                    <li><a className="dropdown-item" href="/competetions/vex/"><i className="bi bi-cpu"></i> VEX IQ</a></li>
                                    <li><a className="dropdown-item" href="/competetions/coolest/"><i className="bi bi-snow2"></i> Coolest Projects</a></li>
                                    <li><a className="dropdown-item" href="/competetions/nasa/"><i className="bi bi-rocket-takeoff"></i> NASA</a></li>
                                    <li><hr className="dropdown-divider opacity-10 mx-3 my-2" /></li>
                                    <li>
                                        <a className="dropdown-item" href="/competetions/mekathalon/">
                                            <i className="bi bi-star-fill text-warning"></i>
                                            <span className="text-primary fw-bold">Mekathalon</span>
                                        </a>
                                    </li>
                                </ul>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link" href="/blog/">
                                    <i className="bi bi-newspaper"></i> Blog
                                </a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link" href="/gallery/">
                                    <i className="bi bi-images"></i> Gallery
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
