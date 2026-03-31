import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic-link'>('password');
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  if (!authLoading && user && isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Login: Auth success. Fetching profile for user:', data.user.id);

      // Check if the user is actually an admin in the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      console.log('Login: Profile response:', { profile, profileError });

      if (profileError) {
        console.error('Login: Profile fetch error:', profileError);
        if (profileError.code === 'PGRST116') {
          toast.error('Admin profile not found. Please run the setup SQL.');
        } else {
          toast.error(`Database error: ${profileError.message}`);
        }
        await supabase.auth.signOut();
        return;
      }

      if (profile?.role !== 'admin') {
        console.warn('Login: Unauthorized role detected:', profile?.role);
        await supabase.auth.signOut();
        toast.error(`Access Denied: Your account role is "${profile?.role}". Administrator access only.`);
      } else {
        toast.success(`Welcome session active: ${profile.role} portal.`);
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login: Auth error:', error);
      toast.error(error.message || 'Error signing in.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      
      setIsMagicLinkSent(true);
      toast.success('Confirmation email sent. Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Error sending magic link.');
    } finally {
      setLoading(false);
    }
  };

  if (isMagicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-950 px-6">
        <div className="w-full max-w-md text-center space-y-8">
          <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto border border-gold-500/20">
            <svg className="w-10 h-10 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-white tracking-wide">Check Your Email</h2>
            <p className="text-sm text-charcoal-400 leading-relaxed font-light font-inter">
              We've sent a signature login link to <span className="text-gold-300 font-medium">{email}</span>. 
              Click the link to securely access the artisan dashboard.
            </p>
          </div>
          <button 
            onClick={() => setIsMagicLinkSent(false)} 
            className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-500 hover:text-gold-400 transition"
          >
            ← Use a different method
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal-950 px-6">
      <div className="w-full max-w-md space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif text-white tracking-widest uppercase">
            Space<span className="text-gold-500 italic">2</span>Standard
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-gold-500 font-bold">Admin Portal</p>
        </div>

        <div className="dashboard-card bg-charcoal-900/50 backdrop-blur-xl border border-charcoal-800 shadow-2xl space-y-8">
          {/* Method Toggle */}
          <div className="flex bg-charcoal-950/50 p-1 rounded-lg border border-charcoal-800">
            <button 
              onClick={() => setLoginMethod('password')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
                loginMethod === 'password' ? 'bg-gold-500/10 text-gold-500' : 'text-charcoal-500 hover:text-charcoal-300'
              }`}
            >
              Password
            </button>
            <button 
              onClick={() => setLoginMethod('magic-link')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
                loginMethod === 'magic-link' ? 'bg-gold-500/10 text-gold-500' : 'text-charcoal-500 hover:text-charcoal-300'
              }`}
            >
              Confirmation Link
            </button>
          </div>

          <form onSubmit={loginMethod === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 block ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="input-base"
                placeholder="admin@space2standard.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {loginMethod === 'password' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 block ml-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="input-base"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-dashboard-primary w-full shadow-lg shadow-gold-500/10">
              {loading ? 'Authenticating...' : loginMethod === 'password' ? 'Sign In' : 'Send Login Link'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-charcoal-600 uppercase tracking-widest font-bold">
          Restricted access. Authorized admin only.
        </p>
      </div>
    </div>
  );
};
