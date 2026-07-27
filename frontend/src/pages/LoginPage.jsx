// {/* frontend/src/pages/LoginPage.jsx */ }

// import { useState } from 'react'
// import { useNavigate, Link } from 'react-router-dom'
// import { jwtDecode } from 'jwt-decode'
// import { useAuth } from '../context/AuthContext'
// import axiosClient from '../api/axiosClient'
// import Icon from '../components/Icon'

// export default function LoginPage() {
//     const [username, setUsername] = useState('')
//     const [password, setPassword] = useState('')
//     const [error, setError] = useState('')
//     const [loading, setLoading] = useState(false)
//     const { login } = useAuth()
//     const navigate = useNavigate()

//     async function handleLogin(e) {
//         e?.preventDefault()
//         if (!username.trim() || !password.trim()) {
//             setError('Please enter your username and password.')
//             return
//         }

//         setLoading(true)
//         setError('')
//         try {
//             const formData = new URLSearchParams()
//             formData.append('username', username.trim())
//             formData.append('password', password)

//             const res = await axiosClient.post('/auth/login', formData, {
//                 headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
//             })

//             const token = res.data.access_token
//             const decoded = jwtDecode(token)
//             login(token, decoded.role, decoded.sub)
//             navigate(decoded.role === 'admin' ? '/admin' : '/chat')
//         } catch (err) {
//             setError(err.response?.data?.detail || 'We could not sign you in. Please check your credentials and try again.')
//         } finally {
//             setLoading(false)
//         }
//     }

//     return (
//         <main className="auth-page">
//             <section className="auth-card">
//                 <div className="auth-heading">
//                     <span className="auth-icon"><Icon name="logIn" size={22} /></span>
//                     <h1>Welcome back</h1>
//                     <p>Sign in to continue to your chatbot or admin dashboard.</p>
//                 </div>

//                 <form className="form-stack" onSubmit={handleLogin}>
//                     {error && <p className="alert error">{error}</p>}
//                     <label className="field">
//                         <span>Username</span>
//                         <input
//                             value={username}
//                             onChange={e => setUsername(e.target.value)}
//                             autoComplete="username"
//                             autoFocus
//                             placeholder="Enter your username"
//                         />
//                     </label>
//                     <label className="field">
//                         <span>Password</span>
//                         <input
//                             type="password"
//                             value={password}
//                             onChange={e => setPassword(e.target.value)}
//                             autoComplete="current-password"
//                             placeholder="Enter your password"
//                         />
//                     </label>
//                     <button className="button primary full" type="submit" disabled={loading}>
//                         <Icon name="lock" size={18} />
//                         {loading ? 'Signing in…' : 'Sign in'}
//                     </button>
//                 </form>

//                 <p className="auth-switch">
//                     New here? <Link to="/register">Create an account</Link>
//                 </p>
//             </section>
//         </main>
//     )
// }

// frontend/src/pages/LoginPage.jsx

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import Icon from '../components/Icon'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleLogin(e) {
        e?.preventDefault()

        if (!username.trim() || !password.trim()) {
            setError('Please enter your username and password.')
            return
        }

        setLoading(true)
        setError('')

        try {
            // FastAPI OAuth2PasswordRequestForm
            const formData = new URLSearchParams()
            formData.append('username', username.trim())
            formData.append('password', password)

            const res = await axiosClient.post(
                '/auth/login',
                formData,
                {
                    headers: {
                        'Content-Type':
                            'application/x-www-form-urlencoded',
                    },
                }
            )

            // Save token + fetch current user
            await login(res.data.access_token)

            // Read stored user returned from /auth/me
            const user = JSON.parse(
                localStorage.getItem('user')
            )

            if (user?.role === 'admin') {
                navigate('/admin', { replace: true })
            } else {
                navigate('/chat', { replace: true })
            }
        } catch (err) {
            const status = err.response?.status
            const detail = err.response?.data?.detail

            if (status === 401) {
                setError('Invalid username or password.')
            } else if (status === 423) {
                setError(detail)
            } else if (status === 429) {
                setError(detail)
            } else {
                setError(
                    detail ||
                    'We could not sign you in. Please try again.'
                )
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-heading">
                    <span className="auth-icon">
                        <Icon name="logIn" size={22} />
                    </span>

                    <h1>Welcome back</h1>

                    <p>
                        Sign in to continue to your chatbot
                        or admin dashboard.
                    </p>
                </div>

                <form
                    className="form-stack"
                    onSubmit={handleLogin}
                >
                    {error && (
                        <p className="alert error">
                            {error}
                        </p>
                    )}

                    <label className="field">
                        <span>Username</span>

                        <input
                            value={username}
                            onChange={e =>
                                setUsername(e.target.value)
                            }
                            autoComplete="username"
                            autoFocus
                            placeholder="Enter your username"
                        />
                    </label>

                    <label className="field">
                        <span>Password</span>

                        <input
                            type="password"
                            value={password}
                            onChange={e =>
                                setPassword(e.target.value)
                            }
                            autoComplete="current-password"
                            placeholder="Enter your password"
                        />
                    </label>

                    <button
                        className="button primary full"
                        type="submit"
                        disabled={loading}
                    >
                        <Icon name="lock" size={18} />

                        {loading
                            ? 'Signing in…'
                            : 'Sign in'}
                    </button>
                </form>

                <p className="auth-switch">
                    New here?{' '}
                    <Link to="/register">
                        Create an account
                    </Link>
                </p>
            </section>
        </main>
    )
}