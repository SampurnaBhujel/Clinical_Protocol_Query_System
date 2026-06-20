// frontend/src/components/DocumentlistUpload

import { useRef, useState } from 'react'
import axiosClient from '../api/axiosClient'
import Icon from './Icon'

export default function DocumentUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const inputRef = useRef(null)

    async function handleUpload(e) {
        e.preventDefault()
        if (!file) {
            setError('Please select a PDF file first.')
            return
        }

        const formData = new FormData()
        formData.append('file', file)
        setLoading(true)
        setError('')
        setMessage('')

        try {
            await axiosClient.post('/admin/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setMessage(`${file.name} uploaded and indexed successfully.`)
            setFile(null)
            if (inputRef.current) inputRef.current.value = ''
            onUploadSuccess()
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <article className="admin-card">
            <div className="card-title-row">
                <span className="card-icon"><Icon name="upload" size={20} /></span>
                <div>
                    <h2>PDF Documents</h2>
                    <p>Upload official guidelines and protocol documents.</p>
                </div>
            </div>

            <form className="upload-box" onSubmit={handleUpload}>
                {message && <p className="alert success">{message}</p>}
                {error && <p className="alert error">{error}</p>}
                <label className="file-drop">
                    <Icon name="fileText" size={28} />
                    <span>{file ? file.name : 'Choose a PDF file'}</span>
                    <small>Only PDF documents are accepted.</small>
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={e => {
                            setFile(e.target.files?.[0] || null)
                            setMessage('')
                            setError('')
                        }}
                    />
                </label>
                <button className="button primary full" type="submit" disabled={loading}>
                    <Icon name="plus" size={18} />
                    {loading ? 'Uploading and indexing...' : 'Upload PDF'}
                </button>
            </form>
        </article>
    )
}
