// frontend/src/components/Navbar.jsx 

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const { token, role, username, logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">🏥 Clinical Protocol Query System</div>
            <div className="navbar-links">
                {token ? (
                    <>
                        <span className="navbar-user">Hello, {username}</span>
                        <Link to="/">Chat</Link>
                        {role === 'admin' && <Link to="/admin">Admin Panel</Link>}
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    )
}