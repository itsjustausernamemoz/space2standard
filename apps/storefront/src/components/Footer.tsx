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
            {settings.footer_tagline}
          </p>
          <div className="flex space-x-6 text-gold-500">
            <a href="#" className="hover:text-navy-300 transition-all opacity-80 hover:opacity-100"><Mail size={22} strokeWidth={1.5} /></a>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gold-500">Navigation</h3>
          <ul className="space-y-4 text-sm font-medium text-navy-400">
            <li><Link to="/" className="hover:text-gold-500 transition-all">Home</Link></li>
            <li><Link to="/products" className="hover:text-gold-500 transition-all">Collection</Link></li>
            <li><Link to="/contact" className="hover:text-gold-500 transition-all">Contact Us</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gold-500">Business Identity</h3>
          <ul className="space-y-3 font-light text-navy-400">
            <li className="flex items-start gap-4 hover:text-white transition-colors duration-300">
              <MapPin size={18} className="shrink-0 mt-0.5 text-navy-500" />
              <span>{settings.business_address || "Windhoek, Namibia"}</span>
            </li>
            <li className="flex items-center gap-4 hover:text-white transition-colors duration-300">
              <Phone size={18} className="shrink-0 text-navy-500" />
              <span>{settings.business_phone || "+264 81 000 0000"}</span>
            </li>
            <li className="flex items-center gap-4 hover:text-white transition-colors duration-300">
              <Mail size={18} className="shrink-0 text-navy-500" />
              <span>{settings.business_email || "business@space2standard.com"}</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gold-500">Join the Circle</h3>
          <p className="text-sm text-navy-400 font-light italic">Join our artisan circle for early access to new collections and business stories.</p>
          <div className="flex bg-navy-950 rounded-xl p-1 shadow-inner border border-navy-800">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-transparent border-none text-white px-4 py-2 w-full focus:outline-none placeholder-navy-700 font-light text-sm"
            />
            <button className="bg-gold-500 text-navy-950 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gold-400 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-navy-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-navy-600">
        &copy; {new Date().getFullYear()} {settings.footer_copyright}
      </div>
    </footer>
  );
};
