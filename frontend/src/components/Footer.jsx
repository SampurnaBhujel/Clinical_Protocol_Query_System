// frontend/src/components/Footer.jsx
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";
import Icon from '../components/Icon';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerStyle = {
        background: 'var(--surface, #ffffff)',
        borderTop: '1px solid var(--border, #e2e8f0)',
        padding: '32px 16px 20px 16px', /* Left padding matches Navbar (16px) */
        color: 'var(--text, #0f172a)',
        fontFamily: 'var(--font-sans, sans-serif)',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'background-color 0.2s var(--ease), border-color 0.2s var(--ease)'
    };

    const gridStyle = {
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '2fr repeat(3, 1fr)',
        gap: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--border, #e2e8f0)'
    };

    const headingStyle = {
        fontFamily: 'var(--font-display, sans-serif)',
        fontSize: '0.8rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--text, #0f172a)',
        margin: '0 0 12px 0'
    };

    const linkListStyle = {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    };

    const cleanLinkStyle = {
        textDecoration: 'none',
        fontSize: '0.85rem',
        color: 'var(--muted, #475569)',
        transition: 'color 0.15s var(--ease)'
    };

    return (
        <footer style={footerStyle} aria-label="Site Footer">
            <div style={gridStyle}>
                
                {/* Brand Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <img src={logo} alt="Swasth-AI Logo" style={{ height: '26px', width: 'auto', objectFit: 'contain' }} />
                    </Link>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted, #475569)', margin: 0, maxWidth: '280px', lineHeight: '1.4' }}>
                        Checking clinical compliance and health protocols for medical sectors in Nepal.
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success, #16a34a)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted, #475569)', fontWeight: '600', letterSpacing: '0.02em' }}>ONLINE</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <div>
                    <h3 style={headingStyle}>Pages</h3>
                    <ul style={linkListStyle}>
                        <li><Link to="/" className="f-link" style={cleanLinkStyle}>Home</Link></li>
                        <li><Link to="/login" className="f-link" style={cleanLinkStyle}>Login</Link></li>
                        <li><Link to="/register" className="f-link" style={cleanLinkStyle}>Register</Link></li>
                    </ul>
                </div>

                {/* Emergency Actions */}
                <div>
                    <h3 style={headingStyle}>Helplines</h3>
                    <ul style={linkListStyle}>
                        <li>
                            <a href="tel:102" className="f-link" style={{ ...cleanLinkStyle, color: 'var(--danger, #dc2626)', fontWeight: '500' }}>
                                Ambulance (102)
                            </a>
                        </li>
                        <li>
                            <a href="https://mohp.gov.np" target="_blank" rel="noopener noreferrer" className="f-link" style={cleanLinkStyle}>
                                Ministry of Health
                            </a>
                        </li>
                    </ul>
                </div>

                {/* System Specs */}
                <div>
                    <h3 style={headingStyle}>Info</h3>
                    <ul style={{ ...linkListStyle, gap: '6px', fontSize: '0.8rem', color: 'var(--muted, #475569)' }}>
                        <li>Decision Support System</li>
                        <li>Nepal Jurisdiction</li>
                        <li>Secure Data Pipeline</li>
                    </ul>
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ maxWidth: '1440px', margin: '12px auto 0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted, #475569)', margin: 0 }}>
                    &copy; {currentYear} Swasth-AI. All rights reserved.
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted, #475569)', maxWidth: '600px', margin: 0, textAlign: 'right', lineHeight: '1.3' }}>
                    <strong style={{ color: 'var(--warning, #d97706)', fontWeight: '500' }}>Notice:</strong> Secondary tool based on reference files. Not a substitute for professional medical triage.
                </p>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .f-link:hover {
                    color: var(--primary, #0d9488) !important;
                }
                @media (max-width: 768px) {
                    .clinical-footer-wrapper > div:first-child {
                        grid-template-columns: 1fr !important;
                        gap: 24px !important;
                    }
                    .clinical-footer-wrapper p {
                        text-align: left !important;
                    }
                }
            `}} />
        </footer>
    );
}