{/* frontend/src/pages/ChatPage.jsx */ }

import { useCallback, useEffect, useRef, useState } from 'react'
import axiosClient from '../api/axiosClient'
import ResponseCard from '../components/ResponseCard'
import Icon from '../components/Icon'
import { useAuth } from '../context/AuthContext'

const DISCLAIMER = 'This assistant is for protocol guidance only. It is not a diagnosis. Please consult a qualified medical professional for personal medical care.'

const SUGGESTIONS = [
    'टाइफाइडका सामान्य लक्षणहरू के हुन्?',
    'How can dengue fever be prevented?',
    'बच्चामा निमोनियाको चेतावनी संकेत के हुन्?',
    'What should I do for dehydration symptoms?'
]

export default function ChatPage() {
    const { username } = useAuth()
    const [messages, setMessages] = useState([])
    const [question, setQuestion] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [conversations, setConversations] = useState([])
    const [selectedConversationId, setSelectedConversationId] = useState(null)
    const bottomRef = useRef(null)

    const fetchConversations = useCallback(async () => {
        try {
            const res = await axiosClient.get('/chat/history')
            setConversations(res.data || [])
        } catch {
            setError('Unable to load chat history.')
        }
    }, [])

    useEffect(() => {
        fetchConversations()
    }, [fetchConversations])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [messages, loading])

    function startNewConversation() {
        setMessages([])
        setQuestion('')
        setError('')
        setSelectedConversationId(null)
    }

    async function openConversation(conversationId) {
        setLoading(true)
        setError('')
        try {
            const res = await axiosClient.get(`/chat/history/${conversationId}`)
            setMessages((res.data.messages || []).map(message => ({
                role: message.role,
                content: message.content,
                sources: message.sources || [],
                confidence: message.confidence || ''
            })))
            setQuestion('')
            setSelectedConversationId(res.data.id)
        } catch (err) {
            setError(err.response?.data?.detail || 'Unable to open this conversation.')
        } finally {
            setLoading(false)
        }
    }

    async function deleteConversation(e, conversationId) {
        e.stopPropagation()
        if (!window.confirm('Delete this conversation?')) return
        try {
            await axiosClient.delete(`/chat/history/${conversationId}`)
            if (selectedConversationId === conversationId) startNewConversation()
            fetchConversations()
        } catch (err) {
            setError(err.response?.data?.detail || 'Unable to delete this conversation.')
        }
    }

    async function handleQuery(questionText) {
        const q = (questionText || question).trim()
        if (!q || loading) return

        const userMessage = { role: 'user', content: q }
        setMessages(prev => [...prev, userMessage])
        setQuestion('')
        setLoading(true)
        setError('')

        try {
            const res = await axiosClient.post('/rag/query', {
                question: q,
                conversation_id: selectedConversationId
            })
            setSelectedConversationId(res.data.conversation_id)
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: res.data.answer || 'No answer returned.',
                    sources: res.data.sources || [],
                    confidence: res.data.confidence || ''
                }
            ])
            fetchConversations()
        } catch (err) {
            setError(err.response?.data?.detail || 'Unable to get a response. Please try again.')
            setMessages(prev => prev.slice(0, -1))
        } finally {
            setLoading(false)
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleQuery()
        }
    }

    return (
        <main className="workspace-page">
            <section className="workspace-shell">
                <aside className="patient-sidebar">
                    <div className="sidebar-header">
                        <span className="sidebar-icon"><Icon name="activity" size={22} /></span>
                        <div>
                            <h1>Hello, {username || 'User'}</h1>
                            <p>Ask clinical protocol questions.</p>
                        </div>
                    </div>
                    <div className="safety-note">
                        <Icon name="shield" size={19} />
                        <p>{DISCLAIMER}</p>
                    </div>

                    <button className="button primary full" type="button" onClick={startNewConversation}>
                        <Icon name="plus" size={18} />
                        New Conversation
                    </button>

                    {conversations.length > 0 && (
                        <div className="quick-prompts">
                            <h2>History</h2>
                            <div className="history-list">
                                {conversations.map(conversation => (
                                    <button
                                        key={conversation.id}
                                        type="button"
                                        className="history-item"
                                        onClick={() => openConversation(conversation.id)}
                                        aria-current={selectedConversationId === conversation.id ? 'true' : undefined}
                                    >
                                        <span>{conversation.title}</span>
                                        <span
                                            className="history-delete"
                                            role="button"
                                            tabIndex={0}
                                            onClick={e => deleteConversation(e, conversation.id)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' || e.key === ' ') deleteConversation(e, conversation.id)
                                            }}
                                        >
                                            Delete
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="quick-prompts">
                        <h2>Suggested questions</h2>
                        {SUGGESTIONS.map(prompt => (
                            <button
                                key={prompt}
                                type="button"
                                className="prompt-button"
                                onClick={() => handleQuery(prompt)}
                                disabled={loading}
                            >
                                <Icon name="chevronRight" size={16} />
                                {prompt}
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="chat-panel" aria-label="Medical chatbot conversation">
                    <div className="chat-header">
                        <div>
                            <span className="eyebrow">
                                <Icon name="bookOpen" size={16} />
                                Protocol search
                            </span>
                            <h2>Clinical Assistant</h2>
                        </div>
                        <span className="status-badge">
                            <span className="status-dot" />
                            Ready
                        </span>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="empty-state">
                                <Icon name="messageCircle" size={34} />
                                <h3>Start with a health question</h3>
                                <p>Use Nepali, English, or both. Answers include source documents.</p>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div key={`${msg.role}-${index}`} className={`message-row ${msg.role}`}>
                                {msg.role === 'user' ? (
                                    <div className="message-bubble user-message">{msg.content}</div>
                                ) : (
                                    <ResponseCard
                                        answer={msg.content}
                                        sources={msg.sources || []}
                                        confidence={msg.confidence || ''}
                                    />
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="message-row assistant">
                                <div className="message-bubble assistant-message typing">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {error && <p className="alert error chat-alert">{error}</p>}

                    <form className="chat-input-area" onSubmit={e => { e.preventDefault(); handleQuery() }}>
                        <textarea
                            rows={2}
                            placeholder="Type your health question... / यहाँ आफ्नो प्रश्न लेख्नुहोस्..."
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        <button className="button primary send-button" type="submit" disabled={loading || !question.trim()}>
                            <Icon name="send" size={18} />
                            Send
                        </button>
                    </form>
                </section>
            </section>
        </main>
    )
}
