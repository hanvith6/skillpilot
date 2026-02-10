import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuthCallback = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing (React StrictMode)
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      // Extract session_id from URL fragment
      const hash = location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (!sessionIdMatch) {
        toast.error('Invalid authentication callback');
        navigate('/auth');
        return;
      }

      const sessionId = sessionIdMatch[1];

      try {
        // Exchange session_id for user data
        const response = await axios.post(`${API_URL}/api/auth/session`, {
          session_id: sessionId
        }, {
          withCredentials: true  // Important for cookies
        });

        // Store JWT token if needed for backward compatibility
        if (response.data.session_token) {
          localStorage.setItem('token', response.data.session_token);
        }

        // Call parent's onLogin with user data
        onLogin(response.data.session_token, response.data.user);

        toast.success('Signed in successfully!');
        
        // Navigate to dashboard with user data
        navigate('/dashboard', { 
          replace: true,
          state: { user: response.data.user }
        });
      } catch (error) {
        console.error('Session exchange failed:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/auth');
      }
    };

    processSession();
  }, [location, navigate, onLogin]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500 mx-auto mb-4"></div>
        <p className="text-slate-300 text-lg">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
