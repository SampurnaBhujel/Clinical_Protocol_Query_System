import { useCallback, useEffect, useRef, useState } from 'react'
import axiosClient from '../api/axiosClient'
import ResponseCard from '../components/ResponseCard'
import Icon from '../components/Icon'
import { useAuth } from '../context/AuthContext'

const DISCLAIMER = 'This assistant is for guidance only. It is not a diagnosis. Please consult a qualified medical professional for personal medical care.'

const SUGGESTIONS = [
    { text: 'टाइफाइडका सामान्य लक्षणहरू के हुन्?', sub: 'Typhoid information' },
    { text: 'How can dengue fever be prevented?', sub: 'Prevention tips' },
    { text: 'बच्चामा निमोनियाको चेतावनी संकेत के हुन्?', sub: 'Child health signs' },
    { text: 'What should I do for dehydration symptoms?', sub: 'Dehydration advice' }
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
            setError('Unable to load history.')
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
        if (loading) return
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
            setError(err.response?.data?.detail || 'Unable to open this chat.')
        } finally {
            setLoading(false)
        }
    }

    async function deleteConversation(e, conversationId) {
        e.stopPropagation()
        if (!window.confirm('Delete this chat? This cannot be undone.')) return
        try {
            await axiosClient.delete(`/chat/history/${conversationId}`)
            if (selectedConversationId === conversationId) startNewConversation()
            fetchConversations()
        } catch (err) {
            setError(err.response?.data?.detail || 'Unable to delete.')
        }
    }

    const handleQuery = useCallback(async (questionText) => {
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
            setError(err.response?.data?.detail || 'Unable to get response. Please try again.')
            setMessages(prev => prev.slice(0, -1))
        } finally {
            setLoading(false)
        }
    }, [question, loading, selectedConversationId, fetchConversations])

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleQuery()
        }
    }

    return (
        <main className="workspace-root-wrapper">
            <div className="workspace-layout">
                
                <aside className="clinical-sidebar" aria-label="Chat Controls and History">
                    <div className="sidebar-action-zone">
                        <button className="btn-sidebar-primary" type="button" onClick={startNewConversation} disabled={loading}>
                            <Icon name="plus" size={16} aria-hidden="true" />
                            <span>New Chat</span>
                        </button>
                    </div>

                    <div className="sidebar-scrollable-content">
                        {conversations.length > 0 && (
                            <nav className="history-navigation" aria-label="Session History">
                                <div className="history-section-label">PREVIOUS CHATS</div>
                                <div className="history-stack">
                                    {conversations.map(conversation => {
                                        const isActive = selectedConversationId === conversation.id;
                                        return (
                                            <div 
                                                key={conversation.id} 
                                                className={`history-item-container ${isActive ? 'active-node' : ''}`}
                                            >
                                                <button
                                                    type="button"
                                                    className="history-item-btn"
                                                    onClick={() => openConversation(conversation.id)}
                                                    disabled={loading}
                                                    aria-current={isActive ? 'true' : undefined}
                                                >
                                                    <Icon name="messageCircle" size={14} className="node-icon" aria-hidden="true" />
                                                    <span className="truncate-text">{conversation.title || 'Untitled Chat'}</span>
                                                </button>
                                                <button
                                                    className="history-item-delete"
                                                    type="button"
                                                    aria-label={`Delete entry: ${conversation.title}`}
                                                    onClick={e => deleteConversation(e, conversation.id)}
                                                >
                                                    <Icon name="trash" size={13} aria-hidden="true" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </nav>
                        )}
                    </div>

                    <div className="sidebar-footer-compliance">
                        <div className="safety-card">
                            <div className="safety-header">
                                <Icon name="shield" size={14} className="warning-indicator" aria-hidden="true" />
                                <span>SAFETY NOTICE</span>
                            </div>
                            <p>{DISCLAIMER}</p>
                        </div>
                    </div>
                </aside>

                <section className="chat-viewport-panel" aria-label="Medical chatbot conversation">
                    <header className="viewport-header">
                        <div className="header-meta-cluster">
                            <span className="engine-badge">
                                <Icon name="activity" size={12} aria-hidden="true" />
                                MEDICAL ASSISTANT v2.4
                            </span>
                        </div>
                        <div className="active-session-title">
                            {selectedConversationId ? 'Current Analysis' : 'New Session'}
                        </div>
                    </header>

                    <div className="message-scroller-view">
                        <div className="view-inner-bounded">
                            {messages.length === 0 && (
                                <article className="dashboard-empty-canvas">
                                    <header className="welcome-banner">
                                        <h1>Hello, <span className="user-glow-name">{username || 'Clinician'}</span></h1>
                                        <p>Ask your medical questions here. I will provide guidance based on health protocols.</p>
                                    </header>

                                    <section className="suggestions-grid-matrix" aria-label="Suggested diagnostic entry points">
                                        {SUGGESTIONS.map(prompt => (
                                            <button
                                                key={prompt.text}
                                                type="button"
                                                className="suggestion-plate-card"
                                                onClick={() => handleQuery(prompt.text)}
                                                disabled={loading}
                                            >
                                                <div className="suggestion-content">
                                                    <span className="suggestion-body">{prompt.text}</span>
                                                    <span className="suggestion-meta">{prompt.sub}</span>
                                                </div>
                                                <div className="action-arrow-icon" aria-hidden="true">
                                                    <Icon name="arrowUpRight" size={14} />
                                                </div>
                                            </button>
                                        ))}
                                    </section>
                                </article>
                            )}

                            <div className="message-thread-stream" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {messages.map((msg, index) => {
                                    const isUser = msg.role === 'user';
                                    return (
                                        <div 
                                            key={`${msg.role}-${index}`} 
                                            className={`message-block-row ${isUser ? 'user-aligned' : 'assistant-aligned'}`}
                                            style={{
                                                display: 'flex',
                                                justifyContent: isUser ? 'flex-end' : 'flex-start',
                                                flexDirection: isUser ? 'row-reverse' : 'row',
                                                alignItems: 'flex-start',
                                                gap: '12px',
                                                width: '100%'
                                            }}
                                        >
                                            <div className="message-avatar-hub" aria-hidden="true" style={{ flexShrink: 0 }}>
                                                <div className={`avatar-pill ${isUser ? 'user-avatar' : 'assistant-avatar'}`}>
                                                    <Icon name={isUser ? 'user' : 'activity'} size={14} />
                                                </div>
                                            </div>

                                            <div 
                                                className="message-payload-body" 
                                                style={{ 
                                                    maxWidth: '75%',
                                                    width: '100%',
                                                    textAlign: isUser ? 'right' : 'left' 
                                                }}
                                            >
                                                {isUser ? (
                                                    <div className="user-bubble-content" style={{ display: 'inline-block', textAlign: 'left' }}>
                                                        {msg.content}
                                                    </div>
                                                ) : (
                                                    <div className="assistant-card-container">
                                                        <ResponseCard
                                                            answer={msg.content}
                                                            sources={msg.sources || []}
                                                            confidence={msg.confidence || ''}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {loading && (
                                    <div 
                                        className="message-block-row assistant-aligned loading-state-active"
                                        style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '12px' }}
                                    >
                                        <div className="message-avatar-hub" aria-hidden="true" style={{ flexShrink: 0 }}>
                                            <div className="avatar-pill assistant-avatar processing-spin">
                                                <Icon name="activity" size={14} />
                                            </div>
                                        </div>
                                        <div className="message-payload-body" style={{ maxWidth: '75%', width: '100%', textAlign: 'left' }}>
                                            <div className="clinical-typing-skeleton" aria-label="Processing request">
                                                <div className="pulse-bar skeletal-long" />
                                                <div className="pulse-bar skeletal-medium" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>
                        </div>
                    </div>

                    <footer className="workspace-input-dock-anchor">
                        <div className="dock-inner-bounded">
                            {error && (
                                <div className="telemetry-error-alert animate-shake" role="alert">
                                    <Icon name="alertTriangle" size={14} aria-hidden="true" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form 
                                className="dock-input-bar-container"
                                onSubmit={e => { 
                                    e.preventDefault(); 
                                    if (question.trim() && !loading) handleQuery(); 
                                }}
                            >
                                <textarea
                                    className="dock-textarea"
                                    rows={1}
                                    placeholder="Type your health question..."
                                    value={question}
                                    onChange={e => setQuestion(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={loading}
                                    aria-label="Medical query prompt interface"
                                />
                                <div className="dock-action-bar">
                                    <button 
                                        className="btn-dock-submit" 
                                        type="submit" 
                                        disabled={loading || !question.trim()}
                                        aria-label="Submit query"
                                    >
                                        <Icon name="arrowUp" size={16} aria-hidden="true" />
                                    </button>
                                </div>
                            </form>
                            <div className="dock-subtext-compliance">
                                Secure clinical guidance system.
                            </div>
                        </div>
                    </footer>
                </section>
            </div>
        </main>
    )
}