{/* frontend/src/pages/RegisterPage.jsx */ }

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import Icon from '../components/Icon'

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleRegister(e) {
        e?.preventDefault()
        if (!username.trim() || !email.trim() || !password.trim()) {
            setError('Please complete all fields.')
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')
        try {
            await axiosClient.post('/auth/register', {
                username: username.trim(),
                email: email.trim(),
                password
            })
            setSuccess('Account created. Redirecting to login...')
            setTimeout(() => navigate('/login'), 900)
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-heading">
                    <span className="auth-icon"><Icon name="user" size={22} /></span>
                    <h1>Create Account</h1>
                    <p>Register to ask medical protocol questions safely.</p>
                </div>

                <form className="form-stack" onSubmit={handleRegister}>
                    {error && <p className="alert error">{error}</p>}
                    {success && <p className="alert success">{success}</p>}
                    <label className="field">
                        <span>Username</span>
                        <input
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoComplete="username"
                            autoFocus
                            placeholder="Choose username"
                        />
                    </label>
                    <label className="field">
                        <span>Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="email"
                            placeholder="you@example.com"
                        />
                    </label>
                    <label className="field">
                        <span>Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="new-password"
                            placeholder="Minimum 6 characters"
                        />
                    </label>
                    <button className="button primary full" type="submit" disabled={loading}>
                        <Icon name="check" size={18} />
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already registered? <Link to="/login">Login</Link>
                </p>
            </section>
        </main>
    )
}
