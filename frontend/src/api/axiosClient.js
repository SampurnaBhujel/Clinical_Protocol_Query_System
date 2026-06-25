// frontend/src/api/axiosClient.js


// import axios from 'axios'

// const axiosClient = axios.create({
//     baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
// })

// // Attach JWT token to every request automatically
// axiosClient.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token')
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
// })

// export default axiosClient

import axios from 'axios'

const axiosClient = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        'http://localhost:8000',
})

axiosClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token')

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

axiosClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.clear()

            if (
                window.location.pathname !== '/login'
            ) {
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default axiosClient