import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Sparkles, Mail, Lock, User as UserIcon, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (!@#$%^&*)', test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
];

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'forgot'
  const [otpCode, setOtpCode] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    referral_code: ''
  });
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    return PASSWORD_RULES.map((rule) => ({
      ...rule,
      passed: rule.test(formData.password),
    }));
  }, [formData.password]);

  const allPasswordRulesPassed = passwordStrength.every((r) => r.passed);

  const handleGoogleAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      toast.error('Google authentication failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;

        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${data.session.access_token}` }
        });

        onLogin(response.data);
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        // Validate password strength
        if (!allPasswordRulesPassed) {
          toast.error('Please meet all password requirements');
          setLoading(false);
          return;
        }

        // Sign up — Supabase will send OTP email for verification
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { name: formData.name }
          }
        });

        if (error) throw error;

        // If email confirmation is required (no session returned), show OTP step
        if (!data.session) {
          setSignupEmail(formData.email);
          setStep('otp');
          toast.success('Verification code sent to your email!');
        } else {
          // Email confirmation disabled — proceed directly
          await completeSignup(data.session.access_token);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: signupEmail,
        token: otpCode,
        type: 'signup'
      });

      if (error) throw error;

      if (data.session) {
        await completeSignup(data.session.access_token);
      } else {
        throw new Error('Verification failed. Please try again.');
      }
    } catch (error) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async (accessToken) => {
    // Apply referral code if provided
    if (formData.referral_code) {
      try {
        await axios.post(`${API_URL}/api/auth/apply-referral`, {
          referral_code: formData.referral_code
        }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      } catch (refError) {
        console.error('Referral application failed:', refError);
      }
    }

    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    onLogin(response.data);
    toast.success('Account created successfully!');
    navigate('/dashboard');
  };

  const handleResendOtp = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: signupEmail,
      });
      if (error) throw error;
      toast.success('New verification code sent!');
    } catch (error) {
      toast.error('Failed to resend code. Please try again.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success('Password reset link sent! Check your email.');
      setStep('form');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Screen
  if (step === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[150px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[150px]"></div>
        </div>
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
              <Lock className="text-white w-6 h-6" />
            </div>
            <span className="text-3xl font-bold text-white">Reset Password</span>
          </div>
          <div className="glass-effect rounded-2xl p-8 border border-white/10">
            <p className="text-slate-400 text-center mb-6">
              Enter your email and we'll send you a password reset link.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="reset-email" className="text-slate-300">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-slate-950/50 border-white/10 focus:border-violet-500 text-white"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white py-6"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setStep('form')}
                className="text-slate-500 hover:text-slate-400 text-sm"
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification Screen
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[150px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[150px]"></div>
        </div>

        <div className="w-full max-w-md">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-3xl font-bold text-white">Verify Email</span>
          </div>

          <div className="glass-effect rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Check Your Email
            </h2>
            <p className="text-slate-400 text-center mb-6">
              We sent a 6-digit verification code to<br />
              <span className="text-violet-400 font-medium">{signupEmail}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <Label htmlFor="otp" className="text-slate-300">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="mt-1 bg-slate-950/50 border-white/10 focus:border-violet-500 text-white text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white py-6"
                disabled={loading || otpCode.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <button
                onClick={handleResendOtp}
                className="text-violet-400 hover:text-violet-300 text-sm"
              >
                Didn't receive the code? Resend
              </button>
              <br />
              <button
                onClick={() => { setStep('form'); setOtpCode(''); }}
                className="text-slate-500 hover:text-slate-400 text-sm"
              >
                Back to sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Auth Form
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
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
          <span className="text-3xl font-bold text-white">SkillPilot</span>
        </div>

        {/* Auth Card */}
        <div className="glass-effect rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-center mb-6">
            {isLogin ? 'Sign in to continue your journey' : 'Get 100 free credits on signup'}
          </p>

          {/* Google Button — shown first */}
          <Button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 py-6 flex items-center justify-center space-x-2 mb-4"
            data-testid="google-auth-button"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{isLogin ? 'Sign in with Google' : 'Sign up with Google'}</span>
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#020617] text-slate-400">Or with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
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
                <div>
                  <Label htmlFor="referral" className="text-slate-300">Referral Code (Optional)</Label>
                  <Input
                    id="referral"
                    type="text"
                    placeholder="SKILLPILOT-ABC123"
                    value={formData.referral_code}
                    onChange={(e) => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })}
                    className="mt-1 bg-slate-950/50 border-white/10 focus:border-violet-500 text-white"
                    data-testid="referral-input"
                  />
                  <p className="text-xs text-slate-500 mt-1">Get 20 bonus credits with a referral code!</p>
                </div>
              </>
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

              {/* Password strength — only on sign up */}
              {!isLogin && formData.password.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-slate-950/50 border border-white/5 space-y-1.5">
                  {passwordStrength.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {rule.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                      <span className={rule.passed ? 'text-emerald-400' : 'text-slate-500'}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setStep('forgot')}
                  className="text-violet-400 hover:text-violet-300 text-sm"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white py-6"
              disabled={loading || (!isLogin && !allPasswordRulesPassed)}
              data-testid="auth-submit-button"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setFormData({ ...formData, password: '' }); }}
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
