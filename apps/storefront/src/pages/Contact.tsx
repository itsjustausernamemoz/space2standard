import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../lib/supabase';

const sfDisplay = { fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' };
const sfText    = { fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' };

export const Contact = () => {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('contact_messages').insert([{ ...formData, status: 'new' }]);
      if (error) throw error;
      toast.success("Message sent. We'll respond within 24 hours.");
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b18]" style={{ paddingTop: 88, paddingBottom: 100 }}>
      <div className="max-w-[860px] mx-auto px-6">

        {/* Header */}
        <div className="mb-12">
          <h1 style={{ ...sfDisplay, color: '#fff', fontSize: 34, fontWeight: 600, letterSpacing: '-0.4px' }}>Contact</h1>
          <p style={{ ...sfText, color: '#5a6070', fontSize: 14, marginTop: 6 }}>Reach out for commissions, inquiries, or to book an atelier visit.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">

          {/* Contact details */}
          <div className="lg:col-span-2 space-y-8">
            {[
              { icon: <Mail size={15} />, label: 'Email', value: settings.business_email || 'info@space2standard.com' },
              { icon: <Phone size={15} />, label: 'Phone', value: settings.business_phone || '+264 81 123 4567' },
              { icon: <MapPin size={15} />, label: 'Location', value: settings.business_address || 'Windhoek, Namibia' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid rgba(201,164,106,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a46a', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ ...sfText, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5a6070', marginBottom: 3 }}>{item.label}</p>
                  <p style={{ ...sfText, color: '#c8d0e0', fontSize: 14 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label style={{ ...sfText, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5a6070', display: 'block', marginBottom: 6 }}>Name</label>
                  <input required className="input-apple" placeholder="Your name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ ...sfText, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5a6070', display: 'block', marginBottom: 6 }}>Email</label>
                  <input required type="email" className="input-apple" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ ...sfText, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5a6070', display: 'block', marginBottom: 6 }}>Subject</label>
                <input required className="input-apple" placeholder="Commission inquiry" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
              </div>
              <div>
                <label style={{ ...sfText, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5a6070', display: 'block', marginBottom: 6 }}>Message</label>
                <textarea required rows={5} className="input-apple resize-none" placeholder="Describe what you have in mind…" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
              </div>
              <button
                disabled={loading}
                className="btn-apple-cta flex items-center gap-2"
                style={{ width: '100%', justifyContent: 'center', padding: '13px 0' }}
              >
                {loading ? 'Sending…' : 'Send Message'}
                {!loading && <Send size={14} />}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
