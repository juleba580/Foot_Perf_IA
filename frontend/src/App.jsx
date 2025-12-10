import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header  from './components/Header'; 
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PredictionForm from './pages/PredictionForm';
import PredictionResult from './pages/PredictionResult';
import BatchResults from './pages/BatchResults';
import Profile from './pages/Profile'; 
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-full">
        <div className="spinner"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to home if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-full">
        <div className="spinner"></div>
      </div>
    );
  }

  return !user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header /> {/* Utiliser Header  ici */}
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />

              {/* Protected Routes */}
              <Route 
                path="/prediction" 
                element={
                  <ProtectedRoute>
                    <PredictionForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/prediction-result" 
                element={
                  <ProtectedRoute>
                    <PredictionResult />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/prediction-results" 
                element={
                  <ProtectedRoute>
                    <BatchResults />
                  </ProtectedRoute>
                } 
              />
              
              {/* Route Profil */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;