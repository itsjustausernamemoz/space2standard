import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStorefrontAuth } from '../contexts/StorefrontAuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const AccountSettings = () => {
  const { user, profile, loading: authLoading } = useStorefrontAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    delivery_address: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        delivery_address: profile.delivery_address || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          delivery_address: formData.delivery_address
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Your settings have been securely updated.');
    } catch (err: any) {
      toast.error(err.message || 'Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-navy-950 pt-40 px-6 text-center text-navy-400">Loading...</div>;
  if (!user) return null;

  return (
    <div className="pt-40 pb-32 min-h-[80vh] bg-navy-950 px-4">
      <div className="container mx-auto max-w-2xl">
        <header className="mb-12 text-center space-y-4">
          <span className="section-label">Identity Management</span>
          <h1 className="text-4xl md:text-5xl font-serif text-navy-300 tracking-tight leading-none">
            Account Preferences
          </h1>
          <p className="text-sm font-light text-navy-400 leading-relaxed italic">
            Keep your dispatch location up to date for instantaneous bespoke checkouts.
          </p>
        </header>

        <Card variant="solid" className="bg-navy-900 border border-gold-500/10 p-10 shadow-2xl w-full">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Input 
              label="Full Name" 
              required
              placeholder="e.g. Architect Group"
              value={formData.full_name}
              onChange={e => setFormData({...formData, full_name: e.target.value})}
            />
            
            <Input 
              label="Contact Phone" 
              placeholder="+264 81..."
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
            
            <Input 
              label="Default Delivery Address" 
              isTextArea
              className="h-24"
              placeholder="Primary site address for deliveries..."
              value={formData.delivery_address}
              onChange={e => setFormData({...formData, delivery_address: e.target.value})}
            />

            <Button size="xl" variant="primary" className="w-full bg-gold-600 hover:bg-gold-500 text-navy-950 uppercase tracking-widest font-bold" isLoading={loading}>
              Save Identity Settings
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
