{/* frontend/src/context/AuthContext.jsx */ }

import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    // Initialize state from localStorage so refresh doesn't log the user out
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const [role, setRole] = useState(localStorage.getItem('role') || null)
    const [username, setUsername] = useState(localStorage.getItem('username') || null)

    function login(accessToken, userRole, userName) {
        localStorage.setItem('token', accessToken)
        localStorage.setItem('role', userRole)
        localStorage.setItem('username', userName)
        setToken(accessToken)
        setRole(userRole)
        setUsername(userName)
    }

    function logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('username')
        setToken(null)
        setRole(null)
        setUsername(null)
    }

    return (
        <AuthContext.Provider value={{ token, role, username, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}