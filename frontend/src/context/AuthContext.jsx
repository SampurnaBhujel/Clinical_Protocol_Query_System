{/* frontend/src/context/AuthContext.jsx */ }

import { createContext, useContext, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    // Initialize state from localStorage so refresh doesn't log the user out
    // const [token, setToken] = useState(localStorage.getItem('token') || null)
    function getValidToken() {
        const token = localStorage.getItem('token')

        if (!token) return null

        try {
            const decoded = jwtDecode(token)

            if (decoded.exp * 1000 < Date.now()) {
                localStorage.clear()
                return null
            }

            return token
        } catch {
            localStorage.clear()
            return null
        }
    }

const [token, setToken] = useState(getValidToken())

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