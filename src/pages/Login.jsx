import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { syncGoogleLogin, loginWithEmail, register } = useAuth();
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await register(formData.name, formData.email, formData.password);
      } else {
        await loginWithEmail(formData.email, formData.password);
      }
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during authentication.');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        if (!userInfoResponse.ok) throw new Error('Failed to fetch Google profile.');
        const userInfo = await userInfoResponse.json();
        
        await syncGoogleLogin(userInfo, tokenResponse.access_token);
        navigate('/');
      } catch (err) {
        console.error('Google login error:', err);
        // Fallback: If user info was obtained, log in locally even if sync has network issues
        setError(err.message || 'Google Sign-In failed. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Google OAuth popup error:', error);
      setError('Google Sign-In popup was closed or cancelled.');
    },
    scope: 'https://www.googleapis.com/auth/calendar.events',
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf5] px-4 font-['Plus_Jakarta_Sans']">
      <div className="w-full max-w-[400px]">
        <div className="mb-10 text-center flex flex-col items-center">
          {/* AI Generated Logo */}
          <div className="w-24 h-24 mb-6 rounded-full overflow-hidden shadow-lg border-4 border-white">
            <img src="/logo.png" alt="PantryPal Logo" className="w-full h-full object-cover" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1c19] tracking-tight leading-[1.1]">
            Make sense of<br />every <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D6A4F] to-[#74C69D]">ingredient.</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-4 font-medium">
            AI categorizes your pantry, suggests recipes, and tells you what expires.
          </p>
        </div>

        {error && <div className="mb-6 p-4 bg-error-container text-on-error-container text-sm rounded-xl border border-error/20 font-bold flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined">error</span> {error}
        </div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-[#1a1c19] text-sm font-bold mb-2">Display name</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} required={isSignUp}
                className="w-full bg-white border border-outline-variant/50 text-[#1a1c19] rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm placeholder:text-outline"
                placeholder="Alex"
              />
            </div>
          )}

          <div>
            <label className="block text-[#1a1c19] text-sm font-bold mb-2">Email</label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange} required
              className="w-full bg-white border border-outline-variant/50 text-[#1a1c19] rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm placeholder:text-outline"
              placeholder="you@domain.com"
            />
          </div>

          <div>
            <label className="block text-[#1a1c19] text-sm font-bold mb-2">Password</label>
            <input 
              type="password" name="password" value={formData.password} onChange={handleChange} required
              className="w-full bg-white border border-outline-variant/50 text-[#1a1c19] rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm placeholder:text-outline"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-[#2D6A4F] to-[#52B788] text-white font-bold py-4 px-4 rounded-xl mt-6 shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 text-lg">
            {isSignUp ? 'Create account' : 'Sign in'} <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </form>

        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-outline-variant/30"></div>
          <span className="px-4 text-xs font-bold text-outline uppercase tracking-wider">OR</span>
          <div className="flex-1 border-t border-outline-variant/30"></div>
        </div>

        <button onClick={() => googleLogin()} className="w-full bg-white border border-outline-variant/50 text-[#1a1c19] font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-neutral-50 shadow-sm active:scale-95 transition-all text-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="mt-8 text-center text-on-surface-variant text-sm font-medium">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-bold hover:underline transition-all">
            {isSignUp ? "Sign in" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}
