// {/* frontend/src/context/AuthContext.jsx */ }

// import { createContext, useContext, useState } from 'react'
// import { jwtDecode } from 'jwt-decode'

// const AuthContext = createContext(null)

// export function AuthProvider({ children }) {
//     // Initialize state from localStorage so refresh doesn't log the user out
//     // const [token, setToken] = useState(localStorage.getItem('token') || null)
//     function getValidToken() {
//         const token = localStorage.getItem('token')

//         if (!token) return null

//         try {
//             const decoded = jwtDecode(token)

//             if (decoded.exp * 1000 < Date.now()) {
//                 localStorage.clear()
//                 return null
//             }

//             return token
//         } catch {
//             localStorage.clear()
//             return null
//         }
//     }

//     const [token, setToken] = useState(getValidToken())

//     const [role, setRole] = useState(localStorage.getItem('role') || null)
//     const [username, setUsername] = useState(localStorage.getItem('username') || null)

//     function login(accessToken, userRole, userName) {
//         localStorage.setItem('token', accessToken)
//         localStorage.setItem('role', userRole)
//         localStorage.setItem('username', userName)
//         setToken(accessToken)
//         setRole(userRole)
//         setUsername(userName)
//     }

//     function logout() {
//         localStorage.removeItem('token')
//         localStorage.removeItem('role')
//         localStorage.removeItem('username')
//         setToken(null)
//         setRole(null)
//         setUsername(null)
//     }

//     return (
//         <AuthContext.Provider value={{ token, role, username, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     )
// }

// export function useAuth() {
//     return useContext(AuthContext)
// }

// frontend/src/context/AuthContext.jsx

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import axiosClient from '../api/axiosClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    function getValidToken() {
        const token = localStorage.getItem('token')

        if (!token) return null

        try {
            const decoded = jwtDecode(token)

            if (decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                return null
            }

            return token
        } catch {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            return null
        }
    }

    const [token, setToken] = useState(getValidToken())

    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user')
        return saved ? JSON.parse(saved) : null
    })

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadCurrentUser() {
            if (!token) {
                setUser(null)
                setLoading(false)
                return
            }

            try {
                const res = await axiosClient.get('/auth/me')

                setUser(res.data)
                localStorage.setItem(
                    'user',
                    JSON.stringify(res.data)
                )
            } catch {
                localStorage.removeItem('token')
                localStorage.removeItem('user')

                setToken(null)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        loadCurrentUser()
    }, [token])

    async function login(accessToken) {
        localStorage.setItem('token', accessToken)
        setToken(accessToken)

        const res = await axiosClient.get('/auth/me')

        setUser(res.data)
        localStorage.setItem(
            'user',
            JSON.stringify(res.data)
        )
    }

    async function logout() {
        try {
            await axiosClient.post('/auth/logout')
        } catch {
            // Ignore logout errors (expired/revoked token)
        }

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                role: user?.role ?? null,
                username: user?.username ?? null,
                email: user?.email ?? null,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}