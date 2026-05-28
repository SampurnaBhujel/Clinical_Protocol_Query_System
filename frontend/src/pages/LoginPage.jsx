// frontend/src/pages/LoginPage.jsx

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleLogin() {
        if (!username.trim() || !password.trim()) {
            setError('Please fill in all fields')
            return
        }
        setLoading(true)
        setError('')
        try {
            const formData = new URLSearchParams()
            formData.append('username', username)
            formData.append('password', password)

            const res = await axiosClient.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            // replaced below with above all lines inside try                    
            //const res = await axiosClient.post('/auth/login', { username, password })


            const token = res.data.access_token
            // Decode JWT to extract role and username without an extra API call
            const decoded = jwtDecode(token)
            login(token, decoded.role, decoded.sub)
            // Redirect based on role
            navigate(decoded.role === 'admin' ? '/admin' : '/')
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid username or password')
        } finally {
            setLoading(false)
        }
    }

    // Allow submitting with Enter key
    function handleKeyDown(e) {
        if (e.key === 'Enter') handleLogin()
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <h2>Login</h2>
                {error && <p className="error-msg">{error}</p>}
                <input
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={handleLogin} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <p className="auth-link">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    )
}