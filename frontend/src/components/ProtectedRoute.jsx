// // frontend/src/components/ProtectedRoute.jsx 

// import { Navigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'

// export default function ProtectedRoute({ children }) {
//     const { token } = useAuth()
//     if (!token) return <Navigate to="/login" replace />
//     return children
// }

// frontend/src/components/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
    const { token, loading } = useAuth()

    // Wait until authentication is restored
    if (loading) {
        return null
    }

    if (!token) {
        return <Navigate to="/login" replace />
    }

    return children
}
