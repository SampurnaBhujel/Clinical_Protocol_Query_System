// // frontend/src/api/axiosClient.js


// import axios from 'axios'

// const axiosClient = axios.create({
//     baseURL:
//         import.meta.env.VITE_API_BASE_URL ||
//         'http://localhost:8000',
// })

// axiosClient.interceptors.request.use(config => {
//     const token = localStorage.getItem('token')

//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`
//     }

//     return config
// })

// axiosClient.interceptors.response.use(
//     response => response,
//     error => {
//         if (error.response?.status === 401) {
//             localStorage.clear()

//             if (
//                 window.location.pathname !== '/login'
//             ) {
//                 window.location.href = '/login'
//             }
//         }

//         return Promise.reject(error)
//     }
// )

// export default axiosClient

// frontend/src/api/axiosClient.js

import axios from 'axios'

const axiosClient = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        'http://localhost:8000',
})

// Attach Bearer token to every authenticated request
axiosClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    error => Promise.reject(error)
)

// Handle expired/invalid/revoked tokens
axiosClient.interceptors.response.use(
    response => response,
    error => {
        const status = error.response?.status
        const detail = error.response?.data?.detail

        // Backend returns 401 for:
        // - Invalid token
        // - Expired token
        // - Revoked token
        if (
            status === 401 &&
            (
                detail === 'Could not validate token' ||
                detail === 'Token has expired' ||
                detail === 'Token has been revoked'
            )
        ) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')

            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default axiosClient