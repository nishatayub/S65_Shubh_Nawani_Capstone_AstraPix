import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';
import OAuthCallback from './components/OAuthCallback';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
          <Router>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/auth" replace />} />
            </Routes>
          </Router>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;