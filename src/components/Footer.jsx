import { useEffect, useState } from 'react';

const Footer = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            <style>{`
                .footer-mw {
                    background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
                    position: relative;
                    overflow: hidden;
                    padding-top: 5rem;
                    padding-bottom: 2rem;
                }
                
                .social-link {
                    width: 45px;
                    height: 45px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }

                .social-link:hover {
                    transform: translateY(-5px) scale(1.1);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2) !important;
                }

                .footer-links a {
                    text-decoration: none;
                    color: #6c757d;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 1rem;
                }

                .footer-links a:hover {
                    color: #0d6efd !important;
                    transform: translateX(5px);
                }

                .contact-card {
                    background: white;
                    padding: 15px 20px;
                    border-radius: 14px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
                    transition: all 0.3s ease;
                    text-decoration: none;
                    display: block;
                    margin-bottom: 1rem;
                }

                .contact-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12) !important;
                }

                #backToTop {
                    position: fixed;
                    bottom: 40px;
                    right: 40px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    z-index: 1000;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
                    color: white;
                    box-shadow: 0 10px 25px rgba(13, 110, 253, 0.3);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    opacity: ${isVisible ? 1 : 0};
                    visibility: ${isVisible ? 'visible' : 'hidden'};
                    transform: ${isVisible ? 'translateY(0)' : 'translateY(20px)'};
                }

                #backToTop:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(13, 110, 253, 0.4);
                }
            `}</style>

            <footer className="footer-mw">
                {/* Decorative Background Elements */}
                <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(13, 110, 253, 0.05) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', bottom: '-150px', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255, 102, 0, 0.04) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="row g-5 mb-5">
                        {/* Brand & About */}
                        <div className="col-lg-4">
                            <div className="mb-4">
                                <a className="navbar-brand mb-3 d-block" href="/" style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #0d6efd, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                    MAKERWORKS
                                </a>
                                <p className="text-muted mb-4" style={{ lineHeight: 1.8, fontSize: '1rem' }}>
                                    Mumbai's premier engineering lab for young minds aged 8-17. We transform curiosity into innovation through hands-on robotics, coding, and STEM education.
                                </p>
                            </div>

                            {/* Stats Mini */}
                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <div style={{ background: 'white', padding: '15px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                                        <h4 className="fw-bold mb-0" style={{ color: '#0d6efd', fontSize: '1.5rem' }}>12+</h4>
                                        <p className="text-muted small mb-0">Awards</p>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div style={{ background: 'white', padding: '15px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                                        <h4 className="fw-bold mb-0" style={{ color: '#ff6600', fontSize: '1.5rem' }}>50+</h4>
                                        <p className="text-muted small mb-0">Students</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div>
                                <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#495057' }}>Connect With Us</h6>
                                <div className="d-flex gap-3">
                                    <a href="https://x.com/makerworkslab" className="social-link" target="_blank" rel="noopener" style={{ background: 'linear-gradient(135deg, #1DA1F2, #0d8bd9)', boxShadow: '0 4px 12px rgba(29, 161, 242, 0.3)' }}>
                                        <i className="fa-brands fa-x-twitter" style={{ fontSize: '1.2rem' }}></i>
                                    </a>
                                    <a href="https://www.instagram.com/makerworkslab" className="social-link" target="_blank" rel="noopener" style={{ background: 'linear-gradient(135deg, #E1306C, #C13584)', boxShadow: '0 4px 12px rgba(225, 48, 108, 0.3)' }}>
                                        <i className="fa-brands fa-instagram" style={{ fontSize: '1.2rem' }}></i>
                                    </a>
                                    <a href="https://www.linkedin.com/company/makerworkslab/" className="social-link" target="_blank" rel="noopener" style={{ background: 'linear-gradient(135deg, #0077B5, #005885)', boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)' }}>
                                        <i className="fa-brands fa-linkedin-in" style={{ fontSize: '1.2rem' }}></i>
                                    </a>
                                    <a href="https://www.youtube.com/@MakerWorksLab" className="social-link" target="_blank" rel="noopener" style={{ background: 'linear-gradient(135deg, #FF0000, #CC0000)', boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)' }}>
                                        <i className="fa-brands fa-youtube" style={{ fontSize: '1.2rem' }}></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Programs */}
                        <div className="col-lg-2">
                            <h6 className="fw-bold mb-4" style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#212529' }}>Programs</h6>
                            <ul className="list-unstyled footer-links">
                                <li><a href="/programs/beginner/"><i className="bi bi-lightbulb" style={{ color: '#0d6efd' }}></i> Beginner Level</a></li>
                                <li><a href="/programs/intermediate/"><i className="bi bi-gear" style={{ color: '#0d6efd' }}></i> Intermediate</a></li>
                                <li><a href="/programs/advanced/"><i className="bi bi-rocket" style={{ color: '#0d6efd' }}></i> Advanced Level</a></li>
                                <li><a href="/programs/robotics/"><i className="bi bi-robot" style={{ color: '#ff6600' }}></i> VEX Robotics</a></li>
                                <li><a href="/programs/ai/"><i className="bi bi-stars" style={{ color: '#6f42c1' }}></i> AI & ML Labs</a></li>
                            </ul>
                        </div>

                        {/* Quick Links */}
                        <div className="col-lg-2">
                            <h6 className="fw-bold mb-4" style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#212529' }}>Resources</h6>
                            <ul className="list-unstyled footer-links">
                                <li><a href="/about/"><i className="bi bi-arrow-right-short" style={{ color: '#0d6efd' }}></i> About Us</a></li>
                                <li><a href="/projects/"><i className="bi bi-arrow-right-short" style={{ color: '#0d6efd' }}></i> Projects</a></li>
                                <li><a href="/gallery/"><i className="bi bi-arrow-right-short" style={{ color: '#0d6efd' }}></i> Gallery</a></li>
                                <li><a href="/blog/"><i className="bi bi-arrow-right-short" style={{ color: '#0d6efd' }}></i> Blog</a></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="col-lg-4">
                            <h6 className="fw-bold mb-4" style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#212529' }}>Get In Touch</h6>
                            <a href="tel:+919137114223" className="contact-card" style={{ borderLeft: '4px solid #0d6efd' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(13, 110, 253, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-telephone-fill" style={{ color: '#0d6efd' }}></i>
                                    </div>
                                    <div>
                                        <p className="mb-0 small text-muted">Call Us</p>
                                        <p className="mb-0 fw-bold">+91 9137114223</p>
                                    </div>
                                </div>
                            </a>
                            <a href="mailto:makerworkslab@gmail.com" className="contact-card" style={{ borderLeft: '4px solid #ff6600' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(255, 102, 0, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-envelope-fill" style={{ color: '#ff6600' }}></i>
                                    </div>
                                    <div>
                                        <p className="mb-0 small text-muted">Email Us</p>
                                        <p className="mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>makerworkslab@gmail.com</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="row mb-5">
                        <div className="col-12">
                            <div style={{ background: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <i className="bi bi-map-fill" style={{ color: '#0d6efd', fontSize: '1.3rem' }}></i>
                                    <h6 className="mb-0 fw-bold">Find Us on Map</h6>
                                </div>
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.48956725636!2d72.85801937497995!3d19.173807982050995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b796cadb56b5%3A0x68b4a7a75e5170e7!2sMakerWorks%20%7C%20Robotics%20%26%20Programing%20Classes%20for%20Kids!5e0!3m2!1sen!2sin!4v1756369570774!5m2!1sen!2sin"
                                    width="100%" height="200" style={{ border: 0, borderRadius: '16px' }} allowFullScreen="" loading="lazy"></iframe>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="border-top pt-4">
                        <div className="row align-items-center">
                            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                                <p className="mb-0 text-muted small">© 2025 MakerWorks Lab. All Rights Reserved.</p>
                            </div>
                            <div className="col-md-6 text-center text-md-end">
                                <div className="d-inline-flex gap-3">
                                    <a href="/privacy-policy/" className="text-muted small text-decoration-none">Privacy Policy</a>
                                    <span className="text-muted">•</span>
                                    <a href="/terms/" className="text-muted small text-decoration-none">Terms</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    id="backToTop"
                    onClick={scrollToTop}
                    title="Back to Top"
                >
                    <i className="bi bi-arrow-up-short" style={{ fontSize: '2rem' }}></i>
                </button>
            </footer >
        </>
    );
};

export default Footer;
