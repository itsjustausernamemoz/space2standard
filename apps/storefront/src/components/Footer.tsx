import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { ScrollReveal } from './ScrollReveal';

export const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#060b18] text-[#5a6070] pt-[120px] pb-12 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 lg:gap-24 mb-24">
          {/* Brand Column */}
          <ScrollReveal>
            <div className="space-y-8">
              <Link to="/" className="text-2xl font-serif text-white tracking-tighter hover:text-[#c9a46a] transition-all">
                {settings.business_logo_url ? (
                  <img src={settings.business_logo_url} alt={settings.business_name} className="h-8 max-w-[160px] object-contain" />
                ) : (
                  <span className="flex items-center gap-1">
                    Space<span className="text-[#c9a46a]">2</span>Standard
                  </span>
                )}
              </Link>
              <p className="text-[13px] leading-[1.8] font-light italic max-w-xs">
                {settings.footer_tagline || "Crafting bespoke heirloom pieces from sustainably sourced hardwoods."}
              </p>
            </div>
          </ScrollReveal>

          {/* Navigation */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#c9a46a]">Navigation</h3>
              <ul className="space-y-4 text-[13px] font-medium">
                <li><Link to="/" className="hover:text-white transition-all">Home</Link></li>
                <li><Link to="/products" className="hover:text-white transition-all">Products</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-all">Contact</Link></li>
                <li><Link to="/order-form" className="hover:text-white transition-all">Order</Link></li>
              </ul>
            </div>
          </ScrollReveal>

          {/* Business Identity */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#c9a46a]">Business Identity</h3>
              <ul className="space-y-4 text-[13px]">
                <li className="flex items-start gap-3 hover:text-white transition-colors duration-300">
                  <MapPin size={14} className="shrink-0 mt-1 text-[#c9a46a]" />
                  <span>{settings.business_address || "Windhoek, Namibia"}</span>
                </li>
                <li className="flex items-center gap-3 hover:text-white transition-colors duration-300">
                  <Phone size={14} className="shrink-0 text-[#c9a46a]" />
                  <span>{settings.business_phone || "+264 81 000 0000"}</span>
                </li>
                <li className="flex items-center gap-3 hover:text-white transition-colors duration-300">
                  <Mail size={14} className="shrink-0 text-[#c9a46a]" />
                  <span>{settings.business_email || "business@space2standard.com"}</span>
                </li>
              </ul>
            </div>
          </ScrollReveal>

          {/* Join the Circle */}
          <ScrollReveal delay={0.3}>
            <div className="space-y-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#c9a46a]">Join the Circle</h3>
              <p className="text-[13px] leading-[1.8] italic">Join our artisan circle for early access to new collections and business stories.</p>
              <div className="flex flex-col gap-4">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="input-apple text-[13px]"
                />
                <button className="btn-apple-cta px-6 py-3 text-[10px] w-fit">
                  Subscribe
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Copyright Bar */}
        <ScrollReveal delay={0.4}>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-[#2a3040]">
            <p>&copy; 2026 Space2Standard Artisan Business. Crafted for life in Namibia.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};

