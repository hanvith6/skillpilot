import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuthCallback = ({ onLogin }) => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      try {
        // Check if there are OAuth tokens in the URL hash (Supabase PKCE flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');

        let session = null;

        if (accessToken) {
          // Tokens in URL hash — set the session manually
          const refreshToken = hashParams.get('refresh_token');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          session = data.session;
        } else {
          // Try exchanging code (PKCE flow) or getting existing session
          // Wait a moment for Supabase to process the URL params
          const url = new URL(window.location.href);
          const code = url.searchParams.get('code');

          if (code) {
            // PKCE flow — Supabase handles code exchange automatically
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
            session = data.session;
          } else {
            // Fallback — just get existing session
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            session = data.session;
          }
        }

        if (!session) {
          toast.error('Authentication failed. Please try again.');
          navigate('/auth');
          return;
        }

        // Fetch user profile from backend
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });

        onLogin(response.data);
        toast.success('Signed in successfully!');
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Auth callback failed:', error);
        toast.error(error.message || 'Authentication failed. Please try again.');
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate, onLogin]);

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
