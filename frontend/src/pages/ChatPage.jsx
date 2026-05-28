// frontend/src/pages/ChatPage.jsx

import { useState, useEffect, useRef } from 'react'
import axiosClient from '../api/axiosClient'
import ResponseCard from '../components/ResponseCard'

const DISCLAIMER =
    '⚠️ Results may not be 100% accurate. Please consult a medical professional. | परिणामहरू १००% सही नहुन सक्छ। कृपया चिकित्सकसँग परामर्श लिनुहोस्।'

const SUGGESTIONS = [
    'Which disease is common in Nepal?',
    'टाइफाइडका लक्षणहरू के हुन्?',
    'How to prevent malaria?',
    'बच्चाको खोकीको उपचार के हो?',
]

export default function ChatPage() {
    const [messages, setMessages] = useState([])
    const [question, setQuestion] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const bottomRef = useRef(null)

    // Auto-scroll to the latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    async function handleQuery(questionText) {
        const q = questionText || question
        if (!q.trim() || loading) return

        const userMessage = { role: 'user', content: q }
        // Append user message and clear input immediately for responsive feel
        const updatedHistory = [...messages, userMessage]
        setMessages(updatedHistory)
        setQuestion('')
        setLoading(true)
        setError('')

        try {
            const res = await axiosClient.post('/rag/query', {
                question: q,
                // Send full conversation history so the backend can handle follow-up questions
                history: updatedHistory.map(m => ({ role: m.role, content: m.content }))
            })
            const assistantMessage = {
                role: 'assistant',
                content: res.data.answer,
                sources: res.data.sources
            }
            setMessages(prev => [...prev, assistantMessage])
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to get a response. Please try again.')
            // Remove the optimistically added user message on failure
            setMessages(prev => prev.slice(0, -1))
        } finally {
            setLoading(false)
        }
    }

    function handleKeyDown(e) {
        // Submit on Enter; allow Shift+Enter for newlines
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleQuery()
        }
    }

    return (
        <div className="chat-page">

            {/* Welcome card shown before the first message */}
            {messages.length === 0 && (
                <div className="welcome-card">
                    <h4>नमस्ते! How can I help you today?</h4>
                    <p>
                        Ask health questions in <strong>English</strong>,{' '}
                        <strong>Nepali (नेपाली)</strong>, or both.<br />
                        I will answer in the same language you use.
                    </p>
                    <div className="chip-row">
                        {SUGGESTIONS.map((s, i) => (
                            <span
                                key={i}
                                className="chip"
                                onClick={() => handleQuery(s)}
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Conversation messages */}
            <div className="chat-messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`chat-bubble-wrapper ${msg.role}`}>
                        {msg.role === 'user' ? (
                            <div className="bubble user-bubble">{msg.content}</div>
                        ) : (
                            <ResponseCard answer={msg.content} sources={msg.sources || []} />
                        )}
                    </div>
                ))}

                {/* Typing indicator while waiting for the API */}
                {loading && (
                    <div className="chat-bubble-wrapper assistant">
                        <div className="bubble assistant-bubble loading-bubble">
                            <span className="dot" /><span className="dot" /><span className="dot" />
                        </div>
                    </div>
                )}

                {/* Invisible anchor for auto-scroll */}
                <div ref={bottomRef} />
            </div>

            {error && <p className="error-msg chat-error">{error}</p>}

            {/* Fixed input bar at the bottom */}
            <div className="chat-input-bar">
                <textarea
                    rows={2}
                    placeholder="Type your health question... / यहाँ आफ्नो प्रश्न टाइप गर्नुहोस्..."
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                />
                <button onClick={() => handleQuery()} disabled={loading}>
                    {loading ? '...' : 'Send'}
                </button>
            </div>

            <p className="disclaimer">{DISCLAIMER}</p>
        </div>
    )
}