// frontend/src/components/ProtectedRoute.jsx 

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Redirects unauthenticated users to the login page
export default function ProtectedRoute({ children }) {
    const { token } = useAuth()
    if (!token) return <Navigate to="/login" replace />
    return children
}