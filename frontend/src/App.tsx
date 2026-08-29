import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/login"
            element={
              <div className="container">
                <div className="card" style={{ maxWidth: '400px', margin: '60px auto', textAlign: 'center' }}>
                  <h2>Login</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Please log in to your account</p>
                </div>
              </div>
            }
          />
          <Route
            path="/register"
            element={
              <div className="container">
                <div className="card" style={{ maxWidth: '400px', margin: '60px auto', textAlign: 'center' }}>
                  <h2>Register</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Create a new account</p>
                </div>
              </div>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <div className="container">
                  <div className="card" style={{ marginTop: '40px' }}>
                    <h2>Notes Dashboard</h2>
                  </div>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;