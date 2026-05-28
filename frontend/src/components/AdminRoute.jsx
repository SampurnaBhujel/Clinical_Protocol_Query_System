// frontend/src/components/AdminRoute.jsx

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Redirects non-admins: unauthenticated → login, authenticated non-admin → chat
export default function AdminRoute({ children }) {
    const { token, role } = useAuth()
    if (!token) return <Navigate to="/login" replace />
    if (role !== 'admin') return <Navigate to="/" replace />
    return children
}