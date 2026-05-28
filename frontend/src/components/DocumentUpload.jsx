// frontend/src/components/DocumentUpload.jsx

import { useState } from 'react'
import axiosClient from '../api/axiosClient'

export default function DocumentUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleUpload() {
        if (!file) {
            setError('Please select a PDF file first')
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
            setMessage(`"${file.name}" uploaded and indexed successfully.`)
            setFile(null)
            // Reset the file input by clearing its value
            document.getElementById('pdf-upload-input').value = ''
            onUploadSuccess()
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="admin-card">
            <h3>Upload Document</h3>
            {message && <p className="success-msg">{message}</p>}
            {error && <p className="error-msg">{error}</p>}
            <div className="upload-row">
                <input
                    id="pdf-upload-input"
                    type="file"
                    accept=".pdf"
                    onChange={e => {
                        setFile(e.target.files[0])
                        setMessage('')
                        setError('')
                    }}
                />
                <button onClick={handleUpload} disabled={loading}>
                    {loading ? 'Uploading & Indexing...' : 'Upload'}
                </button>
            </div>
            {loading && (
                <p className="upload-note">
                    Indexing may take a moment depending on document size. Please wait...
                </p>
            )}
        </div>
    )
}