
// frontend/src/components/HomePage.jsx
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

// {/* frontend/src/pages/HomePage.jsx */ }

// import { Link } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import Icon from '../components/Icon'

// const highlights = [
//     ['Guideline-grounded answers', 'Searches indexed clinical PDFs instead of relying on open-ended chat.'],
//     ['Nepali and English support', 'Patients can ask naturally in Nepali, English, or mixed language.'],
//     ['Human-care disclaimer', 'Every response reminds users to consult qualified medical professionals.']
// ]


export default function HomePage() {
    const { token } = useAuth();
    
    const startPath = useMemo(() => {
        return token ? '/chat' : '/register';
    }, [token]);

    const [streamedText, setStreamedText] = useState('');

    const simulatedProtocolOutput = "According to standard medical guidelines: 1. Give fluids as needed. 2. Check temperature. Refer to the official guide details below.";

    useEffect(() => {
        let textCharPointer = 0;
        const typingDelayTimer = setInterval(() => {
            setStreamedText((currentSnippet) => currentSnippet + simulatedProtocolOutput.charAt(textCharPointer));
            textCharPointer++;
            if (textCharPointer >= simulatedProtocolOutput.length) {
                clearInterval(typingDelayTimer);
            }
        }, 15);

        return () => clearInterval(typingDelayTimer);
    }, []);

    // Layout Architecture Styles using Global CSS Tokens
    const pageStyle = {
        background: 'linear-gradient(180deg, var(--bg, #f8fafc) 0%, var(--surface, #ffffff) 100%)',
        color: 'var(--text, #0f172a)',
        fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '80px 24px 60px 24px',
        boxSizing: 'border-box',
        position: 'relative',
        transition: 'background 0.2s var(--ease), color 0.2s var(--ease)'
    };

    const sectionWrapperStyle = {
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        zIndex: 2
    };

    const heroGridStyle = {
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '64px',
        alignItems: 'center',
        marginBottom: '96px'
    };

    const badgeStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--primary-soft, #f0fdfa)',
        color: 'var(--primary, #0d9488)',
        fontSize: '0.75rem',
        fontWeight: '600',
        padding: '6px 14px',
        borderRadius: '30px',
        letterSpacing: '0.03em',
        width: 'fit-content',
        marginBottom: '28px',
        border: '1px solid var(--primary, #0d9488)',
        opacity: 0.8
    };

    const headingStyle = {
        fontFamily: 'var(--font-display, sans-serif)',
        fontSize: '3rem',
        fontWeight: '800',
        lineHeight: '1.2',
        margin: '0 0 20px 0',
        letterSpacing: '-0.02em',
        color: 'var(--text, #0f172a)'
    };

    const descriptionStyle = {
        fontSize: '1.05rem',
        lineHeight: '1.65',
        color: 'var(--muted, #475569)',
        margin: '0 0 36px 0',
        maxWidth: '500px'
    };

    const ctaButtonStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        background: 'var(--primary, #0d9488)',
        color: '#ffffff',
        fontSize: '0.9rem',
        fontWeight: '600',
        padding: '14px 28px',
        borderRadius: '8px',
        transition: 'transform 0.2s var(--ease), background-color 0.2s var(--ease)',
        boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)'
    };

    const panelStyle = {
        background: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: '16px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        transition: 'background-color 0.2s var(--ease), border-color 0.2s var(--ease)'
    };

    const featureGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '32px',
        borderTop: '1px solid var(--border, #e2e8f0)',
        paddingTop: '56px'
    };

    const featureCardStyle = {
        background: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: '12px',
        padding: '24px',
        transition: 'transform 0.2s var(--ease), box-shadow 0.2s var(--ease), border-color 0.2s var(--ease)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
    };

    return (
        <main style={pageStyle}>
            {/* Theme-aware background mesh lighting */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.6, pointerEvents: 'none', background: 'radial-gradient(circle at 80% 20%, var(--primary-soft, #f0fdfa) 0%, transparent 40%)', zIndex: 1 }} />
            
            <div style={sectionWrapperStyle}>
                
                {/* Hero Section */}
                <div style={heroGridStyle} className="home-hero-grid">
                    
                    {/* Left text column */}
                    <div>
                        <div style={badgeStyle}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary, #0d9488)' }} />
                            SwasthAI Platform Active
                        </div>
                        
                        <h1 style={headingStyle}>
                            Find medical guidelines <br />
                            <span style={{ color: 'var(--primary, #0d9488)' }}>backed by original sources.</span>
                        </h1>
                        
                        <p style={descriptionStyle}>
                            Search and look up local healthcare rules quickly. Get clear answers taken directly from official medical documents in Nepal.
                        </p>
                        
                        <div>
                            <Link 
                                to={startPath} 
                                className="cta-button-hover"
                                style={ctaButtonStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--primary-strong, #0f766e)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--primary, #0d9488)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <span>{token ? 'Open Workspace' : 'Start Now'}</span>
                                <Icon name="arrowRight" size={15} />
                            </Link>
                        </div>
                    </div>

                    {/* Right interactive instrument preview */}
                    <div style={panelStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border, #e2e8f0)', paddingBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted, #64748b)', letterSpacing: '0.05em' }}>
                                <Icon name="heartPulse" size={13} style={{ color: 'var(--primary, #0d9488)' }} />
                                LIVE PREVIEW INTERFACE
                            </div>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success, #22c55e)' }} />
                        </div>

                        {/* Question Input Box */}
                        <div style={{ background: 'var(--bg, #f8fafc)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border, #e2e8f0)' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--primary, #0d9488)', marginBottom: '6px', letterSpacing: '0.02em' }}>USER QUESTION</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text, #1e293b)' }}>बच्चालाई ज्वरो आएमा के गर्ने?</div>
                        </div>

                        {/* Answer Output Box */}
                        <div style={{ background: 'var(--bg, #f8fafc)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--muted, #64748b)', letterSpacing: '0.02em' }}>VERIFIED RESPONSE</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--muted, #475569)', background: 'var(--surface, #ffffff)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border, #e2e8f0)', fontWeight: '500' }}>
                                    <Icon name="fileText" size={11} style={{ color: 'var(--muted, #64748b)' }} />
                                    IMCI_Core.pdf
                                </span>
                            </div>
                            <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text, #334155)', margin: 0, minHeight: '48px' }}>
                                {streamedText}
                                <span className="text-cursor-blink" style={{ display: 'inline-block', width: '2px', height: '12px', background: 'var(--primary, #0d9488)', marginLeft: '3px', verticalAlign: 'middle' }} />
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lower Features Section */}
                <div style={featureGridStyle} className="home-feature-grid">
                    
                    {/* Feature 1 */}
                    <div style={featureCardStyle} className="feature-card-hover">
                        <div style={{ background: 'var(--primary-soft, #f0fdfa)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid var(--border, #e2e8f0)' }}>
                            <Icon name="shield" size={18} style={{ color: 'var(--primary, #0d9488)' }} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text, #1e293b)', margin: '0 0 8px 0' }}>Safe Answers</h3>
                        <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: 'var(--muted, #64748b)', margin: 0 }}>
                            Replies are tied directly to loaded reference files to ensure clinical guidelines are strictly met without guessing.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div style={featureCardStyle} className="feature-card-hover">
                        <div style={{ background: 'var(--primary-soft, #f0fdfa)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid var(--border, #e2e8f0)' }}>
                            <Icon name="messageCircle" size={18} style={{ color: 'var(--primary, #0d9488)' }} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text, #1e293b)', margin: '0 0 8px 0' }}>Bilingual Support</h3>
                        <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: 'var(--muted, #64748b)', margin: 0 }}>
                            Easily submit clinical questions in English, native Nepali script syntax, or mixed hybrid configurations.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div style={featureCardStyle} className="feature-card-hover">
                        <div style={{ background: 'var(--primary-soft, #f0fdfa)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid var(--border, #e2e8f0)' }}>
                            <Icon name="heartPulse" size={18} style={{ color: 'var(--primary, #0d9488)' }} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text, #1e293b)', margin: '0 0 8px 0' }}>Decision Support</h3>
                        <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: 'var(--muted, #64748b)', margin: 0 }}>
                            An intuitive secondary helper interface tailored explicitly to make checking medical protocols seamless.
                        </p>
                    </div>

                </div>

            </div>

            {/* Global Keyframe CSS Animations & Interactive States */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes cursorBlink {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 1; }
                }
                .text-cursor-blink {
                    animation: cursorBlink 0.8s infinite;
                }
                .feature-card-hover:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
                    border-color: var(--primary, #0d9488) !important;
                }
                @media (max-width: 960px) {
                    .home-hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; margin-bottom: 64px !important; }
                    .home-feature-grid { grid-template-columns: 1fr !important; gap: 20px !important; padding-top: 40px !important; }
                }
            `}} />
        </main>
    );
}