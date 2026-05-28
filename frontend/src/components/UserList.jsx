// frontend/src/components/UserList.jsx

import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'

export default function UserList() {
    const [users, setUsers] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await axiosClient.get('/admin/users')
                setUsers(res.data)
            } catch {
                setError('Failed to load users')
            }
        }
        fetchUsers()
    }, [])

    return (
        <div className="admin-card">
            <h3>Registered Users</h3>
            {error && <p className="error-msg">{error}</p>}
            {users.length === 0 ? (
                <p className="empty-msg">No registered users found.</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.username}</td>
                                <td>{u.email}</td>
                                <td>
                                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                                </td>
                                <td>{new Date(u.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}