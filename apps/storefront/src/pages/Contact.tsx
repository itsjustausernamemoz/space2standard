import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { useSettings } from '../contexts/SettingsContext';

export const Contact = () => {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate contact form submission
    setTimeout(() => {
      setLoading(false);
      toast.success('Message sent. We will respond at our earliest convenience.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  const openWhatsApp = () => {
    const fallbackNumber = '27830000000';
    const num = settings.business_phone ? settings.business_phone.replace(/\D/g, '') : fallbackNumber;
    const msg = `Hello ${settings.business_name || 'Space2Standard'}, I would like to arrange a consultation.`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="pt-40 pb-32 min-h-screen bg-navy-950">
      <div className="container mx-auto px-6">
        <header className="max-w-4xl space-y-12 mb-32">
          <div className="space-y-6">
            <span className="section-label">Get in Touch</span>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif text-navy-300 tracking-tight leading-none break-words">
              Start a <br/> Conversation.
            </h1>
          </div>
          <p className="text-xl font-light text-navy-400 leading-relaxed max-w-2xl italic">
            Whether it's a bespoke order, a collaboration, or a simple question — 
            we are here to bring excellence to your space.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-16">
            <div className="space-y-12">
               {[
                 { icon: <Mail size={24} />, label: 'Email', value: settings.business_email || 'hello@space2standard.com', sub: 'Responsive within 24 hours' },
                 { icon: <Phone size={24} />, label: 'Phone', value: settings.business_phone || '+1 (555) 123-4567', sub: 'Mon - Fri | 09:00 - 17:00' },
                 { icon: <MapPin size={24} />, label: 'Atelier', value: settings.business_address || 'Windhoek, Namibia', sub: 'Visits by appointment only' },
               ].map((item, idx) => (
                 <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-8 group"
                 >
                   <div className="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center shrink-0 text-gold-500 border border-gold-500/10 group-hover:bg-gold-500 group-hover:text-navy-950 transition-all duration-500">
                     {item.icon}
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gold-500">{item.label}</h3>
                     <p className="text-xl font-serif text-navy-300 tracking-wide whitespace-pre-line leading-relaxed">{item.value}</p>
                     <p className="text-sm font-light text-navy-500 italic font-inter">{item.sub}</p>
                   </div>
                 </motion.div>
               ))}
            </div>

            <Card className="bg-navy-900 border border-gold-500/10 text-gold-300 overflow-hidden relative group shadow-2xl">
              <div className="absolute top-0 right-0 p-8 text-gold-500 opacity-10 scale-150 group-hover:scale-125 transition-transform duration-1000">
                <MessageCircle size={120} strokeWidth={1} />
              </div>
              <div className="relative z-10 space-y-8 p-4">
                <h3 className="text-2xl font-serif tracking-wide">Instant Consultation?</h3>
                <p className="text-sm opacity-70 leading-relaxed font-light font-inter">
                  Connect directly with our master craftsmen via WhatsApp 
                  for immediate response on custom inquiries.
                </p>
                <Button onClick={openWhatsApp} variant="outline" className="border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-navy-950 px-10">
                   WhatsApp Us
                </Button>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <Card variant="solid" className="bg-navy-900/50 backdrop-blur-xl border border-gold-500/10 p-12 shadow-2xl">
               <form onSubmit={handleSubmit} className="space-y-10">
                 <div className="grid md:grid-cols-2 gap-10">
                    <Input 
                      label="Your Name" 
                      required 
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                    <Input 
                      label="Email Address" 
                      type="email" 
                      required 
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                 </div>
                 
                 <Input 
                    label="Subject" 
                    required 
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                 />

                 <Input 
                    label="Your Message" 
                    isTextArea 
                    required 
                    placeholder="Tell us about your project..."
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                 />

                 <Button size="xl" variant="primary" className="w-full group" isLoading={loading}>
                   Send Message
                   <Send size={14} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                 </Button>
               </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
