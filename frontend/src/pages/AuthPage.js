import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Sparkles, Mail, Lock, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      
      onLogin(response.data.token, response.data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-3xl font-bold text-white">SkillMate AI</span>
        </div>

        {/* Auth Card */}
        <div className="glass-effect rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-center mb-6">
            {isLogin ? 'Sign in to continue your journey' : 'Get 100 free credits on signup'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 bg-slate-950/50 border-white/10 focus:border-violet-500 text-white"
                    required
                    data-testid="name-input"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-slate-950/50 border-white/10 focus:border-violet-500 text-white"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 bg-slate-950/50 border-white/10 focus:border-violet-500 text-white"
                  required
                  data-testid="password-input"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white py-6"
              disabled={loading}
              data-testid="auth-submit-button"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-violet-400 hover:text-violet-300 text-sm"
              data-testid="toggle-auth-mode-button"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
