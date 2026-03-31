import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  if (!authLoading && user && isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if the user is actually an admin in the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        toast.error('Unauthorized. Access restricted to admin role only.');
      } else {
        toast.success(`Welcome back, ${profile.role}`);
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error signing in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal-950 px-6">
      <div className="w-full max-w-md space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif text-white tracking-widest uppercase">
            Space<span className="text-gold-500 italic">2</span>Standard
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-gold-500 font-bold">Admin Portal</p>
        </div>

        <div className="dashboard-card bg-charcoal-900/50 backdrop-blur-xl border border-charcoal-800 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-8">
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

            <button type="submit" disabled={loading} className="btn-dashboard-primary w-full shadow-lg shadow-gold-500/10">
              {loading ? 'Authenticating...' : 'Sign In'}
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
