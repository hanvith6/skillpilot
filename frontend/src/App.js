import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AuthCallback from './components/AuthCallback';
import DashboardPage from './pages/DashboardPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import ProjectGeneratorPage from './pages/ProjectGeneratorPage';
import EnglishImproverPage from './pages/EnglishImproverPage';
import InterviewCoachPage from './pages/InterviewCoachPage';
import PurchaseCreditsPage from './pages/PurchaseCreditsPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from './components/ui/sonner';
import { supabase } from './lib/supabase';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchProfile(session.access_token);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchProfile(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setUser(null);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  const updateUserCredits = (credits) => {
    setUser(prev => ({ ...prev, credits }));
  };

  const updateUser = (fields) => {
    setUser(prev => ({ ...prev, ...fields }));
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
          <Route path="/auth/callback" element={<AuthCallback onLogin={handleLogin} />} />
          <Route path="/dashboard" element={user ? <DashboardPage user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
          <Route path="/resume-builder" element={user ? <ResumeBuilderPage user={user} onLogout={handleLogout} updateCredits={updateUserCredits} /> : <Navigate to="/auth" />} />
          <Route path="/project-generator" element={user ? <ProjectGeneratorPage user={user} onLogout={handleLogout} updateCredits={updateUserCredits} /> : <Navigate to="/auth" />} />
          <Route path="/english-improver" element={user ? <EnglishImproverPage user={user} onLogout={handleLogout} updateCredits={updateUserCredits} /> : <Navigate to="/auth" />} />
          <Route path="/interview-coach" element={user ? <InterviewCoachPage user={user} onLogout={handleLogout} updateCredits={updateUserCredits} /> : <Navigate to="/auth" />} />
          <Route path="/purchase" element={user ? <PurchaseCreditsPage user={user} onLogout={handleLogout} updateCredits={updateUserCredits} /> : <Navigate to="/auth" />} />
          <Route path="/history" element={user ? <HistoryPage user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
          <Route path="/profile" element={user ? <ProfilePage user={user} onLogout={handleLogout} updateUser={updateUser} /> : <Navigate to="/auth" />} />
          <Route path="*" element={
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-6xl font-bold text-white mb-4">404</h1>
              <p className="text-slate-400 mb-6">Page not found</p>
              <Link to={user ? '/dashboard' : '/'} className="text-violet-400 hover:text-violet-300 underline">
                Go back home
              </Link>
            </div>
          } />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
