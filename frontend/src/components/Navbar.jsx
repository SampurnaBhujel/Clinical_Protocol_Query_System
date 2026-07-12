// frontend/src/components/Navbar.jsx
import { useEffect, useState, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';
import logo from "../assets/logo.png";

export default function Navbar() {
    const { token, role, username, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const lastScrollY = useRef(0);
    const scrollThreshold = 8; 

    // Helper function to extract initials (e.g., "avi" -> "AV", "John Doe" -> "JD")
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(/\s+/);
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 15) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }

            if (Math.abs(currentScrollY - lastScrollY.current) < scrollThreshold) {
                return;
            }

            if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
                setHidden(true);
            } else {
                setHidden(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    function handleLogout() {
        logout();
        navigate('/login');
    }

    const headerStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        zIndex: 1000,
        background: scrolled ? 'var(--surface, #ffffff)' : 'rgba(255, 255, 255, 0.01)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: '1px solid var(--border, #e2e8f0)',
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.2s var(--ease), background-color 0.2s var(--ease), border-color 0.2s var(--ease)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        boxSizing: 'border-box'
    };

    const navStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto'
    };

    const leftGroupStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '32px'
    };

    const rightGroupStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '18px'
    };

    const getNavLinkStyle = (isActive) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        textDecoration: 'none',
        fontSize: '0.875rem',
        fontWeight: isActive ? '600' : '500',
        color: isActive ? 'var(--primary, #0d9488)' : 'var(--muted, #475569)',
        padding: '6px 0',
        transition: 'color 0.15s var(--ease)'
    });

    const actionButtonStyle = {
        background: 'none',
        border: 'none',
        padding: '6px',
        cursor: 'pointer',
        color: 'var(--text, #0f172a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        transition: 'background-color 0.15s var(--ease), color 0.15s var(--ease)'
    };

    return (
        <header style={headerStyle}>
            <nav style={navStyle} aria-label="Primary navigation">
                
                {/* Left Side: Brand Logo + Primary Directory */}
                <div style={leftGroupStyle}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', paddingRight: '4px' }}>
                        <img src={logo} alt="SwasthAI Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <NavLink to="/" style={({ isActive }) => getNavLinkStyle(isActive)}>
                            <Icon name="home" size={15} />
                            Home
                        </NavLink>

                        {token && (
                            <>
                                <NavLink to="/chat" style={({ isActive }) => getNavLinkStyle(isActive)}>
                                    <Icon name="messageCircle" size={15} />
                                    Chat
                                </NavLink>
                                
                                {role === 'admin' && (
                                    <NavLink to="/admin" style={({ isActive }) => getNavLinkStyle(isActive)}>
                                        <Icon name="shield" size={15} />
                                        Admin
                                    </NavLink>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right Side: Theme Engine & Dynamic Initials Avatar Profile */}
                <div style={rightGroupStyle}>
                    {token ? (
                        <>
                            {/* Theme Control */}
                            <button 
                                style={actionButtonStyle} 
                                type="button" 
                                onClick={toggleTheme} 
                                title="Toggle Theme"
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-muted, #f1f5f9)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <Icon name={theme === 'light' ? 'moon' : 'sun'} size={15} style={{ color: 'var(--muted, #475569)' }} />
                            </button>

                            <div style={{ height: '14px', width: '1px', background: 'var(--border, #e2e8f0)' }} />

                            {/* Minimal Dynamic User Circle Avatar */}
                            <div 
                                title={`Logged in as ${username}`}
                                style={{ 
                                    width: '28px', 
                                    height: '28px', 
                                    borderRadius: '50%', 
                                    background: 'var(--primary, #0d9488)', 
                                    color: '#ffffff',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    letterSpacing: '0.02em',
                                    userSelect: 'none',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
                                {getInitials(username)}
                            </div>

                            {/* Logout Component */}
                            <button 
                                style={{ ...actionButtonStyle, color: 'var(--muted, #475569)', fontSize: '0.875rem', gap: '4px' }} 
                                type="button" 
                                onClick={handleLogout}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--danger-soft, #fef2f2)';
                                    e.currentTarget.style.color = 'var(--danger, #dc2626)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--muted, #475569)';
                                }}
                            >
                                <Icon name="logOut" size={14} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink 
                                to="/login" 
                                style={{ ...getNavLinkStyle(false), color: 'var(--muted, #475569)' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text, #0f172a)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted, #475569)'}
                            >
                                Login
                            </NavLink>
                            <NavLink 
                                to="/register" 
                                style={{
                                    textDecoration: 'none',
                                    fontSize: '0.825rem',
                                    fontWeight: '600',
                                    background: 'var(--primary, #0d9488)',
                                    color: '#ffffff',
                                    padding: '6px 14px',
                                    borderRadius: 'var(--radius, 8px)',
                                    transition: 'background-color 0.15s var(--ease)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-strong, #0f766e)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary, #0d9488)'}
                            >
                                Register
                            </NavLink>

                            <button 
                                style={actionButtonStyle} 
                                type="button" 
                                onClick={toggleTheme} 
                                title="Toggle Theme"
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-muted, #f1f5f9)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <Icon name={theme === 'light' ? 'moon' : 'sun'} size={15} />
                            </button>
                        </>
                    )}
                </div>
            </nav>
            
            <style dangerouslySetInnerHTML={{__html: `
                .left-nav-links a:hover {
                    color: var(--primary, #0d9488) !important;
                }
            `}} />
        </header>
    );
}