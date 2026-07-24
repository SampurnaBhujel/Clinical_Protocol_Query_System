// frontend/src/components/UserList.jsx


import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'
import Icon from './Icon'

export default function UserList({ onCountChange }) {
    const [users, setUsers] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await axiosClient.get('/admin/users')
                setUsers(res.data)
                onCountChange?.(res.data.length)
            } catch {
                setError('Failed to load registered users.')
            }
        }
        fetchUsers()
    }, [onCountChange])

    return (
        <article className="admin-card">
            <div className="card-title-row">
                <span className="card-icon"><Icon name="users" size={20} /></span>
                <div>
                    <h2>Users</h2>
                    <p>Registered patient and administrator accounts.</p>
                </div>
            </div>

            {error && <p className="alert error">{error}</p>}
            {users.length === 0 ? (
                <div className="empty-table">
                    <Icon name="users" size={26} />
                    <p>No registered users found.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${user.role}`}>{user.role}</span>
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </article>
    )
}
