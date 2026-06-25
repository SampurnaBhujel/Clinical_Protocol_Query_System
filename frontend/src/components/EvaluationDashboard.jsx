// frontend/src/components/EvaluationDashboard.jsx

import { useEffect, useMemo, useState } from 'react'
import axiosClient from '../api/axiosClient'
import Icon from './Icon'

export default function EvaluationDashboard() {
    const [records, setRecords] = useState([])
    const [query, setQuery] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchRecords() {
            try {
                const res = await axiosClient.get('/admin/evaluation')
                setRecords(res.data || [])
            } catch {
                setError('Failed to load evaluation logs.')
            }
        }
        fetchRecords()
    }, [])

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase()
        if (!needle) return records
        return records.filter(record =>
            JSON.stringify(record).toLowerCase().includes(needle)
        )
    }, [records, query])

    return (
        <article className="admin-card evaluation-card">
            <div className="card-title-row">
                <span className="card-icon"><Icon name="activity" size={20} /></span>
                <div>
                    <h2>RAG Evaluation</h2>
                    <p>Review query rewriting, routing, retrieved evidence, confidence, and answers.</p>
                </div>
            </div>

            {error && <p className="alert error">{error}</p>}
            <label className="field evaluation-search">
                <span>Search logs</span>
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search query, route, confidence, document..."
                />
            </label>

            <div className="table-wrap evaluation-table">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Query</th>
                            <th>Rewritten</th>
                            <th>Route</th>
                            <th>Confidence</th>
                            <th>Retrieved Docs</th>
                            <th>Answer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((record, index) => (
                            <tr key={`${record.timestamp}-${index}`}>
                                <td>{record.original_question || record.query}</td>
                                <td>{record.rewritten_question || '-'}</td>
                                <td>{Array.isArray(record.selected_route) ? record.selected_route.join(', ') : record.selected_route}</td>
                                <td>{record.confidence || '-'}</td>
                                <td>{(record.retrieved_documents || []).join(', ')}</td>
                                <td>{record.answer || record.final_answer}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </article>
    )
}
