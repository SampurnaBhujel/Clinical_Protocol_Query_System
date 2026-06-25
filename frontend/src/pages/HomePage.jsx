import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'

const highlights = [
    ['Guideline-grounded answers', 'Searches indexed clinical PDFs instead of relying on open-ended chat.'],
    ['Nepali and English support', 'Patients can ask naturally in Nepali, English, or mixed language.'],
    ['Human-care disclaimer', 'Every response reminds users to consult qualified medical professionals.']
]

export default function HomePage() {
    const { token, role } = useAuth()
    const startPath = token ? (role === 'admin' ? '/admin' : '/chat') : '/register'

    return (
        <main className="home-page">
            <section className="hero-section">
                <div className="hero-copy">
                    <span className="eyebrow">
                        <Icon name="stethoscope" size={17} />
                        Nepal clinical protocol assistant
                    </span>
<<<<<<< HEAD
                
                    <h1>Health guidance you can trace back to a real document.</h1>

                    <p className="hero-lede">
                        A medical RAG chatbot for Nepali users to ask health questions and receive
                        careful answers from approved clinical protocol documents.
                    </p>
                    <div className="hero-actions">
                        <Link to={startPath} className="button primary large">
                            <Icon name="messageCircle" size={19} />
                            {token ? 'Open workspace' : 'Create patient account'}
                            <Icon name="arrowRight" size={18} />
                        </Link>
                        {!token && (
                            <Link to="/login" className="button secondary large">
                                <Icon name="lock" size={18} />
                                Login
                            </Link>
                        )}
                    </div>
                </div>

                <div className="hero-panel" aria-label="Sample assistant interaction">
                    <div className="hero-panel-header">
                        <span className="status-dot" />
                        Clinical RAG Preview
                    </div>
                    <div className="preview-question">
                        <Icon name="search" size={18} />
                        बच्चालाई ज्वरो आएमा के गर्ने?
                    </div>
                    <div className="preview-answer">
                        <Icon name="heartPulse" size={20} />
                        <div>
                            <strong>Protocol-based guidance</strong>
                            <p>
                                The assistant summarizes relevant care steps and source documents,
                                then clearly advises professional consultation when needed.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="feature-band">
                {highlights.map(([title, text], index) => (
                    <article className="feature-item" key={title}>
                        <span className="feature-number">0{index + 1}</span>
                        <h2>{title}</h2>
                        <p>{text}</p>
                    </article>
                ))}
            </section>
        </main>
    )
}
