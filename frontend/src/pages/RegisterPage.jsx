// {/* frontend/src/pages/RegisterPage.jsx */ }

// import { useState } from 'react'
// import { useNavigate, Link } from 'react-router-dom'
// import axiosClient from '../api/axiosClient'
// import Icon from '../components/Icon'

// export default function RegisterPage() {
//     const [username, setUsername] = useState('')
//     const [email, setEmail] = useState('')
//     const [password, setPassword] = useState('')
//     const [error, setError] = useState('')
//     const [success, setSuccess] = useState('')
//     const [loading, setLoading] = useState(false)
//     const navigate = useNavigate()

//     async function handleRegister(e) {
//         e?.preventDefault()
//         if (!username.trim() || !email.trim() || !password.trim()) {
//             setError('Please fill in all fields to continue.')
//             return
//         }

//         setLoading(true)
//         setError('')
//         setSuccess('')
//         try {
//             await axiosClient.post('/auth/register', {
//                 username: username.trim(),
//                 email: email.trim(),
//                 password
//             })
//             setSuccess('Account created! Taking you to the login page…')
//             setTimeout(() => navigate('/login'), 900)
//         } catch (err) {
//             setError(err.response?.data?.detail || 'We could not create your account. Please try again.')
//         } finally {
//             setLoading(false)
//         }
//     }

//     return (
//         <main className="auth-page">
//             <section className="auth-card">
//                 <div className="auth-heading">
//                     <span className="auth-icon"><Icon name="user" size={22} /></span>
//                     <h1>Create your account</h1>
//                     <p>Sign up to start asking clinical protocol questions safely.</p>
//                 </div>

//                 <form className="form-stack" onSubmit={handleRegister}>
//                     {error && <p className="alert error">{error}</p>}
//                     {success && <p className="alert success">{success}</p>}
//                     <label className="field">
//                         <span>Username</span>
//                         <input
//                             value={username}
//                             onChange={e => setUsername(e.target.value)}
//                             autoComplete="username"
//                             autoFocus
//                             placeholder="Choose a username"
//                         />
//                     </label>
//                     <label className="field">
//                         <span>Email</span>
//                         <input
//                             type="email"
//                             value={email}
//                             onChange={e => setEmail(e.target.value)}
//                             autoComplete="email"
//                             placeholder="you@example.com"
//                         />
//                     </label>
//                     <label className="field">
//                         <span>Password</span>
//                         <input
//                             type="password"
//                             value={password}
//                             onChange={e => setPassword(e.target.value)}
//                             autoComplete="new-password"
//                             placeholder="At least 6 characters"
//                         />
//                     </label>
//                     <button className="button primary full" type="submit" disabled={loading}>
//                         <Icon name="check" size={18} />
//                         {loading ? 'Creating your account…' : 'Create account'}
//                     </button>
//                 </form>

//                 <p className="auth-switch">
//                     Already have an account? <Link to="/login">Login</Link>
//                 </p>
//             </section>
//         </main>
//     )
// }

// frontend/src/pages/RegisterPage.jsx

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

        if (
            !username.trim() ||
            !email.trim() ||
            !password.trim()
        ) {
            setError('Please fill in all fields to continue.')
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            await axiosClient.post('/auth/register', {
                username: username.trim(),
                email: email.trim(),
                password,
            })

            setSuccess(
                'Account created successfully! Redirecting to login...'
            )

            setTimeout(() => {
                navigate('/login', { replace: true })
            }, 900)
        } catch (err) {
            const detail = err.response?.data?.detail

            // FastAPI/Pydantic validation errors
            if (Array.isArray(detail)) {
                setError(detail.map(item => item.msg).join('\n'))
            } else {
                setError(
                    detail ||
                    'We could not create your account. Please try again.'
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
                        <Icon name="user" size={22} />
                    </span>

                    <h1>Create your account</h1>

                    <p>
                        Sign up to start asking clinical
                        protocol questions safely.
                    </p>
                </div>

                <form
                    className="form-stack"
                    onSubmit={handleRegister}
                >
                    {error && (
                        <p className="alert error">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="alert success">
                            {success}
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
                            placeholder="Choose a username"
                        />
                    </label>

                    <label className="field">
                        <span>Email</span>

                        <input
                            type="email"
                            value={email}
                            onChange={e =>
                                setEmail(e.target.value)
                            }
                            autoComplete="email"
                            placeholder="you@example.com"
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
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                        />
                    </label>

                    <button
                        className="button primary full"
                        type="submit"
                        disabled={loading}
                    >
                        <Icon name="check" size={18} />

                        {loading
                            ? 'Creating your account…'
                            : 'Create account'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <Link to="/login">
                        Login
                    </Link>
                </p>
            </section>
        </main>
    )
}