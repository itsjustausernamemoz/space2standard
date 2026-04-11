import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '../components/ScrollReveal';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success('Successfully signed in');
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.fullName },
          },
        });
        if (error) throw error;
        toast.success('Registration successful. You are now logged in.');
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-[56px] min-h-[90vh] bg-[#060b18] flex items-center justify-center px-4">
      <ScrollReveal>
        <div className="bg-[#060b18] border border-white/10 p-12 rounded-[6px] w-full max-w-md space-y-12">
          <div className="text-center space-y-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">
              {isLogin ? 'Access' : 'Account'}
            </span>
            <h2 className="text-[40px] font-serif text-white tracking-tight leading-tight">
              {isLogin ? 'Welcome Back' : 'Create Identity'}
            </h2>
            <p className="text-[14px] font-light text-[#a0a8b8] italic">
              {isLogin 
                ? 'Sign in to access your bespoke orders.' 
                : 'Join Space2Standard for expedited artisan consultation.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Full Name</label>
                <input 
                  required={!isLogin} 
                  className="input-apple"
                  placeholder="Johannes Müller"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Email Address</label>
              <input 
                type="email" 
                required 
                className="input-apple"
                placeholder="johannes@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Password</label>
              <input 
                type="password" 
                required 
                className="input-apple"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              disabled={loading}
              className="btn-apple-cta w-full py-5"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Account'}
            </button>
          </form>

          <div className="text-center pt-8 border-t border-white/5">
            <button 
              type="button" 
              className="text-[#c9a46a] font-bold hover:text-white transition-colors uppercase tracking-[0.2em] text-[10px]"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

