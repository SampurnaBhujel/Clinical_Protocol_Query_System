// frontend/src/components/DocumentList.jsx

import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'

export default function DocumentList({ refresh, onDelete }) {
    const [documents, setDocuments] = useState([])
    const [error, setError] = useState('')
    const [deletingId, setDeletingId] = useState(null)

    // Re-fetch whenever refresh toggle changes (after upload or delete)
    useEffect(() => {
        fetchDocs()
    }, [refresh])

    async function fetchDocs() {
        try {
            const res = await axiosClient.get('/admin/documents')
            setDocuments(res.data)
            setError('')
        } catch {
            setError('Failed to load documents')
        }
    }

    async function handleDelete(id, filename) {
        if (!window.confirm(`Delete "${filename}"? This cannot be undone.`)) return
        setDeletingId(id)
        try {
            await axiosClient.delete(`/admin/documents/${id}`)
            setDocuments(prev => prev.filter(d => d.id !== id))
            onDelete()
        } catch {
            setError('Failed to delete document')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="admin-card">
            <h3>Indexed Documents</h3>
            {error && <p className="error-msg">{error}</p>}
            {documents.length === 0 ? (
                <p className="empty-msg">No documents indexed yet.</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Filename</th>
                            <th>Uploaded At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map(doc => (
                            <tr key={doc.id}>
                                <td>{doc.id}</td>
                                <td>{doc.filename}</td>
                                <td>{new Date(doc.uploaded_at).toLocaleString()}</td>
                                <td>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(doc.id, doc.filename)}
                                        disabled={deletingId === doc.id}
                                    >
                                        {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}