// frontend/src/pages/AdminPage.jsx

import { useState } from 'react'
import DocumentUpload from '../components/DocumentUpload'
import DocumentList from '../components/DocumentList'
import UserList from '../components/UserList'

export default function AdminPage() {
    // Toggle this to trigger a re-fetch in DocumentList after an upload or delete
    const [refreshDocs, setRefreshDocs] = useState(false)

    function triggerRefresh() {
        setRefreshDocs(prev => !prev)
    }

    return (
        <div className="admin-page">
            <h2>Admin Dashboard</h2>
            <DocumentUpload onUploadSuccess={triggerRefresh} />
            <DocumentList refresh={refreshDocs} onDelete={triggerRefresh} />
            <UserList />
        </div>
    )
}