// frontend/src/components/Navbar.jsx
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Icon from './Icon'

export default function Navbar() {
    const { token, role, username, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <header className="site-header">
            <nav className="navbar" aria-label="Primary navigation">
                <Link to="/" className="brand">
                    <span className="brand-mark" aria-hidden="true">
                        <Icon name="heartPulse" size={22} />
                    </span>
                    <span>
                        <strong>स्वास्थ्य सहायक</strong>
                        <small>Clinical Protocol RAG</small>
                    </span>
                </Link>

                <div className="nav-actions">
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <Icon name="home" size={17} />
                        Home
                    </NavLink>

                    {token ? (
                        <>
                            <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <Icon name="messageCircle" size={17} />
                                User
                            </NavLink>
                            {role === 'admin' && (
                                <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                    <Icon name="shield" size={17} />
                                    Admin
                                </NavLink>
                            )}
                            <span className="user-pill">
                                <Icon name="user" size={16} />
                                {username}
                            </span>
                            <button className="icon-button" type="button" onClick={toggleTheme} title="Toggle theme">
                                <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
                            </button>
                            <button className="button secondary compact" type="button" onClick={handleLogout}>
                                <Icon name="logOut" size={17} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="icon-button" type="button" onClick={toggleTheme} title="Toggle theme">
                                <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
                            </button>
                            <NavLink to="/login" className="button ghost compact">
                                <Icon name="logIn" size={17} />
                                Login
                            </NavLink>
                            <NavLink to="/register" className="button primary compact">
                                <Icon name="user" size={17} />
                                Register
                            </NavLink>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}
