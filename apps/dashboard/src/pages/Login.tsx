import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail } from 'lucide-react';

const sfDisplay = { fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' };
const sfText    = { fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' };

export const Login = () => {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [method, setMethod]         = useState<'password' | 'magic-link'>('password');
  const [linkSent, setLinkSent]     = useState(false);

  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (!authLoading && user && isAdmin) return <Navigate to="/" replace />;

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        toast.error('Access denied — admin accounts only.');
        return;
      }
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Sign-in failed.');
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
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setLinkSent(true);
    } catch (error: any) {
      toast.error(error.message || 'Could not send link.');
    } finally {
      setLoading(false);
    }
  };

  // ── Magic link sent confirmation ──────────────────────────────────────────
  if (linkSent) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: '#060b18' }}
      >
        <div className="w-full max-w-[400px] text-center space-y-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'rgba(201,164,106,0.1)', border: '1px solid rgba(201,164,106,0.2)' }}
          >
            <Mail size={24} style={{ color: '#c9a46a' }} />
          </div>

          <div>
            <h2 style={{ ...sfDisplay, fontSize: '28px', fontWeight: 600, lineHeight: 1.14, color: '#fff', marginBottom: 8 }}>
              Check your email
            </h2>
            <p style={{ ...sfText, fontSize: '17px', lineHeight: 1.47, letterSpacing: '-0.374px', color: '#a0a8b8' }}>
              We sent a sign-in link to{' '}
              <span style={{ color: '#c9a46a' }}>{email}</span>
            </p>
          </div>

          <button
            onClick={() => setLinkSent(false)}
            style={{ ...sfText, fontSize: '14px', color: '#c9a46a', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '-0.224px' }}
          >
            ← Try a different method
          </button>
        </div>
      </div>
    );
  }

  // ── Main login ────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#060b18' }}
    >
      <div className="w-full max-w-[400px] space-y-10">

        {/* Logo + title */}
        <div className="flex flex-col items-center gap-4 text-center">
          <img src="/s2s-square.png" alt="Space2Standard" className="h-16 w-16 object-contain" />
          <div>
            <h1 style={{ ...sfDisplay, fontSize: '34px', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.374px', color: '#fff' }}>
              Space2Standard
            </h1>
            <p style={{ ...sfText, fontSize: '14px', color: '#c9a46a', letterSpacing: '-0.224px', marginTop: 4 }}>
              Admin Portal
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 space-y-8"
          style={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Method toggle — Apple segment control */}
          <div
            className="flex rounded-xl p-1"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            {(['password', 'magic-link'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                style={{
                  ...sfText,
                  flex: 1,
                  padding: '8px 0',
                  fontSize: '13px',
                  letterSpacing: '-0.12px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: method === m ? '#1a2030' : 'transparent',
                  color: method === m ? '#fff' : '#5a6070',
                  fontWeight: method === m ? 600 : 400,
                }}
              >
                {m === 'password' ? 'Password' : 'Email Link'}
              </button>
            ))}
          </div>

          <form onSubmit={method === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                style={{ ...sfText, fontSize: '12px', fontWeight: 600, letterSpacing: '-0.12px', color: '#5a6070', display: 'block' }}
              >
                Email
              </label>
              <input
                type="email"
                required
                placeholder="admin@space2standard.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  ...sfText,
                  width: '100%',
                  height: '44px',
                  padding: '0 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '17px',
                  letterSpacing: '-0.374px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(201,164,106,0.5)')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            {/* Password */}
            {method === 'password' && (
              <div className="space-y-1.5">
                <label
                  style={{ ...sfText, fontSize: '12px', fontWeight: 600, letterSpacing: '-0.12px', color: '#5a6070', display: 'block' }}
                >
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    ...sfText,
                    width: '100%',
                    height: '44px',
                    padding: '0 16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '17px',
                    letterSpacing: '-0.374px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(201,164,106,0.5)')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
            )}

            {/* Submit — Apple pill CTA */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...sfText,
                width: '100%',
                height: '50px',
                background: loading ? 'rgba(201,164,106,0.5)' : '#c9a46a',
                color: '#060b18',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '17px',
                fontWeight: 400,
                letterSpacing: '-0.374px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s ease, transform 0.1s ease',
                marginTop: 8,
              }}
              onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.background = '#fff'; }}
              onMouseLeave={e => { if (!loading) (e.target as HTMLElement).style.background = '#c9a46a'; }}
            >
              {loading
                ? 'Please wait…'
                : method === 'password'
                ? 'Sign In'
                : 'Send Sign-In Link'}
            </button>
          </form>
        </div>

        {/* Fine print */}
        <p
          className="text-center"
          style={{ ...sfText, fontSize: '12px', color: '#3a4050', letterSpacing: '-0.12px' }}
        >
          Restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
};
