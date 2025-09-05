import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import VerifyCertificate from './pages/VerifyCertificate';
import AdminDashboard from './pages/AdminDashboard';
import AdminAddCertificate from './pages/AdminAddCertificate';
import AdminCertificates from './pages/AdminCertificates';
import AdminBlockchain from './pages/AdminBlockchain';
import AdminSettings from './pages/AdminSettings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* User Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute requiredRole="user">
                    <UserDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/verify" element={
                  <ProtectedRoute>
                    <VerifyCertificate />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/add" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminAddCertificate />
                  </ProtectedRoute>
                } />
                <Route path="/admin/certificates" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCertificates />
                  </ProtectedRoute>
                } />
                <Route path="/admin/blockchain" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminBlockchain />
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSettings />
                  </ProtectedRoute>
                } />
                
                {/* Default Redirects */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;