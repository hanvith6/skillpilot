import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import ProjectGeneratorPage from './pages/ProjectGeneratorPage';
import EnglishImproverPage from './pages/EnglishImproverPage';
import InterviewCoachPage from './pages/InterviewCoachPage';
import PurchaseCreditsPage from './pages/PurchaseCreditsPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from './components/ui/sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUserCredits = (credits) => {
    setUser(prev => ({ ...prev, credits }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#020617]">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage onLogin={handleLogin} />} />
          <Route path="/dashboard" element={user ? <DashboardPage user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
          <Route path="/resume-builder" element={user ? <ResumeBuilderPage user={user} onLogout={handleLogout} updateCredits={updateUserCredits} /> : <Navigate to="/auth" />} />
          <Route path="/project-generator" element={user ? <ProjectGeneratorPage user={user} onLogout={handleLogout} updateCredits={updateUserCredits} /> : <Navigate to="/auth" />} />
          <Route path="/english-improver" element={user ? <EnglishImproverPage user={user} onLogout={handleLogout} updateCredits={updateUserCredits} /> : <Navigate to="/auth" />} />
          <Route path="/interview-coach" element={user ? <InterviewCoachPage user={user} onLogout={handleLogout} updateCredits={updateUserCredits} /> : <Navigate to="/auth" />} />
          <Route path="/purchase" element={user ? <PurchaseCreditsPage user={user} onLogout={handleLogout} updateCredits={updateUserCredits} /> : <Navigate to="/auth" />} />
          <Route path="/history" element={user ? <HistoryPage user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
          <Route path="/profile" element={user ? <ProfilePage user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
