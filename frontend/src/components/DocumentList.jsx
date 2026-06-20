// frontend/src/components/Documentlist.jsx

import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'
import Icon from './Icon'

export default function DocumentList({ refresh, onDelete, onCountChange }) {
    const [documents, setDocuments] = useState([])
    const [error, setError] = useState('')
    const [deletingId, setDeletingId] = useState(null)

    useEffect(() => {
        fetchDocs()
    }, [refresh])

    async function fetchDocs() {
        try {
            const res = await axiosClient.get('/admin/documents')
            setDocuments(res.data)
            onCountChange?.(res.data.length)
            setError('')
        } catch {
            setError('Failed to load indexed documents.')
        }
    }

    async function handleDelete(id, filename) {
        if (!window.confirm(`Delete "${filename}"? This cannot be undone.`)) return
        setDeletingId(id)
        try {
            await axiosClient.delete(`/admin/documents/${id}`)
            setDocuments(prev => {
                const next = prev.filter(doc => doc.id !== id)
                onCountChange?.(next.length)
                return next
            })
            onDelete()
        } catch {
            setError('Failed to delete document.')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <article className="admin-card">
            <div className="card-title-row">
                <span className="card-icon"><Icon name="bookOpen" size={20} /></span>
                <div>
                    <h2>Indexed PDFs</h2>
                    <p>Documents currently available to the chatbot.</p>
                </div>
            </div>

            {error && <p className="alert error">{error}</p>}
            {documents.length === 0 ? (
                <div className="empty-table">
                    <Icon name="fileText" size={26} />
                    <p>No documents indexed yet.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>File</th>
                                <th>Uploaded</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map(doc => (
                                <tr key={doc.id}>
                                    <td>
                                        <span className="file-name">
                                            <Icon name="fileText" size={16} />
                                            {doc.filename}
                                        </span>
                                    </td>
                                    <td>{new Date(doc.uploaded_at).toLocaleString()}</td>
                                    <td>
                                        <button
                                            className="icon-danger"
                                            type="button"
                                            onClick={() => handleDelete(doc.id, doc.filename)}
                                            disabled={deletingId === doc.id}
                                            title="Delete document"
                                        >
                                            <Icon name="trash" size={17} />
                                            {deletingId === doc.id ? 'Deleting' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </article>
    )
}
