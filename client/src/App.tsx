import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/boards"
            element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1>Boards Page (coming soon)</h1>
                  <p>You are logged in!</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to /boards */}
          <Route path="/" element={<Navigate to="/boards" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;