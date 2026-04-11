import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../lib/supabase';
import { ScrollReveal } from '../components/ScrollReveal';

export const Contact = () => {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            status: 'new'
          }
        ]);

      if (error) throw error;

      toast.success(`Message sent to ${settings.business_email || 'info@space2standard.com'}. We will respond within 24 hours.`);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-[160px] pb-32 min-h-screen bg-[#060b18]">
      <div className="container mx-auto px-6">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5">
            <ScrollReveal>
              <div className="space-y-16">
                 {[
                   { icon: <Mail size={18} />, label: 'Email', value: settings.business_email || 'info@space2standard.com', sub: 'Responsive within 24 hours' },
                   { icon: <Phone size={18} />, label: 'Phone', value: settings.business_phone || '+264 81 123 4567', sub: 'Mon - Fri | 09:00 - 17:00' },
                   { icon: <MapPin size={18} />, label: 'Atelier', value: settings.business_address || 'Windhoek, Namibia', sub: 'Visits by appointment only' },
                 ].map((item, idx) => (
                   <div key={idx} className="flex gap-8 group">
                     <div className="w-12 h-12 border border-[#c9a46a]/20 rounded-full flex items-center justify-center shrink-0 text-[#c9a46a]">
                       {item.icon}
                     </div>
                     <div className="space-y-2">
                       <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">{item.label}</h3>
                       <p className="text-[20px] font-serif text-white tracking-wide">{item.value}</p>
                       <p className="text-[13px] font-light text-[#a0a8b8] italic">{item.sub}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <ScrollReveal delay={0.1}>
              <form onSubmit={handleSubmit} className="space-y-10 bg-white/[0.02] border border-white/5 p-12 rounded-[6px]">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Your Name</label>
                    <input 
                      required 
                      className="input-apple"
                      placeholder="Johannes Müller"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
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
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Subject</label>
                  <input 
                    required 
                    className="input-apple"
                    placeholder="Bespoke Commission Inquiry"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Your Message</label>
                  <textarea 
                    required 
                    rows={4}
                    className="input-apple resize-none"
                    placeholder="Share your vision for a bespoke artisan piece..."
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <button 
                  disabled={loading}
                  className="btn-apple-cta w-full py-4 flex items-center justify-center gap-3"
                >
                  {loading ? 'Sending Request...' : 'Dispatch Message'}
                  <Send size={14} />
                </button>
              </form>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </div>
  );
};

