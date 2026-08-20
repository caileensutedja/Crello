import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { BoardsPage } from './pages/BoardsPage';
import { BoardDetailedPage } from './pages/BoardDetailedPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          {/* Sign Up */}
          <Route 
            path="/signup" 
            element={<SignupPage />} 
          />
          {/* Log In*/}
          <Route 
            path="/login" 
            element={<LoginPage />} 
          />

          {/* Protected routes */}
          {/* Boards lists page */}
          <Route
            path="/boards"
            element={<ProtectedRoute> <BoardsPage /> </ProtectedRoute>
            }
          />
          
          {/* Boards detailed page */}
          <Route
            path="/boards/:boardId"
            element={<ProtectedRoute> <BoardDetailedPage /></ProtectedRoute>}
          />

          {/* Redirect root to /boards */}
          <Route 
            path="/" 
            element={<Navigate to="/boards" replace />} 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;