import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
    <div className="pt-40 pb-32 min-h-[80vh] bg-navy-950 flex items-center justify-center px-4">
      <Card variant="solid" className="bg-navy-900 border border-gold-500/10 p-10 shadow-2xl w-full max-w-md">
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-4xl font-serif text-navy-300 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Identity'}
          </h2>
          <p className="text-sm font-light text-navy-400 italic">
            {isLogin 
              ? 'Sign in to access your commissions and saved pieces.' 
              : 'Join Space2Standard for expedited checkout.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <Input 
              label="Full Name" 
              required={!isLogin} 
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
            />
          )}
          <Input 
            label="Email Address" 
            type="email" 
            required 
            placeholder="example@email.com"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <Input 
            label="Password" 
            type="password" 
            required 
            placeholder="Min 6 characters"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />

          <Button size="xl" variant="primary" className="w-full bg-gold-600 hover:bg-gold-500 text-navy-950" isLoading={loading}>
            {isLogin ? 'Sign In' : 'Register Account'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-navy-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            type="button" 
            className="text-gold-500 font-bold hover:text-gold-400 transition-colors uppercase tracking-widest text-[10px]"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Create one' : 'Sign In instead'}
          </button>
        </div>
      </Card>
    </div>
  );
};
