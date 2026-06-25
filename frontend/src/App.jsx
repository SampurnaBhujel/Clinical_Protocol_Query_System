import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import AdminPage from './pages/AdminPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Footer from "./components/Footer";

// export default function App() {
//     return (
//         <ThemeProvider>
//             <AuthProvider>
//                 <BrowserRouter>
//                     <Navbar />
//                     <Routes>
//                         <Route path="/" element={<HomePage />} />
//                         <Route path="/login" element={<LoginPage />} />
//                         <Route path="/register" element={<RegisterPage />} />
//                         <Route path="/chat" element={
//                             <ProtectedRoute>
//                                 <ChatPage />
//                             </ProtectedRoute>
//                         } />
//                         <Route path="/admin" element={
//                             <AdminRoute>
//                                 <AdminPage />
//                             </AdminRoute>
//                         } />
//                         <Route path="*" element={<Navigate to="/" replace />} />
//                     </Routes>
//                 </BrowserRouter>
//             </AuthProvider>
//         </ThemeProvider>
//     )
// }

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>

                    <Navbar />

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

                    {/* ✅ ADD FOOTER HERE */}
                    <Footer />

                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    )
}