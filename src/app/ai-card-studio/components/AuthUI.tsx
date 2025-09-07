'use client'

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function AuthUI() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      // 🔧 获取完整的 session 数据
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Sign in error:', error);
        setError(error.message);
        setLoading(false);
        return;
      }
      
      // 🎯 调试登录成功的 session 数据
      console.log('🎉 Sign in successful!');
      console.log('Session data:', data.session);
      console.log('User ID:', data.session?.user?.id);
      console.log('Access Token:', data.session?.access_token ? 'Present' : 'Missing');
      console.log('Refresh Token:', data.session?.refresh_token ? 'Present' : 'Missing');
      
      // 🔧 验证 session 完整性
      if (!data.session || !data.session.user || !data.session.user.id) {
        console.error('❌ Invalid session returned:', data);
        setError('Login succeeded but session is invalid. Please try again.');
        setLoading(false);
        return;
      }
      
      // 🔧 确保 session 被正确保存
      try {
        // 手动设置 session 确保 SDK 状态一致
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        
        if (sessionError) {
          console.error('Session setting error:', sessionError);
          setError('Failed to establish session. Please try again.');
          setLoading(false);
          return;
        }
        
        console.log('✅ Session successfully set in Supabase SDK');
        
        // 🎯 验证 localStorage 存储
        setTimeout(() => {
          const storageKeys = Object.keys(localStorage).filter(key => 
            key.includes('supabase') || key.includes('auth') || key.startsWith('sb-')
          );
          console.log('📦 Auth tokens in localStorage:', storageKeys);
          
          storageKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
              try {
                const parsed = JSON.parse(value);
                console.log(`${key}:`, {
                  hasAccessToken: !!parsed.access_token,
                  hasRefreshToken: !!parsed.refresh_token,
                  expiresAt: parsed.expires_at
                });
              } catch (e) {
                console.log(`${key}: ${value.substring(0, 50)}...`);
              }
            }
          });
        }, 100);
        
        setMessage('Login successful! Loading workspace...');
        
        // 🔧 让 onAuthStateChange 有时间处理，然后完成登录
        setTimeout(() => {
          setLoading(false);
        }, 1000);
        
      } catch (sessionErr) {
        console.error('Session setup error:', sessionErr);
        setError('Failed to setup session. Please try again.');
        setLoading(false);
      }
      
    } catch (err) {
      console.error('Login process error:', err);
      setError('Login failed unexpectedly. Please try again.');
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      // 🔧 获取完整的 session 数据
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign up error:', error);
        setError(error.message);
        setLoading(false);
        return;
      }
      
      // 🎯 调试注册结果
      console.log('🎉 Sign up response:', data);
      console.log('Session:', data.session);
      console.log('User:', data.user);
      
      if (data.session && data.user) {
        // Auto sign-in successful
        console.log('✅ Auto sign-in successful with User ID:', data.user.id);
        setMessage("Account created successfully! Loading workspace...");
        
        // Let onAuthStateChange handle the workspace loading
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } else {
        // Email confirmation might be required
        setMessage("Account created successfully! Please check your email for verification.");
        setLoading(false);
      }
      
    } catch (err) {
      console.error('Sign up process error:', err);
      setError('Registration failed unexpectedly. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'sign_in') {
      handleSignIn();
    } else {
      handleSignUp();
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            AI Card Studio
          </h1>
          <p className="text-gray-600 text-sm">
            {view === 'sign_in' ? 'Sign in to your workspace' : 'Create your workspace'}
          </p>
        </div>
        
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-200" role="alert">
            {error}
          </div>
        )}
        {message && (
          <div className="p-4 text-sm text-green-700 bg-green-50/80 backdrop-blur-sm rounded-lg border border-green-200" role="alert">
            {message}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-purple-400 disabled:to-indigo-400 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            )}
            {view === 'sign_in' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        
        <div className="text-center">
          {view === 'sign_in' ? (
            <div className="text-sm text-gray-600">
              <span>Don't have an account? </span>
              <button
                onClick={() => setView('sign_up')}
                className="font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
              >
                Sign up
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <span>Already have an account? </span>
              <button
                onClick={() => setView('sign_in')}
                className="font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
