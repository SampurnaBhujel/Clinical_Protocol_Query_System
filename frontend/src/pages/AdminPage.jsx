import { useState } from 'react'
import DocumentUpload from '../components/DocumentUpload'
import DocumentList from '../components/DocumentList'
import UserList from '../components/UserList'
import EvaluationDashboard from '../components/EvaluationDashboard'
import Icon from '../components/Icon'

export default function AdminPage() {
    const [refreshDocs, setRefreshDocs] = useState(false)
    const [documentCount, setDocumentCount] = useState(0)
    const [userCount, setUserCount] = useState(0)

    function triggerRefresh() {
        setRefreshDocs(prev => !prev)
    }

    return (
        <main className="admin-page">
            <section className="page-heading">
                <span className="eyebrow">
                    <Icon name="shield" size={16} />
                    Admin dashboard
                </span>
                <div className="heading-row">
                    <div>
                        <h1>Knowledge Base Control</h1>
                        <p>Manage protocol PDFs and registered users for the medical RAG system.</p>
                    </div>
                </div>
            </section>

            <section className="metric-grid" aria-label="Admin summary">
                <div className="metric-card">
                    <Icon name="fileText" size={22} />
                    <span>{documentCount}</span>
                    <p>Indexed PDFs</p>
                </div>
                <div className="metric-card">
                    <Icon name="users" size={22} />
                    <span>{userCount}</span>
                    <p>Registered users</p>
                </div>
                <div className="metric-card">
                    <Icon name="activity" size={22} />
                    <span>RAG</span>
                    <p>Clinical search mode</p>
                </div>
            </section>

            <div className="admin-layout">
                <section className="admin-column">
                    <DocumentUpload onUploadSuccess={triggerRefresh} />
                    <DocumentList
                        refresh={refreshDocs}
                        onDelete={triggerRefresh}
                        onCountChange={setDocumentCount}
                    />
                </section>
                <section className="admin-column">
                    <UserList onCountChange={setUserCount} />
                </section>
            </div>
            <EvaluationDashboard />
        </main>
    )
}
