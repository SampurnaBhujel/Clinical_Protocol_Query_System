{/* frontend/src/App.jsx */}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer' // <-- Imported your shared Footer here!
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import AdminPage from './pages/AdminPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    {/* The Flex column layout pushes the footer perfectly to the bottom */}
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        minHeight: '100vh', 
                        width: '100vw',
                        overflowX: 'hidden'
                    }}>
                        <Navbar />
                        
                        {/* flex: 1 expands to absorb all remaining spatial room, forcing Footer down */}
                        <div style={{ flex: '1 0 auto', width: '100%' }}>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />
                                <Route path="/chat" element={
                                    <ProtectedRoute>
                                        <ChatPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin" element={
                                    <AdminRoute>
                                        <AdminPage />
                                    </AdminRoute>
                                } />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>

                        {/* Registered here globally so it updates on every page view */}
                        <Footer /> 
                    </div>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    )
}