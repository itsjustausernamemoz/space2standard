import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-navy-950 text-cream-100 py-32 pb-16 border-t border-white/5">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-24">
        <div className="space-y-10">
          <Link to="/" className="text-3xl font-serif tracking-tighter hover:text-gold-500 transition-all">
            {settings.business_logo_url ? (
              <img src={settings.business_logo_url} alt={settings.business_name} className="h-12 max-w-[200px] object-contain" />
            ) : (
              <>{settings.business_name || "Space2Standard"}</>
            )}
          </Link>
          <p className="text-sm text-navy-400 leading-relaxed font-light italic">
            A premium Namibian artisan brand crafting bespoke furniture and architectural installations.
            Blending traditional craftsmanship with modern precision to perfection.
          </p>
          <div className="flex space-x-6 text-gold-500">
            <a href="#" className="hover:text-white transition-all opacity-80 hover:opacity-100"><Mail size={22} strokeWidth={1.5} /></a>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gold-500">Navigation</h3>
          <ul className="space-y-4 text-sm font-medium text-navy-400">
            <li><Link to="/" className="hover:text-gold-500 transition-all">Home</Link></li>
            <li><Link to="/products" className="hover:text-gold-500 transition-all">Collection</Link></li>
            <li><Link to="/about" className="hover:text-gold-500 transition-all">Our Story</Link></li>
            <li><Link to="/contact" className="hover:text-gold-500 transition-all">Contact Us</Link></li>
          </ul>
        </div>

        <div className="space-y-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gold-500">Studio Identity</h3>
          <ul className="space-y-6 text-sm font-medium text-navy-400">
            <li className="flex items-start gap-4 italic font-light leading-relaxed">
              <MapPin size={18} className="text-gold-500 shrink-0" strokeWidth={1.5} />
              <span className="whitespace-pre-line">{settings.business_address || "Artisan Quarter, Windhoek,\nNamibia"}</span>
            </li>
            <li className="flex items-center gap-4">
              <Phone size={18} className="text-gold-500 shrink-0" strokeWidth={1.5} />
              <span>{settings.business_phone || "+264 (81) 123 4567"}</span>
            </li>
            <li className="flex items-center gap-4">
              <Mail size={18} className="text-gold-500 shrink-0" strokeWidth={1.5} />
              <span>{settings.business_email || "studio@space2standard.com"}</span>
            </li>
          </ul>
        </div>

        <div className="space-y-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gold-500">Bespoke Circular</h3>
          <p className="text-sm text-navy-400 font-light italic">Join our artisan circle for early access to new collections and studio stories.</p>
          <div className="flex items-center relative">
            <input
              type="email"
              placeholder="Your email"
              className="bg-navy-900 border border-navy-800 outline-none p-4 pr-24 w-full text-sm text-white placeholder:text-navy-600 rounded-xl focus:border-gold-500/50 transition-all"
            />
            <button className="absolute right-4 text-[10px] font-bold uppercase tracking-widest text-gold-500 hover:text-white transition-all">
              Sign Up
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-32 pt-12 border-t border-white/5 text-center text-navy-600 text-[10px] uppercase tracking-[0.4em] font-bold">
        &copy; {new Date().getFullYear()} Space2Standard Artisan Studio. Crafted for life in Namibia.
      </div>
    </footer>
  );
};
